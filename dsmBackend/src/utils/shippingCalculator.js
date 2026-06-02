import ShippingConfig from "../model/shippingConfig.model.js";

/**
 * In-memory cache for shipping config to avoid hitting DB on every request.
 * TTL: 60 seconds — changes made by admin will reflect within a minute.
 */
let _cache = null;
let _cacheExpiry = 0;
const CACHE_TTL_MS = 60_000; // 60 seconds

async function getConfig() {
  const now = Date.now();
  if (_cache && now < _cacheExpiry) return _cache;

  const config = await ShippingConfig.findOne().lean();
  _cache = config;
  _cacheExpiry = now + CACHE_TTL_MS;
  return config;
}

/** Force-clear cache (call after admin updates) */
export function clearShippingCache() {
  _cache = null;
  _cacheExpiry = 0;
}

/**
 * Convert weight to KG (same logic as cartCalculator)
 */
const toKg = (value, unit) => {
  if (!value) return 0;
  switch (unit) {
    case "g": return value / 1000;
    case "kg": return value;
    case "lb": return value * 0.453592;
    default: return value;
  }
};

/**
 * Find the matching weight slab for a given weight.
 * Slabs are checked in order: minWeight <= weight < maxWeight
 * If weight exceeds all slabs, the last (highest) slab is used.
 * If no slabs exist, returns 0.
 */
function findSlabCharge(slabs, weightKg) {
  if (!slabs || slabs.length === 0) return 0;

  // Sort ascending by minWeight just in case
  const sorted = [...slabs].sort((a, b) => a.minWeight - b.minWeight);

  for (const slab of sorted) {
    if (weightKg >= slab.minWeight && weightKg < slab.maxWeight) {
      return slab.charge;
    }
  }

  // If weight exceeds all slabs, use the last (highest) slab
  return sorted[sorted.length - 1].charge;
}

/**
 * Find the matching distance slab charge.
 */
function findDistanceCharge(slabs, distanceKm) {
  if (!slabs || slabs.length === 0) return 0;

  const sorted = [...slabs].sort((a, b) => a.minDistance - b.minDistance);

  // If distance is less than the first slab's minimum, no distance charge applies.
  if (distanceKm < sorted[0].minDistance) {
    return 0;
  }

  for (const slab of sorted) {
    if (distanceKm >= slab.minDistance && distanceKm < slab.maxDistance) {
      return slab.charge;
    }
  }

  // If it exceeds all slabs, apply the highest slab charge
  return sorted[sorted.length - 1].charge;
}

/**
 * Get latitude and longitude from a pincode using OpenStreetMap Nominatim API.
 */
async function getCoordinates(pincode) {
  if (!pincode) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/search?postalcode=${encodeURIComponent(pincode)}&country=India&format=json&limit=1`;
    const response = await fetch(url, { headers: { 'User-Agent': 'DSMElectro/1.0' } });
    const data = await response.json();
    if (data && data.length > 0) {
      return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    }
  } catch (err) {
    console.error(`[SHIPPING] Failed to geocode pincode ${pincode}:`, err);
  }
  return null;
}

/**
 * Calculate Haversine distance in km between two coordinates.
 */
function getDistance(coord1, coord2) {
  if (!coord1 || !coord2) return 0;
  const toRad = (value) => (value * Math.PI) / 180;
  const R = 6371; // Earth radius in km

  const dLat = toRad(coord2.lat - coord1.lat);
  const dLon = toRad(coord2.lon - coord1.lon);

  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
            Math.cos(toRad(coord1.lat)) * Math.cos(toRad(coord2.lat)) *
            Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

/**
 * Calculate shipping charge based on total weight and shipping mode.
 *
 * @param {number} totalWeightKg  — total order weight in kg
 * @param {"air"|"road"} mode     — shipping mode
 * @returns {Promise<number>}     — shipping charge (slab + mode surcharge)
 */
export async function calculateShippingCharge(totalWeightKg, mode = "road", destPincode = null) {
  const config = await getConfig();

  let distanceKm = 0;
  let distanceCharge = 0;

  // Calculate Distance Charge if pincode is provided
  console.log(`[SHIPPING] Origin Pin: ${config?.warehousePincode}, Dest Pin: ${destPincode}, Slabs: ${config?.distanceSlabs?.length}`);
  if (destPincode && config?.warehousePincode && config?.distanceSlabs?.length > 0) {
    const originCoords = await getCoordinates(config.warehousePincode);
    const destCoords = await getCoordinates(destPincode);
    console.log(`[SHIPPING] Origin Coords:`, originCoords, `Dest Coords:`, destCoords);
    
    if (originCoords && destCoords) {
      distanceKm = getDistance(originCoords, destCoords);
      distanceCharge = findDistanceCharge(config.distanceSlabs, distanceKm);
    }
  }

  const slabCharge = findSlabCharge(config?.weightSlabs, totalWeightKg);
  const modeSurcharge = config?.modeSurcharges?.[mode] ?? 0;
  
  // Total = Weight Base + Mode Surcharge + Distance Charge
  const total = slabCharge + modeSurcharge + distanceCharge;

  console.log(
    `[SHIPPING] Weight: ${totalWeightKg} kg | Distance: ${distanceKm.toFixed(2)} km | Slab: ₹${slabCharge} | Mode (${mode}): ₹${modeSurcharge} | Dist Charge: ₹${distanceCharge} | Total: ₹${total}`
  );

  return total;
}

/**
 * Calculate total weight of order items (variants + combos) in kg.
 *
 * @param {Array} orderProducts — array of { variantId, comboId, quantity, itemType }
 * @param {import("mongoose").ClientSession} [session]
 * @returns {Promise<number>} weight in kg
 */
export async function calculateOrderWeight(orderProducts, session = null) {
  // Lazy-import models to avoid circular deps
  const { default: variantModel } = await import("../model/variant.model.js");
  const { default: comboModel } = await import("../model/combo.model.js");

  let totalKg = 0;

  for (const item of orderProducts) {
    if (item.itemType === "combo" && item.comboId) {
      const combo = await comboModel
        .findById(item.comboId)
        .select("weight")
        .session(session)
        .lean();
      if (combo?.weight?.value) {
        totalKg += toKg(combo.weight.value, combo.weight.unit) * (item.quantity || 1);
      }
    } else if (item.variantId) {
      const variant = await variantModel
        .findById(item.variantId)
        .select("weight")
        .session(session)
        .lean();
      if (variant?.weight?.value) {
        totalKg += toKg(variant.weight.value, variant.weight.unit) * (item.quantity || 1);
      }
    }
  }

  return parseFloat(totalKg.toFixed(3));
}

/**
 * Get the full shipping config (for frontend display).
 */
export async function getShippingConfigData() {
  return await getConfig();
}
