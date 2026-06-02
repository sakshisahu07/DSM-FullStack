import express from "express";
import HomeController from "../controllers/home.controller.js";
import variantModel from "../model/variant.model.js";
import hotDealModel from "../model/hotDeal.model.js";
import flashSaleModel from "../model/flashSale.model.js";
import specialOfferModel from "../model/specialOffer.model.js";

const router = express.Router();

router.get("/home", HomeController.getHomePageData);

// Debug endpoint — check DB state of deals and variant flags
router.get("/home/debug", async (req, res) => {
  try {
    const now = new Date();
    const [
      totalVariants,
      hotDealVariants,
      flashSaleVariants,
      specialOfferVariants,
      hotDeals,
      flashSales,
      specialOffers,
    ] = await Promise.all([
      variantModel.countDocuments(),
      variantModel.find({ hotDeal: true }).select("_id productId disable hotDeal mrp").limit(10).lean(),
      variantModel.find({ flashSale: true }).select("_id productId disable flashSale mrp").limit(10).lean(),
      variantModel.find({ specialOffer: true }).select("_id productId disable specialOffer mrp").limit(10).lean(),
      hotDealModel.find({}).select("title isActive products variants startDate endDate").lean(),
      flashSaleModel.find({}).select("title isActive products variants startDate endDate").lean(),
      specialOfferModel.find({}).select("title isActive products variants startDate endDate").lean(),
    ]);

    res.json({
      success: true,
      debug: {
        totalVariants,
        variantsWithHotDeal: hotDealVariants.length,
        variantsWithFlashSale: flashSaleVariants.length,
        variantsWithSpecialOffer: specialOfferVariants.length,
        sampleHotDealVariants: hotDealVariants,
        sampleFlashSaleVariants: flashSaleVariants,
        hotDealsInDB: hotDeals.map(d => ({
          title: d.title,
          isActive: d.isActive,
          productsCount: d.products?.length || 0,
          variantsCount: d.variants?.length || 0,
          startDate: d.startDate,
          endDate: d.endDate,
          isExpired: d.endDate < now,
          productIds: d.products,
          variantIds: d.variants,
        })),
        flashSalesInDB: flashSales.map(d => ({
          title: d.title,
          isActive: d.isActive,
          productsCount: d.products?.length || 0,
          variantsCount: d.variants?.length || 0,
          startDate: d.startDate,
          endDate: d.endDate,
          isExpired: d.endDate < now,
          productIds: d.products,
          variantIds: d.variants,
        })),
        specialOffersInDB: specialOffers.map(d => ({
          title: d.title,
          isActive: d.isActive,
          productsCount: d.products?.length || 0,
          variantsCount: d.variants?.length || 0,
          startDate: d.startDate,
          endDate: d.endDate,
          isExpired: d.endDate < now,
          productIds: d.products,
          variantIds: d.variants,
        })),
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// Fix-flags endpoint — re-syncs variant flags from all active deals
router.post("/home/fix-flags", async (req, res) => {
  try {
    let fixed = { hotDeals: 0, flashSales: 0, specialOffers: 0 };

    // 1. Re-sync HotDeal flags on variants
    const activeHotDeals = await hotDealModel.find({ isActive: true }).lean();
    for (const deal of activeHotDeals) {
      const productIds = deal.products || [];
      const variantIds = deal.variants || [];
      if (productIds.length) {
        const r = await variantModel.updateMany(
          { productId: { $in: productIds } },
          { $set: { hotDeal: true } }
        );
        fixed.hotDeals += r.modifiedCount;
      }
      if (variantIds.length) {
        const r = await variantModel.updateMany(
          { _id: { $in: variantIds } },
          { $set: { hotDeal: true } }
        );
        fixed.hotDeals += r.modifiedCount;
      }
    }

    // 2. Re-sync FlashSale flags on variants
    const activeFlashSales = await flashSaleModel.find({ isActive: true }).lean();
    for (const sale of activeFlashSales) {
      const productIds = sale.products || [];
      const variantIds = sale.variants || [];
      if (productIds.length) {
        const r = await variantModel.updateMany(
          { productId: { $in: productIds } },
          { $set: { flashSale: true } }
        );
        fixed.flashSales += r.modifiedCount;
      }
      if (variantIds.length) {
        const r = await variantModel.updateMany(
          { _id: { $in: variantIds } },
          { $set: { flashSale: true } }
        );
        fixed.flashSales += r.modifiedCount;
      }
    }

    // 3. Re-sync SpecialOffer flags on variants
    const activeSpecialOffers = await specialOfferModel.find({ isActive: true }).lean();
    for (const offer of activeSpecialOffers) {
      const productIds = offer.products || [];
      const variantIds = offer.variants || [];
      if (productIds.length) {
        const r = await variantModel.updateMany(
          { productId: { $in: productIds } },
          { $set: { specialOffer: true } }
        );
        fixed.specialOffers += r.modifiedCount;
      }
      if (variantIds.length) {
        const r = await variantModel.updateMany(
          { _id: { $in: variantIds } },
          { $set: { specialOffer: true } }
        );
        fixed.specialOffers += r.modifiedCount;
      }
    }

    res.json({
      success: true,
      message: "Variant flags re-synced from active deals",
      fixed,
      summary: {
        activeHotDeals: activeHotDeals.length,
        activeFlashSales: activeFlashSales.length,
        activeSpecialOffers: activeSpecialOffers.length,
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
