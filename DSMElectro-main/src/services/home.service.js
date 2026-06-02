import mongoose from "mongoose";
import categoryModel from "../model/category.model.js";
import variantModel from "../model/variant.model.js";
import productModel from "../model/product.model.js";
import comboModel from "../model/combo.model.js";
import hotDealModel from "../model/hotDeal.model.js";
import flashSaleModel from "../model/flashSale.model.js";
import specialOfferModel from "../model/specialOffer.model.js";
import redisClient from "../config/redis.js";

// ─── Helper: fetch products + variants for a deal's productIds & variantIds ──
async function fetchDealItems(productIds = [], variantIds = [], discountValue = 0, discountType = "percentage") {
  const results = [];

  // Fetch variants directly listed in the deal
  if (variantIds.length) {
    const variants = await variantModel
      .find({ _id: { $in: variantIds }, disable: false })
      .populate("productId", "name avgRating totalRatings icon images slug categoryId subCategoryId brandId")
      .populate("category", "title")
      .populate("subCategory", "title")
      .lean();

    for (const v of variants) {
      if (!v.productId?.name) continue;
      const mrp = v.mrp || 0;
      let price = v.finalPrice ?? mrp;
      let discount = v.discount ?? 0;

      // If no discount applied yet, calculate from deal
      if (!discount && discountValue && mrp > 0) {
        if (discountType === "percentage") {
          discount = discountValue;
          price = Math.round(mrp - (mrp * discountValue) / 100);
        } else {
          price = Math.max(0, mrp - discountValue);
          discount = Math.round((discountValue / mrp) * 100);
        }
      }

      results.push({
        _id: v.productId._id,
        variantId: v._id,
        name: v.productId.name,
        avgRating: v.productId.avgRating,
        totalRatings: v.productId.totalRatings,
        icon: v.productId.icon,
        images: v.productId.images,
        slug: v.productId.slug,
        categoryId: v.productId.categoryId || v.category?._id,
        subCategoryId: v.productId.subCategoryId || v.subCategory?._id,
        brandId: v.productId.brandId,
        categoryName: v.category?.title,
        subCategoryName: v.subCategory?.title,
        mrp,
        price,
        discount,
      });
    }
  }

  // Fetch all variants belonging to listed products
  if (productIds.length) {
    const variants = await variantModel
      .find({ productId: { $in: productIds }, disable: false })
      .populate("productId", "name avgRating totalRatings icon images slug categoryId subCategoryId brandId")
      .populate("category", "title")
      .populate("subCategory", "title")
      .lean();

    // Group by product — only take first variant per product
    const seen = new Set(results.map(r => r._id.toString()));
    const byProduct = new Map();
    for (const v of variants) {
      if (!v.productId?.name) continue;
      const pid = v.productId._id.toString();
      if (!byProduct.has(pid)) byProduct.set(pid, v);
    }

    for (const [pid, v] of byProduct) {
      if (seen.has(pid)) continue;
      seen.add(pid);

      const mrp = v.mrp || 0;
      let price = v.finalPrice ?? mrp;
      let discount = v.discount ?? 0;

      if (!discount && discountValue && mrp > 0) {
        if (discountType === "percentage") {
          discount = discountValue;
          price = Math.round(mrp - (mrp * discountValue) / 100);
        } else {
          price = Math.max(0, mrp - discountValue);
          discount = Math.round((discountValue / mrp) * 100);
        }
      }

      results.push({
        _id: v.productId._id,
        variantId: v._id,
        name: v.productId.name,
        avgRating: v.productId.avgRating,
        totalRatings: v.productId.totalRatings,
        icon: v.productId.icon,
        images: v.productId.images,
        slug: v.productId.slug,
        categoryId: v.productId.categoryId || v.category?._id,
        subCategoryId: v.productId.subCategoryId || v.subCategory?._id,
        brandId: v.productId.brandId,
        categoryName: v.category?.title,
        subCategoryName: v.subCategory?.title,
        mrp,
        price,
        discount,
      });
    }
  }

  return results;
}

// ─── Helper: get ALL deals from admin (regardless of active/date status) ──────
// This ensures whatever admin adds always shows on the website
async function getActiveDeals(Model) {
  return Model.find({}).lean();
}

