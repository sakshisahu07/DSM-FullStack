import mongoose from "mongoose";
import crypto from "crypto";
import orderModel from "../model/order.model.js";
import cartModel from "../model/cart.model.js";
import variantModel from "../model/variant.model.js";
import comboModel from "../model/combo.model.js";
import transactionModel from "../model/transaction.model.js";
import addressModel from "../model/address.model.js";
import userModel from "../model/user.model.js";
import redisClient from "../config/redis.js";
import { razorpay } from "../config/razorpay.js";
import { AppError } from "../utils/apiResponse.js";
import WalletService from "../services/wallteServices.js";
import ReferralService from "../services/referralServices.js";
import walletTransactionModel from "../model/walletTransaction.model.js";
import { applyFreeDelivery } from "../utils/shippingHelper.js"; // ← ADDED
import { calculateOrderWeight, calculateShippingCharge } from "../utils/shippingCalculator.js";
import AffiliateService from "../services/affiliateServices.js";
import CouponService from "../services/couponServices.js";
import couponModel from "../model/coupon.model.js";
import { calculateCouponDiscount } from "../utils/couponCalculator.js";
import InvoiceService from "./invoiceServices.js";
import NotificationService from "./notificationServices.js";

/**
 * walletOption (when paymentMethod === "WALLET"):
 *   "COINS"    — deduct user's coin-balance (converted to Rs); remainder paid ONLINE
 *   "BALANCE"  — pay fully from main wallet balance; error if insufficient
 *   "REFERRAL" — use referral balance first; remainder paid ONLINE
 */

export default class OrderService {
  // ─── CREATE ORDER ──────────────────────────────────────────────────────────
  static async createOrder(
    userId,
    paymentMethod,
    addressInput,
    shippingMode = "road",
    walletOption = null,
    refToken = null,
    affiliateCode = null, 
  ) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      // ── 1. Get cart ─────────────────────────────────────────
      const cart = await cartModel.findOne({ userId }).session(session);
      if (!cart || !cart.items.length) {
        throw new AppError("Cart is empty", 400);
      }
      console.log("cart",cart);

      const orderProducts = [];
      let total = 0;

      // ── 2. Build order items ────────────────────────────────
      for (const cartItem of cart.items) {
        //  Resolve affiliate per item
        const itemAffiliate = cartItem.affiliateCode || affiliateCode || null;

        // ── COMBO ──
        if (cartItem.comboId) {
          const combo = await comboModel
            .findById(cartItem.comboId)
            .session(session);
          if (!combo) throw new AppError("Combo not found", 404);

          orderProducts.push({
            comboId: combo._id,
            itemType: "combo",
            price: combo.comboPrice,
            quantity: cartItem.quantity,
            affiliateCode: itemAffiliate, // 🟢
          });

          total += combo.comboPrice * cartItem.quantity;
        }

        // ── VARIANT ──
        else {
          const variant = await variantModel
            .findById(cartItem.variantId)
            .session(session);
          if (!variant) throw new AppError("Variant not found", 404);

          console.log("Variant",variant);

          const finalPrice = variant.finalPrice || variant.mrp;

          orderProducts.push({
            productId: variant.productId,
            variantId: variant._id,
            itemType: "variant",
            price: finalPrice,
            quantity: cartItem.quantity,
            affiliateCode: itemAffiliate, 
          });

          total += finalPrice * cartItem.quantity;
        }
      }

      // ── 3. Shipping ─────────────────────────────────────────
      const totalWeightKg = await calculateOrderWeight(orderProducts, session);
      const rawShipping = await calculateShippingCharge(totalWeightKg, shippingMode);
      const shippingCharge = await applyFreeDelivery(total, rawShipping, shippingMode);
      console.log("[ORDER] Total weight:", totalWeightKg, "kg | Shipping:", shippingCharge);

      // ── 3.5 Coupon ──────────────────────────────────────────
      let couponCode = cart.appliedCoupon || null;
      let couponDiscount = 0;

      if (couponCode) {
        try {
          const { discountAmount } = await CouponService.validateAndGetCoupon(
            couponCode,
            userId,
            total,
          );
          couponDiscount = discountAmount;
        } catch (couponErr) {
          console.error("Coupon validation failed during order creation:", couponErr.message);
          // If coupon validation fails, we proceed without the coupon
          couponCode = null;
          couponDiscount = 0;
        }
      }

      const grandTotal = total + shippingCharge - couponDiscount;

      // ── 4. Resolve referral (unchanged) ─────────────────────
      let referral = null;
      if (refToken) {
        referral = await ReferralService.resolveToken(refToken);
      }

      // ── 5. Snapshot customer info (survives user deletion) ──
      const customerUser = await userModel.findById(userId).select("firstName lastName email number").lean();
      const customerSnapshot = {
        firstName: customerUser?.firstName || null,
        lastName: customerUser?.lastName || null,
        email: customerUser?.email || null,
        phone: customerUser?.number || null,
      };

