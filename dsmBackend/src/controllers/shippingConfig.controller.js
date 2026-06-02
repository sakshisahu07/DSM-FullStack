import ShippingConfig from "../model/shippingConfig.model.js";
import { clearShippingCache } from "../utils/shippingCalculator.js";

// ─── SET / UPDATE SHIPPING CONFIG (Admin) ────────────────────────────────────
export const setShippingConfig = async (req, res) => {
  try {
    const { weightSlabs, distanceSlabs, warehousePincode, modeSurcharges, freeDeliveryThreshold } = req.body;

    let config = await ShippingConfig.findOne();
    if (!config) config = new ShippingConfig();

    if (warehousePincode !== undefined) {
      config.warehousePincode = warehousePincode;
    }

    if (weightSlabs !== undefined) {
      config.weightSlabs = weightSlabs;
    }

    if (distanceSlabs !== undefined) {
      config.distanceSlabs = distanceSlabs;
    }

    if (modeSurcharges !== undefined) {
      if (modeSurcharges.air !== undefined) config.modeSurcharges.air = modeSurcharges.air;
      if (modeSurcharges.road !== undefined) config.modeSurcharges.road = modeSurcharges.road;
    }

    // ── Free delivery thresholds ──────────────────────────────────────────
    if (freeDeliveryThreshold !== undefined) {
      if (!config.freeDeliveryThreshold) config.freeDeliveryThreshold = {};

      if (Object.prototype.hasOwnProperty.call(freeDeliveryThreshold, "road"))
        config.freeDeliveryThreshold.road = freeDeliveryThreshold.road;

      if (Object.prototype.hasOwnProperty.call(freeDeliveryThreshold, "air"))
        config.freeDeliveryThreshold.air = freeDeliveryThreshold.air;

      if (Object.prototype.hasOwnProperty.call(freeDeliveryThreshold, "both"))
        config.freeDeliveryThreshold.both = freeDeliveryThreshold.both;
    }

    config.markModified("freeDeliveryThreshold");
    config.markModified("modeSurcharges");
    await config.save();

    // Clear the cache
    clearShippingCache();

    res.json({
      success: true,
      message: "Shipping config updated",
      data: config,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ─── GET SHIPPING CONFIG (Public) ────────────────────────────────────────────
// Frontend uses this to show "Free delivery above ₹X" banners
export const getShippingConfig = async (req, res) => {
  try {
    const config = await ShippingConfig.findOne().lean();
    res.json({ success: true, data: config ?? {} });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};