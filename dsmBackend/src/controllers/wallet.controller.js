import { handleApiRequest, AppError } from "../utils/apiResponse.js";
import WalletService from "../services/wallteServices.js";
import { razorpay } from "../config/razorpay.js";

export default class WalletController {
  // GET /wallet  — current user's wallet
  static async getWallet(req, res) {
    return handleApiRequest(req, res, async () => {
      const wallet = await WalletService.getWallet(req.user._id);
      return [{ data: wallet }, "Wallet fetched"];
    });
  }

  // POST /wallet/topup  — { amount }
  static async topUp(req, res) {
    return handleApiRequest(req, res, async () => {
      const { amount } = req.body;
      if (!amount || amount <= 0) throw new AppError("Invalid amount", 400);

      const options = {
        amount: Math.round(Number(amount) * 100), // paise
        currency: "INR",
        receipt: `top_${String(req.user._id).slice(-8)}_${Date.now()}`,
      };

      const razorpayOrder = await razorpay.orders.create(options);

      const responseData = {
        razorpayOrderId: razorpayOrder.id,
        amount: Number(amount),
        razorpayKey: process.env.RAZORPAY_KEY_ID || '',
      };

      return [{ data: responseData }, "Razorpay top-up order created"];
    });
  }

  // POST /wallet/topup/verify  — { razorpay_payment_id, razorpay_order_id, razorpay_signature }
  static async verifyTopUp(req, res) {
    return handleApiRequest(req, res, async () => {
      const { razorpay_payment_id, razorpay_order_id, razorpay_signature } = req.body;

      if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature) {
        throw new AppError("Missing required parameters for payment verification", 400);
      }

      if (!process.env.RAZORPAY_KEY_SECRET) {
        throw new AppError("Razorpay key secret is not configured on the server", 500);
      }

      const crypto = await import("crypto");
      const expected = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET)
        .update(`${razorpay_order_id}|${razorpay_payment_id}`)
        .digest("hex");

      if (expected !== razorpay_signature) {
        throw new AppError("Invalid payment signature", 400);
      }

      // Securely fetch order details from Razorpay to verify the amount
      const rpOrder = await razorpay.orders.fetch(razorpay_order_id);
      const amountInRs = rpOrder.amount / 100;

      // Credit the wallet
      const wallet = await WalletService.topUp(req.user._id, amountInRs);

      return [{ data: wallet }, "Wallet top-up verified and credited successfully"];
    });
  }

  // GET /wallet/transactions  — paginated history
  static async getTransactions(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await WalletService.getTransactions(req.user._id, req.query);
      return [{ data: result }, "Transactions fetched"];
    });
  }

  // POST /wallet/admin/adjust  — admin credit/debit any bucket
  // Body: { userId, bucket, amount, credit, description }
  static async adminAdjust(req, res) {
    return handleApiRequest(req, res, async () => {
      const { userId, bucket, amount, credit, description } = req.body;
      if (!userId) throw new AppError("userId required", 400);

      const wallet = await WalletService.adminAdjust(userId, {
        bucket,
        amount: Number(amount),
        credit: Boolean(credit),
        description,
      });
      return [{ data: wallet }, "Wallet adjusted"];
    });
  }
}