      // ── 6. Create order ─────────────────────────────────────
      const order = await orderModel.create(
        [
          {
            customerId: userId,
            customerSnapshot,
            product: orderProducts,
            orderTotal: grandTotal,
            shippingCharge,
            shippingMode,
            paymentMethod,
            paymentStatus: "UNPAID",
            referralToken: refToken ?? null,
            referrerId: referral?.referrerId ?? null,
            address: addressInput._id || addressInput,
            couponCode,
            couponDiscount,

            // fallback affiliate (optional)
            affiliateCode: affiliateCode ?? null,
          },
        ],
        { session },
      );

      const createdOrder = order[0];

      // ── 6. COD / WALLET / ONLINE flow ──────────────────────
      const isCOD = paymentMethod === "COD";
      const isWallet = paymentMethod === "WALLET";

      if (isCOD) {
        createdOrder.paymentStatus = "UNPAID";
        createdOrder.status = "ORDERED";
        await createdOrder.save({ session });

        // 🟢 MULTI-AFFILIATE COMMISSION
        for (const item of orderProducts) {
          const affCode = item.affiliateCode || affiliateCode;
          if (!affCode) continue;

          const itemAmount = item.price * item.quantity;
          await AffiliateService.recordCommission({
            affiliateCode: affCode,
            orderId: createdOrder._id,
            buyerId: userId,
            orderAmount: itemAmount,
            itemType: item.itemType,
            itemId: item.itemType === "combo" ? item.comboId : item.variantId,
          });
        }

        // 🟢 RECORD COUPON USAGE
        if (createdOrder.couponCode) {
          const coupon = await couponModel.findOne({ code: createdOrder.couponCode });
          if (coupon) {
            await CouponService.recordUsage(coupon._id, userId, createdOrder._id, createdOrder.couponDiscount);
          }
        }

        // ── Deduct stock ──
        const stockDeductions = orderProducts.map((p) => ({
          type: p.itemType,
          id: p.itemType === "combo" ? p.comboId : p.variantId,
          qty: p.quantity,
        }));
        await OrderService._deductStock(stockDeductions, session);

        // ── Clear cart ──
        await cartModel.deleteOne({ userId }).session(session);
        try {
          await redisClient.del(`cart:${userId}`);
          await redisClient.del(`products:related:cart:${userId}`);
        } catch (cacheErr) {
          console.error("Cache clear error on checkout:", cacheErr.message);
        }
      } else if (isWallet) {
        // Hybrid Wallet payment processing: priority to COINS, then main BALANCE, then remainder ONLINE via Razorpay
        const walletRes = await OrderService._processHybridWalletPayment(userId, grandTotal, createdOrder._id, session);
        createdOrder.walletDiscount = walletRes.walletDiscount;
        createdOrder.onlineAmount = walletRes.onlineAmount;

        if (walletRes.onlineAmount === 0) {
          createdOrder.paymentStatus = "PAID";
          createdOrder.status = "ORDERED";
          await createdOrder.save({ session });

          // 🟢 MULTI-AFFILIATE COMMISSION
          for (const item of orderProducts) {
            const affCode = item.affiliateCode || affiliateCode;
            if (!affCode) continue;

            const itemAmount = item.price * item.quantity;
            await AffiliateService.recordCommission({
              affiliateCode: affCode,
              orderId: createdOrder._id,
              buyerId: userId,
              orderAmount: itemAmount,
              itemType: item.itemType,
              itemId: item.itemType === "combo" ? item.comboId : item.variantId,
            });
          }

          // 🟢 RECORD COUPON USAGE
          if (createdOrder.couponCode) {
            const coupon = await couponModel.findOne({ code: createdOrder.couponCode });
            if (coupon) {
              await CouponService.recordUsage(coupon._id, userId, createdOrder._id, createdOrder.couponDiscount);
            }
          }

          // ── Deduct stock ──
          const stockDeductions = orderProducts.map((p) => ({
            type: p.itemType,
            id: p.itemType === "combo" ? p.comboId : p.variantId,
            qty: p.quantity,
          }));
          await OrderService._deductStock(stockDeductions, session);

          // ── Clear cart ──
          await cartModel.deleteOne({ userId }).session(session);
          try {
            await redisClient.del(`cart:${userId}`);
            await redisClient.del(`products:related:cart:${userId}`);
          } catch (cacheErr) {
            console.error("Cache clear error on checkout:", cacheErr.message);
          }
        } else {
          // Has online remainder!
          createdOrder.paymentStatus = "UNPAID";
          createdOrder.status = "PENDING";
          await createdOrder.save({ session });

          // Create Razorpay order for leftover remainder
          const options = {
            amount: Math.round(walletRes.onlineAmount * 100),
            currency: "INR",
            receipt: `receipt_${createdOrder._id}`.substring(0, 40),
          };

          const razorpayOrder = await razorpay.orders.create(options);

          // Create a PENDING transaction
          await transactionModel.create(
            [
              {
                orderId: createdOrder._id,
                customerId: userId,
                amount: walletRes.onlineAmount,
                currency: "INR",
                paymentMethod: "ONLINE",
                status: "PENDING",
                razorpayOrderId: razorpayOrder.id,
              },
            ],
            { session }
          );

          // Store temporary properties
          createdOrder.razorpayOrderIdTemp = razorpayOrder.id;
          createdOrder.amountTemp = walletRes.onlineAmount;
        }
      } else if (paymentMethod === "ONLINE") {
        // Create Razorpay Order
        const options = {
          amount: Math.round(grandTotal * 100),
          currency: "INR",
          receipt: `receipt_${createdOrder._id}`.substring(0, 40),
        };
        
        const razorpayOrder = await razorpay.orders.create(options);
        
        // Create a PENDING transaction
        await transactionModel.create(
          [
            {
              orderId: createdOrder._id,
              customerId: userId,
              amount: grandTotal,
              currency: "INR",
              paymentMethod: "ONLINE",
              status: "PENDING",
              razorpayOrderId: razorpayOrder.id,
            },
          ],
          { session }
        );

        // Store temporary properties
        createdOrder.razorpayOrderIdTemp = razorpayOrder.id;
        createdOrder.amountTemp = grandTotal;
      }

