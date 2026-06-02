import mongoose from "mongoose";

const weightSlabSchema = new mongoose.Schema(
  {
    minWeight: { type: Number, required: true }, // kg (inclusive)
    maxWeight: { type: Number, required: true }, // kg (exclusive)
    charge: { type: Number, required: true },    // ₹ base charge for this slab
  },
  { _id: true },
);

const distanceSlabSchema = new mongoose.Schema(
  {
    minDistance: { type: Number, required: true }, // km (inclusive)
    maxDistance: { type: Number, required: true }, // km (exclusive)
    charge: { type: Number, required: true },      // ₹ distance charge for this slab
  },
  { _id: true },
);

const shippingConfigSchema = new mongoose.Schema(
  {
    // ── Warehouse Origin ─────────────────────────────────────────────────
    warehousePincode: { type: String, default: "462022" }, // default Bhopal pin

    // ── Weight-based shipping slabs ──────────────────────────────────────
    weightSlabs: {
      type: [weightSlabSchema],
      default: [],
    },

    // ── Distance-based shipping slabs ────────────────────────────────────
    distanceSlabs: {
      type: [distanceSlabSchema],
      default: [],
    },

    // ── Shipping mode surcharges (added on top of slab charge) ───────────
    modeSurcharges: {
      air: { type: Number, default: 150 },
      road: { type: Number, default: 100 },
    },

    // ── Free delivery thresholds ─────────────────────────────────────────
    // If productTotal >= threshold, shippingCharge is waived (₹0)
    // Priority: mode-specific (air/road) > both > null (disabled)
    freeDeliveryThreshold: {
      road: { type: Number, default: null }, // null = disabled for road
      air: { type: Number, default: null },  // null = disabled for air
      both: { type: Number, default: null }, // null = disabled for both (fallback)
    },
  },
  { timestamps: true },
);

export default mongoose.model("shippingConfig", shippingConfigSchema);