export default class HomeService {
  static async getHomePageData(query) {
    const { category, page, limit } = query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Cache key specific to requested page, limit and category
    const cacheKey = `home:data:cat_${category || "all"}:page_${pageNum}:limit_${limitNum}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) { /* skip cache on error */ }

    const productMatch = { disable: false };
    const comboMatch = { disable: false };

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      const catId = new mongoose.Types.ObjectId(category);
      comboMatch.categories = catId;
      productMatch.categoryId = catId;
    }

    // ── Fetch deal models directly (no variant flag dependency) ──────────────
    const [hotDealDocs, flashSaleDocs, specialOfferDocs] = await Promise.all([
      getActiveDeals(hotDealModel),
      getActiveDeals(flashSaleModel),
      getActiveDeals(specialOfferModel),
    ]);

    // Collect all productIds and variantIds from each deal type
    const collectIds = (docs) => {
      const productIds = new Set();
      const variantIds = new Set();
      for (const doc of docs) {
        (doc.products || []).forEach(id => productIds.add(id));
        (doc.variants || []).forEach(id => variantIds.add(id));
      }
      return {
        productIds: [...productIds],
        variantIds: [...variantIds],
        discountValue: docs[0]?.discountValue || 0,
        discountType: docs[0]?.discountType || "percentage",
      };
    };

    const hotDealIds = collectIds(hotDealDocs);
    const flashSaleIds = collectIds(flashSaleDocs);
    const specialOfferIds = collectIds(specialOfferDocs);

    // ── Parallel fetch: deals + categories + newArrivals + trending + combos + products ──
    const newArrivalsPipeline = [
      { $match: productMatch },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      { $lookup: { from: "variants", localField: "_id", foreignField: "productId", as: "variants" } },
      { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categoryDoc" } },
      { $lookup: { from: "subcategories", localField: "subCategoryId", foreignField: "_id", as: "subCategoryDoc" } },
      {
        $project: {
          name: 1, avgRating: 1, totalRatings: 1, icon: 1, images: 1, slug: 1,
          categoryId: 1, subCategoryId: 1, brandId: 1,
          variantId: { $arrayElemAt: ["$variants._id", 0] },
          categoryName: { $arrayElemAt: ["$categoryDoc.title", 0] },
          subCategoryName: { $arrayElemAt: ["$subCategoryDoc.title", 0] },
          mrp: { $arrayElemAt: ["$variants.mrp", 0] },
          price: { $arrayElemAt: ["$variants.finalPrice", 0] },
          discount: { $arrayElemAt: ["$variants.discount", 0] },
        }
      }
    ];

    const trendingPipeline = [
      { $match: { ...productMatch, trending: true } },
      { $sort: { createdAt: -1 } },
      { $limit: 10 },
      { $lookup: { from: "variants", localField: "_id", foreignField: "productId", as: "variants" } },
      { $match: { variants: { $not: { $size: 0 } } } },
      { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categoryDoc" } },
      { $lookup: { from: "subcategories", localField: "subCategoryId", foreignField: "_id", as: "subCategoryDoc" } },
      {
        $project: {
          name: 1, avgRating: 1, totalRatings: 1, icon: 1, images: 1, slug: 1,
          categoryId: 1, subCategoryId: 1, brandId: 1,
          variantId: { $arrayElemAt: ["$variants._id", 0] },
          categoryName: { $arrayElemAt: ["$categoryDoc.title", 0] },
          subCategoryName: { $arrayElemAt: ["$subCategoryDoc.title", 0] },
          mrp: { $arrayElemAt: ["$variants.mrp", 0] },
          price: { $arrayElemAt: ["$variants.finalPrice", 0] },
          discount: { $arrayElemAt: ["$variants.discount", 0] },
        }
      }
    ];

    const productsPipeline = [
      { $match: productMatch },
      { $lookup: { from: "categories", localField: "categoryId", foreignField: "_id", as: "categoryDoc" } },
      { $lookup: { from: "subcategories", localField: "subCategoryId", foreignField: "_id", as: "subCategoryDoc" } },
      { $lookup: { from: "variants", localField: "_id", foreignField: "productId", as: "variants" } },
      { $match: { variants: { $not: { $size: 0 } } } },
      { $sort: { createdAt: -1 } },
      { $skip: skip },
      { $limit: limitNum },
      {
        $project: {
          _id: 1, name: 1, description: 1, avgRating: 1, totalRatings: 1, icon: 1, images: 1, slug: 1,
          categoryId: 1, subCategoryId: 1, brandId: 1,
          variantId: { $arrayElemAt: ["$variants._id", 0] },
          categoryName: { $arrayElemAt: ["$categoryDoc.title", 0] },
          subCategoryName: { $arrayElemAt: ["$subCategoryDoc.title", 0] },
          mrp: { $arrayElemAt: ["$variants.mrp", 0] },
          price: { $arrayElemAt: ["$variants.finalPrice", 0] },
          discount: { $arrayElemAt: ["$variants.discount", 0] },
        }
      }
    ];

    const [
      categories,
      hotDeals,
      flashSales,
      specialOffers,
      newArrivals,
      trendingProducts,
      combos,
      productsData,
      productsTotal,
    ] = await Promise.all([
      categoryModel.find({ disable: false }).select("title icon banner").lean(),
      fetchDealItems(hotDealIds.productIds, hotDealIds.variantIds, hotDealIds.discountValue, hotDealIds.discountType),
      fetchDealItems(flashSaleIds.productIds, flashSaleIds.variantIds, flashSaleIds.discountValue, flashSaleIds.discountType),
      fetchDealItems(specialOfferIds.productIds, specialOfferIds.variantIds, specialOfferIds.discountValue, specialOfferIds.discountType),
      productModel.aggregate(newArrivalsPipeline),
      productModel.aggregate(trendingPipeline),
      comboModel.find(comboMatch).select("name avgRating totalRatings icon images slug comboPrice totalMrp discount").sort({ createdAt: -1 }).limit(10).lean(),
      productModel.aggregate(productsPipeline),
      productModel.countDocuments(productMatch),
    ]);

    const responseData = {
      categories,
      hotDeals,
      flashSales,
      specialOffers,
      newArrivals,
      trendingProducts,
      combos,
      products: {
        data: productsData,
        pagination: {
          total: productsTotal,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(productsTotal / limitNum),
        }
      }
    };

    // Cache for 3 minutes
    try {
      await redisClient.setEx(cacheKey, 180, JSON.stringify(responseData));
    } catch (e) { /* skip on redis error */ }

    return responseData;
  }
}