      await session.commitTransaction();
      session.endSession();

      await OrderService._clearOrderCache(userId);

      const orderObj = createdOrder.toObject();
      if (paymentMethod === "ONLINE" || (paymentMethod === "WALLET" && createdOrder.razorpayOrderIdTemp)) {
        orderObj.razorpayOrderId = createdOrder.razorpayOrderIdTemp;
        orderObj.onlineAmount = createdOrder.amountTemp;
        orderObj.amount = createdOrder.amountTemp;
      }

      return orderObj;
    } catch (err) {
      await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  // ─── VERIFY PAYMENT (Razorpay callback) ───────────────────────────────────
  static async verifyPayment(data) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const {
        razorpay_order_id,
        razorpay_payment_id,
        razorpay_signature,
        orderId,
      } = data;

      if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new AppError("Razorpay key secret is not configured on the server", 500);
      }

      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expected !== razorpay_signature) {
        throw new AppError("Invalid payment signature", 400);
      }

      const transaction = await transactionModel
        .findOne({ orderId, razorpayOrderId: razorpay_order_id })
        .session(session);

      // if (!transaction) throw new AppError("Transaction not found", 404);

      const order = await orderModel.findById(orderId).session(session);
      if (!order) throw new AppError("Order not found", 404);

      // update transaction
      if (transaction) {
        transaction.status = "SUCCESS";
        transaction.razorpayPaymentId = razorpay_payment_id;
        transaction.razorpaySignature = razorpay_signature;
        await transaction.save({ session });
      }

      // update order
      order.paymentStatus = "PAID";
      order.status = "ORDERED";
      order.transactionId = transaction?._id ?? null;
      await order.save({ session });

      // deduct stock
      const stockDeductions = order.product.map((p) => ({
        type: p.itemType,
        id: p.itemType === "combo" ? p.comboId : p.variantId,
        qty: p.quantity,
      }));

      await OrderService._deductStock(stockDeductions, session);

      // clear cart
      await cartModel.deleteOne({ userId: order.customerId }).session(session);
      try {
        await redisClient.del(`cart:${order.customerId}`);
        await redisClient.del(`products:related:cart:${order.customerId}`);
      } catch (cacheErr) {
        console.error("Cache clear error on verification:", cacheErr.message);
      }
