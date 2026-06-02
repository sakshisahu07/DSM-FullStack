/**
 * Convert weight to KG
 */
const convertToKg = (value, unit) => {
  if (!value) return 0;

  switch (unit) {
    case "g":
      return value / 1000;
    case "kg":
      return value;
    case "lb":
      return value * 0.453592;
    default:
      return value;
  }
};

/**
 * Always returns BOTH air and road shipping totals.
 * Now async — fetches dynamic shipping charges from ShippingConfig.
 */
import { calculateCouponDiscount } from "./couponCalculator.js";
import { calculateShippingCharge } from "./shippingCalculator.js";

export const calculateCartSummary = async (cartItems, coupon = null, destPincode = null) => {
  let totalMRP = 0;
  let totalFinal = 0;
  let totalQuantity = 0;
  let totalWeight = 0;

  const items = cartItems.map((item) => {
    let qty = item.quantity;
    let isAvailable = true;
    let message = "";

    const isCombo = item.itemType === "combo";
    const source = isCombo ? item.comboId : item.variantId;

    // ── availability ──
    if (!source) {
      isAvailable = false;
      message = isCombo ? "Combo not found" : "Variant not found";
      qty = 0;
    } else if (source.disable) {
      isAvailable = false;
      message = isCombo ? "Combo disabled" : "Product disabled";
      qty = 0;
    } else if ((source.stock ?? 0) === 0) {
      isAvailable = false;
      message = "Out of stock";
      qty = 0;
    } else if (source.stock < qty) {
      message = `Only ${source.stock} left`;
      qty = source.stock;
    }

    // ── price ──
    const itemMRP = (item.mrp || 0) * qty;
    const itemFinal = (item.finalPrice || 0) * qty;
    const saving = itemMRP - itemFinal;

    // ── weight ──
    let weight = 0;
    if (source?.weight?.value) {
      const weightInKg = convertToKg(source.weight.value, source.weight.unit);
      weight = weightInKg * qty;
    }

    // ── totals ──
    totalMRP += itemMRP;
    totalFinal += itemFinal;
    totalQuantity += qty;
    totalWeight += weight;

    return {
      ...item,
      quantity: qty,
      itemMRP,
      itemFinal,
      saving,
      weight: {
        value: parseFloat(weight.toFixed(2)),
        unit: "kg",
      },
      isAvailable,
      message,
      availableStock: source?.stock ?? 0,
    };
  });

  const productSavings = totalMRP - totalFinal;

  // ── Apply Coupon ──
  let couponDiscount = 0;
  if (coupon) {
    couponDiscount = calculateCouponDiscount(coupon, totalFinal);
  }

  const finalTotalWithCoupon = totalFinal - couponDiscount;
  const parsedWeight = parseFloat(totalWeight.toFixed(2));

  // ── Dynamic shipping charges from ShippingConfig ──
  const airCharge = await calculateShippingCharge(parsedWeight, "air", destPincode);
  const roadCharge = await calculateShippingCharge(parsedWeight, "road", destPincode);

  return {
    items,
    summary: {
      totalItems: items.length,
      totalQuantity,
      totalMRP,
      totalProductFinal: totalFinal,
      totalProductSaving: productSavings,

      couponCode: coupon?.code || null,
      couponDiscount: couponDiscount,

      subTotal: finalTotalWithCoupon, // Total after product discounts AND coupon

      totalWeight: parsedWeight,

      shipping: {
        air: {
          charge: airCharge,
          totalPayable: finalTotalWithCoupon + airCharge,
        },
        road: {
          charge: roadCharge,
          totalPayable: finalTotalWithCoupon + roadCharge,
        },
      },
    },
  };
};