// 
      // coins
      const totalCoins = await OrderService._calculateOrderCoins(order.product);

      if (totalCoins > 0) {
        await WalletService.creditCoins(
          order.customerId,
          totalCoins,
          order._id,
          session,
        );
      }

      // referral (unchanged)
      if (order.referrerId && order.referralToken) {
        const referral = await ReferralService.resolveToken(
          order.referralToken,
        );

        if (referral && referral.commissionPercent > 0) {
          const commissionAmount = parseFloat(
            ((order.orderTotal * referral.commissionPercent) / 100).toFixed(2),
          );

          await WalletService.creditReferral(
            referral.referrerId,
            commissionAmount,
            order._id,
            order.customerId,
            session,
          );

          await ReferralService.recordUse(referral._id, {
            buyerId: order.customerId,
            orderId: order._id,
            orderAmount: order.orderTotal,
            commissionPercent: referral.commissionPercent,
            commissionAmount,
          });
        }
      }

      // 🟢 RECORD COUPON USAGE
      if (order.couponCode) {
        const coupon = await couponModel.findOne({ code: order.couponCode });
        if (coupon) {
          await CouponService.recordUsage(
            coupon._id,
            order.customerId,
            order._id,
            order.couponDiscount,
          );
        }
      }
      // 🟢 GENERATE INVOICE (Background)
      InvoiceService.generateInvoice(order._id).catch(err => console.error("Auto-invoice failed:", err));

      // 🟢 MULTI-AFFILIATE COMMISSION (FINAL)
      for (const item of order.product) {
        const affCode = item.affiliateCode || order.affiliateCode;

        if (!affCode) continue;

        const itemAmount = item.price * item.quantity;

        await AffiliateService.recordCommission({
          affiliateCode: affCode,
          orderId: order._id,
          buyerId: order.customerId,
          orderAmount: itemAmount,
          itemType: item.itemType,
          itemId: item.itemType === "combo" ? item.comboId : item.variantId,
        });
      }

      await session.commitTransaction();
      session.endSession();

      await OrderService._clearOrderCache(order.customerId);

      const populatedOrder = await OrderService._populateOrder(order._id);

      return { order: populatedOrder, transaction };
    } catch (err) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      session.endSession();
      throw err;
    }
  }

  
  // ─── GET ORDERS ───────────────────────────────────────────────────────────
  static async getOrders(userId, { page = 1, limit = 10, status = null, isAdmin = false } = {}) {
    const scope = isAdmin ? "admin" : userId;
    const cacheKey = `orders:${scope}:${page}:${limit}:${status || "all"}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      console.error("Redis error in getOrders:", err.message);
    }

    // Admin sees ALL orders; regular user sees only their own
    const query = isAdmin ? {} : { customerId: userId };
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const [orders, totalOrders] = await Promise.all([
      orderModel
        .find(query)
        .populate("customerId", "firstName lastName email number")
        .populate({
          path: "address",
          populate: [
            { path: "city", select: "name" },
            { path: "state", select: "name" },
            { path: "country", select: "name" },
            { path: "pincode", select: "code" },
          ],
        })
        .populate("product.productId")
        .populate("product.variantId")
        .populate("product.comboId")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      orderModel.countDocuments(query),
    ]);

    // Merge customerSnapshot fallback when the user document has been deleted
    for (const o of orders) {
      if (!o.customerId && o.customerSnapshot) {
        o.customerId = {
          _id: null,
          firstName: o.customerSnapshot.firstName,
          lastName: o.customerSnapshot.lastName,
          email: o.customerSnapshot.email,
          number: o.customerSnapshot.phone,
        };
      }
    }

    const result = {
      orders,
      pagination: {
        totalOrders,
        totalPages: Math.ceil(totalOrders / limit),
        currentPage: page,
        limit,
      },
    };

    try {
      await redisClient.setEx(cacheKey, 300, JSON.stringify(result));
    } catch (err) {
      console.error("Redis set error in getOrders:", err.message);
    }

    return result;
  }


  static async getOrderById(orderId) {
    const order = await OrderService._populateOrder(orderId);
    if (!order) throw new AppError("Order not found", 404);
    return order;
  }

  // ─── ADMIN STATUS UPDATE ──────────────────────────────────────────────────
  static async updateStatus(orderId, status) {
    const order = await orderModel.findById(orderId);
    if (!order) throw new AppError("Order not found", 404);

    order.status = status;
    if (status === "DELIVERED") {
      order.deliveredDate = new Date();
      if (order.paymentMethod === "COD") {
        order.paymentStatus = "PAID";
      }
    }

    await order.save();
    await OrderService._clearOrderCache(order.customerId);

    // Send push & in-app status update notification to user asynchronously
    NotificationService.notifyOrderStatusUpdate(order, status).catch((err) =>
      console.error("[OrderService] Failed to send status update notification:", err.message)
    );

    return order;
  }

  // ─── CANCEL ORDER ─────────────────────────────────────────────────────────
  static async cancelOrder(orderId, userId, reason = null, isAdmin = false) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const query = isAdmin ? { _id: orderId } : { _id: orderId, customerId: userId };
      const order = await orderModel
        .findOne(query)
        .session(session);
      if (!order) throw new AppError("Order not found", 404);

      const nonCancellable = ["SHIPPED", "ARRIVING", "DELIVERED", "CANCELLED"];
      if (nonCancellable.includes(order.status)) {
        throw new AppError(`Cannot cancel order in ${order.status} state`, 400);
      }

      order.status = "CANCELLED";
      order.cancellationReason = reason;

      // ── Refund/Rollback wallet and coins ──
      const walletTxes = await walletTransactionModel
        .find({ orderId: order._id, credit: false })
        .session(session);

      if (walletTxes.length > 0) {
        const wallet = await WalletService._getOrCreate(order.customerId, session);
        for (const tx of walletTxes) {
          if (tx.bucket === "coins") {
            wallet.coins += tx.amount;
            await WalletService._log(
              {
                userId: order.customerId,
                type: "REFUND",
                bucket: "coins",
                amount: tx.amount,
                credit: true,
                orderId: order._id,
                description: `Refund of ${tx.amount} coins for cancelled order #${order._id}`,
                balanceAfter: wallet.coins,
              },
              session,
            );
          } else if (tx.bucket === "balance") {
            wallet.balance += tx.amount;
            await WalletService._log(
              {
                userId: order.customerId,
                type: "REFUND",
                bucket: "balance",
                amount: tx.amount,
                credit: true,
                orderId: order._id,
                description: `Refund of ₹${tx.amount} wallet balance for cancelled order #${order._id}`,
                balanceAfter: wallet.balance,
              },
              session,
            );
          } else if (tx.bucket === "referralBalance") {
            wallet.referralBalance += tx.amount;
            await WalletService._log(
              {
                userId: order.customerId,
                type: "REFUND",
                bucket: "referralBalance",
                amount: tx.amount,
                credit: true,
                orderId: order._id,
                description: `Refund of ₹${tx.amount} referral balance for cancelled order #${order._id}`,
                balanceAfter: wallet.referralBalance,
              },
              session,
            );
          }
        }
        await wallet.save({ session });

        // Calculate and create transaction refund record
        const coinRate = wallet.coinConversionRate ?? 100;
        const totalRefunded = walletTxes.reduce((acc, t) => acc + (t.bucket === "coins" ? t.amount / coinRate : t.amount), 0);
        await transactionModel.create(
          [
            {
              orderId: order._id,
              customerId: order.customerId,
              amount: parseFloat(totalRefunded.toFixed(2)),
              currency: "INR",
              paymentMethod: order.paymentMethod,
              status: "REFUNDED",
              walletType: "CREDIT",
              walletPurpose: "REFUND",
            },
          ],
          { session },
        );

        order.paymentStatus = "FAILED"; // Mark as refunded/failed
      } else if (order.paymentStatus === "PAID") {
        // Fallback for non-wallet paid orders (like ONLINE paid orders)
        const refundAmount = order.orderTotal;

        const wallet = await WalletService._getOrCreate(order.customerId, session);
        wallet.balance += refundAmount;
        await wallet.save({ session });

        await WalletService._log(
          {
            userId: order.customerId,
            type: "REFUND",
            bucket: "balance",
            amount: refundAmount,
            credit: true,
            orderId: order._id,
            description: `Refund of ₹${refundAmount} for cancelled order #${order._id}`,
            balanceAfter: wallet.balance,
          },
          session,
        );

        await transactionModel.create(
          [
            {
              orderId: order._id,
              customerId: order.customerId,
              amount: refundAmount,
              currency: "INR",
              paymentMethod: order.paymentMethod,
              status: "REFUNDED",
              walletType: "CREDIT",
              walletPurpose: "REFUND",
            },
          ],
          { session },
        );

        order.paymentStatus = "FAILED";
      }

      await order.save({ session });

      // Restock items only if they were actually deducted (i.e. order status was not PENDING)
      if (order.status !== "PENDING") {
        const restockData = order.product.map((p) => ({
          type: p.itemType,
          id: p.itemType === "combo" ? p.comboId : p.variantId,
          qty: p.quantity,
        }));

        await OrderService._restockItems(restockData, session);
      }

      await session.commitTransaction();
      session.endSession();

      await OrderService._clearOrderCache(order.customerId);

      // Send push & in-app cancellation notification to user asynchronously
      NotificationService.notifyOrderStatusUpdate(order, "CANCELLED").catch((err) =>
        console.error("[OrderService] Failed to send order cancellation notification:", err.message)
      );

      // 🟢 Generate CANCELLATION invoice (background — after commit)
      InvoiceService.generateInvoice(order._id, "CANCELLATION")
        .then(async (invoice) => {
          if (invoice?.pdfUrl) {
            await orderModel.findByIdAndUpdate(order._id, {
              cancellationInvoiceUrl: invoice.pdfUrl,
            });
          }
        })
        .catch((err) => console.error("Cancellation invoice failed:", err));

      return order;
    } catch (err) {
      if (session.inTransaction()) {
        await session.abortTransaction();
      }
      session.endSession();
      throw err;
    }
  }

  // ─── PRIVATE HELPERS ──────────────────────────────────────────────────────

  /**
   * Process wallet payment by deducting balance from the selected bucket.
   * Throws AppError if balance is insufficient, which aborts the mongoose transaction.
   */
  static async _processWalletPayment(userId, grandTotal, orderId, walletOption, session) {
    switch (walletOption) {
      case "BALANCE":
        await WalletService.payWithWallet(userId, grandTotal, orderId, session);
        break;

      case "COINS": {
        const { remainingToPay } = await WalletService.redeemCoins(userId, grandTotal, orderId, session);
        if (remainingToPay > 0) {
          await WalletService.payWithWallet(userId, remainingToPay, orderId, session);
        }
        break;
      }

      case "REFERRAL": {
        const { remainingToPay } = await WalletService.redeemReferral(userId, grandTotal, orderId, session);
        if (remainingToPay > 0) {
          await WalletService.payWithWallet(userId, remainingToPay, orderId, session);
        }
        break;
      }

      default:
        // Default fallback: pay fully from main wallet balance
        await WalletService.payWithWallet(userId, grandTotal, orderId, session);
        break;
    }
  }

  /**
   * Process hybrid wallet payment (priority: coins first, then main balance).
   * Deducts balances, records transaction logs, and returns { walletDiscount, onlineAmount }.
   */
  static async _processHybridWalletPayment(userId, grandTotal, orderId, session) {
    const wallet = await WalletService._getOrCreate(userId, session);

    const coinRate = wallet.coinConversionRate ?? 100;
    const coinsValueInRs = wallet.coins / coinRate;
    const mainBalance = wallet.balance;

    let coinDeductionRs = Math.min(coinsValueInRs, grandTotal);
    let coinsToDeduct = Math.ceil(coinDeductionRs * coinRate);
    let actualCoinDeductionRs = parseFloat((coinsToDeduct / coinRate).toFixed(2));
    
    // Ensure we don't deduct more than grandTotal due to rounding
    if (actualCoinDeductionRs > grandTotal) {
      coinsToDeduct = Math.floor(grandTotal * coinRate);
      actualCoinDeductionRs = parseFloat((coinsToDeduct / coinRate).toFixed(2));
    }

    const remainingAfterCoins = parseFloat((grandTotal - actualCoinDeductionRs).toFixed(2));

    let balanceDeductionRs = 0;
    if (remainingAfterCoins > 0) {
      balanceDeductionRs = Math.min(mainBalance, remainingAfterCoins);
    }

    const onlineAmount = parseFloat((remainingAfterCoins - balanceDeductionRs).toFixed(2));

    // Perform actual wallet document updates inside the session transaction
    if (coinsToDeduct > 0) {
      wallet.coins -= coinsToDeduct;
      await WalletService._log(
        {
          userId,
          type: "COIN_REDEEMED",
          bucket: "coins",
          amount: coinsToDeduct,
          credit: false,
          orderId,
          description: `Redeemed ${coinsToDeduct} coins (₹${actualCoinDeductionRs}) at checkout for order #${orderId}`,
          balanceAfter: wallet.coins,
        },
        session
      );
    }

    if (balanceDeductionRs > 0) {
      wallet.balance -= balanceDeductionRs;
      await WalletService._log(
        {
          userId,
          type: onlineAmount > 0 ? "WALLET_PARTIAL" : "WALLET_PAID",
          bucket: "balance",
          amount: balanceDeductionRs,
          credit: false,
          orderId,
          description: `${onlineAmount > 0 ? "Partial" : "Full"} wallet payment of ₹${balanceDeductionRs} for order #${orderId}`,
          balanceAfter: wallet.balance,
        },
        session
      );
    }

    if (coinsToDeduct > 0 || balanceDeductionRs > 0) {
      await wallet.save({ session });
    }

    const walletDiscount = parseFloat((actualCoinDeductionRs + balanceDeductionRs).toFixed(2));

    return {
      walletDiscount,
      onlineAmount,
    };
  }

  /**
   * Deduct stock for an array of { type, id, qty } entries.
   * Supports both variant and combo.
   */

  
  static async _deductStock(deductions, session) {
    for (const d of deductions) {
      if (d.type === "combo") {
        const updated = await comboModel.findOneAndUpdate(
          { _id: d.id, stock: { $gte: d.qty } },
          { $inc: { stock: -d.qty } },
          { session, new: true },
        );
        if (!updated)
          throw new AppError("Combo stock insufficient at checkout", 400);
      } else {
        const updated = await variantModel.findOneAndUpdate(
          { _id: d.id, stock: { $gte: d.qty } },
          { $inc: { stock: -d.qty } },
          { session, new: true },
        );
        if (!updated)
          throw new AppError("Variant stock insufficient at checkout", 400);
      }
    }
  }

  /**
   * Restock items after cancellation
   */
  static async _restockItems(restockData, session) {
    for (const d of restockData) {
      if (d.type === "combo") {
        await comboModel.findByIdAndUpdate(
          d.id,
          { $inc: { stock: d.qty } },
          { session },
        );
      } else {
        await variantModel.findByIdAndUpdate(
          d.id,
          { $inc: { stock: d.qty } },
          { session },
        );
      }
    }
  }

  /**
   * Sum up coins to award from order items.
   * Requires populated variant/combo docs — we re-fetch lean here.
   */
  static async _calculateOrderCoins(orderProducts) {
    let total = 0;
    for (const p of orderProducts) {
      if (p.itemType === "combo") {
        const combo = await comboModel
          .findById(p.comboId)
          .select("coinsReward")
          .lean();
        total += (combo?.coinsReward ?? 0) * p.quantity;
      } else {
        const variant = await variantModel
          .findById(p.variantId)
          .select("coinsReward")
          .lean();
        total += (variant?.coinsReward ?? 0) * p.quantity;
      }
    }
    return total;
  }

  /**
   * Populate a fully resolved order for the API response.
   */
  static async _populateOrder(orderId) {
    const order = await orderModel
      .findById(orderId)
      .populate({
        path: "address",
        select: "street city state country pincode",
        populate: [
          { path: "city", select: "name" },
          { path: "state", select: "name" },
          { path: "country", select: "name" },
          { path: "pincode", select: "code" },
        ],
      })
      .populate("product.productId", "name icon")
      .populate("product.variantId", "mrp finalPrice discount size")
      .populate("product.comboId", "name icon comboPrice")
      .lean();

    // flatten address
    const addr = order?.address ?? {};
    order.address = {
      street: addr.street ?? null,
      city: addr.city?.name ?? null,
      state: addr.state?.name ?? null,
      country: addr.country?.name ?? null,
      pincode: addr.pincode?.code ?? null,
    };

    return order;
  }

  /**
   * Wallet transactions created before the order _id existed get null orderId.
   * This patches them after commit.
   */
  static async _patchOrderId(userId, orderId, session) {
    await walletTransactionModel.updateMany(
      {
        userId,
        orderId: null,
        createdAt: { $gte: new Date(Date.now() - 60_000) },
      },
      { $set: { orderId } },
      { session },
    );
  }

  static async _clearOrderCache(userId) {
    try {
      // Clear user's orders cache
      const userKeys = await redisClient.keys(`orders:${userId}:*`);
      if (userKeys.length > 0) {
        await redisClient.del(userKeys);
      }

      // Clear admin orders cache
      const adminKeys = await redisClient.keys("orders:admin:*");
      if (adminKeys.length > 0) {
        await redisClient.del(adminKeys);
      }

      // Clear admin dashboard cache
      const dashboardKeys = await redisClient.keys("dashboard:admin:full:*");
      if (dashboardKeys.length > 0) {
        await redisClient.del(dashboardKeys);
      }
    } catch (err) {
      console.error("Redis clear error in _clearOrderCache:", err.message);
    }
  }

  // ─── RETURN ORDER ─────────────────────────────────────────────────────────
  static async requestReturn(orderId, userId, reason, media) {
    const order = await orderModel.findOne({ _id: orderId, customerId: userId });
    
    if (!order) throw new AppError("Order not found", 404);
    if (order.status !== "DELIVERED") throw new AppError("Order must be delivered to request a return", 400);

    const returnStatuses = ["RETURN_REQUESTED", "RETURN_APPROVED", "RETURN_REJECTED", "RETURNED"];
    if (returnStatuses.includes(order.status)) throw new AppError("Return already requested", 400);

    let maxReturnDays = 0;
    const productIds = order.product.map(p => p.productId).filter(Boolean);
    if (productIds.length > 0) {
      const productModel = (await import("../model/product.model.js")).default;
      const products = await productModel.find({ _id: { $in: productIds } }).lean();
      products.forEach(p => {
         if (p.returnInDays > maxReturnDays) maxReturnDays = p.returnInDays;
      });
    }

    if (maxReturnDays === 0) {
      throw new AppError("Items in this order are non-returnable", 400);
    }

    if (!order.deliveredDate) {
      throw new AppError("Delivered date is missing", 400);
    }

    const diffTime = Math.abs(new Date() - order.deliveredDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > maxReturnDays) {
      throw new AppError(`Return window of ${maxReturnDays} days has expired`, 400);
    }

    order.status = "RETURN_REQUESTED";
    order.returnReason = reason;
    order.returnMedia = media || [];

    await order.save();
    await OrderService._clearOrderCache(userId);

    return order;
  }

  // ─── UPDATE RETURN STATUS (Admin) ─────────────────────────────────────────
  static async updateReturnStatus(orderId, status, adminReason = null) {
    const session = await mongoose.startSession();
    session.startTransaction();

    let refundAmount = 0;

    try {
      const order = await orderModel.findById(orderId).session(session);
      if (!order) {
        throw new AppError("Order not found", 404);
      }

      const returnStatuses = ["RETURN_REQUESTED", "RETURN_APPROVED"];
      if (!returnStatuses.includes(order.status)) {
        throw new AppError("Valid return request not found or already processed", 400);
      }

      const validStatuses = ["RETURN_APPROVED", "RETURN_REJECTED", "RETURNED"];
      if (!validStatuses.includes(status)) {
        throw new AppError("Invalid return status. Use RETURN_APPROVED, RETURN_REJECTED, or RETURNED.", 400);
      }

      order.status = status;

      if (status === "RETURN_REJECTED") {
        if (!adminReason) throw new AppError("Reason is required for rejection", 400);
        order.returnAdminReason = adminReason;
      } else if (status === "RETURNED") {
        // Trigger Refund
        refundAmount = order.orderTotal;

        const wallet = await WalletService._getOrCreate(order.customerId, session);
        wallet.balance += refundAmount;
        await wallet.save({ session });

        await WalletService._log({
          userId: order.customerId,
          type: "REFUND",
          bucket: "balance",
          amount: refundAmount,
          credit: true,
          orderId: order._id,
          description: `Refund of ₹${refundAmount} for returned order #${order._id}`,
          balanceAfter: wallet.balance,
        }, session);

        await transactionModel.create([{
          orderId: order._id,
          customerId: order.customerId,
          amount: refundAmount,
          currency: "INR",
          paymentMethod: "WALLET",
          status: "REFUNDED",
          walletType: "CREDIT",
          walletPurpose: "REFUND"
        }], { session });

        const restockData = order.product.map((p) => ({
          type: p.itemType,
          id: p.itemType === "combo" ? p.comboId : p.variantId,
          qty: p.quantity,
        }));
        await OrderService._restockItems(restockData, session);
      }

      await order.save({ session });
      await session.commitTransaction();
      session.endSession();

      await OrderService._clearOrderCache(order.customerId);

      const NotificationService = (await import("./notificationServices.js")).default;
      if (status === "RETURN_APPROVED") {
        NotificationService.sendToUser(order.customerId, {
          title: "Return Approved ✅",
          message: `Your return request for order #${order._id} is approved. Product will be picked up within 5 days.`,
          type: "RETURN_APPROVED",
          orderId: order._id
        });
      } else if (status === "RETURN_REJECTED") {
        NotificationService.sendToUser(order.customerId, {
          title: "Return Rejected ❌",
          message: `Your return request for order #${order._id} was rejected. Reason: ${adminReason}`,
          type: "RETURN_REJECTED",
          orderId: order._id
        });
      } else if (status === "RETURNED") {
        NotificationService.sendToUser(order.customerId, {
          title: "Refund Processed 💰",
          message: `Your returned item is received. ₹${refundAmount} has been added to your wallet!`,
          type: "REFUND_PROCESSED",
          orderId: order._id
        });
      }

      return order;
    } catch (err) {
      if (session.inTransaction()) await session.abortTransaction();
      session.endSession();
      throw err;
    }
  }

  // ─── INITIATE PAYMENT FOR EXISTING PENDING ORDER ────────────────────────
  static async initiatePayment(orderId, userId) {
    const order = await orderModel.findOne({ _id: orderId, customerId: userId });
    if (!order) {
      throw new AppError("Order not found", 404);
    }

    if (order.paymentStatus === "PAID") {
      throw new AppError("Order is already paid", 400);
    }

    // Find any existing pending transaction
    let transaction = await transactionModel.findOne({ orderId, status: "PENDING" });
    let razorpayOrderId = transaction?.razorpayOrderId;

    if (!razorpayOrderId) {
      // Create a brand new Razorpay order
      const options = {
        amount: Math.round(order.orderTotal * 100),
        currency: "INR",
        receipt: `receipt_${order._id}`,
      };

      const razorpayOrder = await razorpay.orders.create(options);
      razorpayOrderId = razorpayOrder.id;

      if (transaction) {
        transaction.razorpayOrderId = razorpayOrderId;
        await transaction.save();
      } else {
        await transactionModel.create({
          orderId: order._id,
          customerId: userId,
          amount: order.orderTotal,
          currency: "INR",
          paymentMethod: "ONLINE",
          status: "PENDING",
          razorpayOrderId,
        });
      }
    }

    // Prefill customer contact details
    const customerUser = await userModel.findById(userId).select("firstName lastName email number").lean();

    return {
      orderId: order._id,
      razorpayOrderId,
      amount: order.orderTotal,
      prefill: {
        name: `${customerUser?.firstName || ''} ${customerUser?.lastName || ''}`,
        email: customerUser?.email || '',
        contact: customerUser?.number || '',
      }
    };
  }
}
