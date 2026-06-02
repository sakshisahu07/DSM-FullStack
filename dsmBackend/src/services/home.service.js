import mongoose from "mongoose";
import categoryModel from "../model/category.model.js";
import variantModel from "../model/variant.model.js";
import productModel from "../model/product.model.js";
import comboModel from "../model/combo.model.js";
import hotDealModel from "../model/hotDeal.model.js";
import flashSaleModel from "../model/flashSale.model.js";
import specialOfferModel from "../model/specialOffer.model.js";
import subCategoryModel from "../model/subCategory.model.js";
import redisClient from "../config/redis.js";

// ─── Helper: fetch products + variants for a deal's productIds & variantIds ──
async function fetchDealItems(productIds = [], variantIds = [], discountValue = 0, discountType = "percentage") {
  const results = [];

  // Fetch variants directly listed in the deal
  if (variantIds.length) {
    const variants = await variantModel
      .find({ _id: { $in: variantIds }, disable: { $ne: true } })
      .populate("productId", "name avgRating totalRatings icon images slug categoryId subCategoryId brandId disable")
      .populate("category", "title")
      .populate("subCategory", "title")
      .lean();

    for (const v of variants) {
      if (!v.productId?.name) continue;
      if (v.productId.disable === true) continue; // Skip if parent product is disabled

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
      .find({ productId: { $in: productIds }, disable: { $ne: true } })
      .populate("productId", "name avgRating totalRatings icon images slug categoryId subCategoryId brandId disable")
      .populate("category", "title")
      .populate("subCategory", "title")
      .lean();

    // Group by product — only take first variant per product
    const seen = new Set(results.map(r => r._id.toString()));
    const byProduct = new Map();
    for (const v of variants) {
      if (!v.productId?.name) continue;
      if (v.productId.disable === true) continue; // Skip if parent product is disabled
      
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

// ─── Helper: fetch variants directly by Boolean flags (hotDeal, flashSale, specialOffer) ──────
async function fetchDealsByFlag(flagName, categoryId = null, subCategoryId = null) {
  // Map variant flag names to product flag names (e.g. hotDeal -> hotdeal)
  const pFlag = flagName === "hotDeal" ? "hotdeal" : flagName;

  // 1. Fetch variants via product-level flag
  const productQuery = { disable: { $ne: true } };
  productQuery[pFlag] = true;

  if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
    productQuery.categoryId = new mongoose.Types.ObjectId(categoryId);
  }
  if (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId)) {
    productQuery.subCategoryId = new mongoose.Types.ObjectId(subCategoryId);
  }

  const products = await productModel.find(productQuery).select("_id").lean();
  const productIdsFromProductFlag = products.map(p => p._id);

  let variantsFromProductFlag = [];
  if (productIdsFromProductFlag.length) {
    variantsFromProductFlag = await variantModel
      .find({ productId: { $in: productIdsFromProductFlag }, disable: { $ne: true } })
      .populate("productId", "name avgRating totalRatings icon images slug categoryId subCategoryId brandId disable")
      .populate("category", "title")
      .populate("subCategory", "title")
      .lean();
  }

  // 2. Fetch variants via variant-level flag
  const variantQuery = { disable: { $ne: true } };
  variantQuery[flagName] = true;

  if (categoryId && mongoose.Types.ObjectId.isValid(categoryId)) {
    variantQuery.category = new mongoose.Types.ObjectId(categoryId);
  }
  if (subCategoryId && mongoose.Types.ObjectId.isValid(subCategoryId)) {
    variantQuery.subCategory = new mongoose.Types.ObjectId(subCategoryId);
  }

  const variantsFromVariantFlag = await variantModel
    .find(variantQuery)
    .populate("productId", "name avgRating totalRatings icon images slug categoryId subCategoryId brandId disable")
    .populate("category", "title")
    .populate("subCategory", "title")
    .lean();

  // Combine both sets of variants
  const allVariants = [...variantsFromProductFlag, ...variantsFromVariantFlag];

  // Group variants by product (only take the first variant per product) and filter out disabled parent products
  const byProduct = new Map();
  for (const v of allVariants) {
    if (!v.productId?.name) continue;
    if (v.productId.disable === true) continue; // Filter out disabled parent products

    const pid = v.productId._id.toString();
    if (!byProduct.has(pid)) {
      byProduct.set(pid, v);
    }
  }

  const results = [];
  for (const [pid, v] of byProduct) {
    const mrp = v.mrp || 0;
    const price = v.finalPrice ?? mrp;
    const discount = v.discount ?? 0;

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

  return results;
}

// ─── Helper: find corresponding deal info (startDate, endDate, and remaining time calculation) ──
function findDealInfo(productId, variantId, dealDocs = []) {
  const pIdStr = productId?.toString();
  const vIdStr = variantId?.toString();

  // Find a deal doc that contains either the product or the variant
  let doc = dealDocs.find(d => {
    const hasProduct = d.products?.some(id => id.toString() === pIdStr);
    const hasVariant = d.variants?.some(id => id.toString() === vIdStr);
    return hasProduct || hasVariant;
  });

  // Fallback: Associate with the active/latest deal document of this type
  if (!doc && dealDocs.length) {
    doc = dealDocs.find(d => d.isActive === true) || dealDocs[0];
  }

  if (!doc) return null;

  // Calculate remaining time
  const now = new Date();
  const end = new Date(doc.endDate);
  const diffMs = end - now;

  let remainingTimeMs = 0;
  let remainingTimeFormatted = "00:00 Hours";
  let hms = "00:00:00";

  if (diffMs > 0) {
    remainingTimeMs = diffMs;
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    const diffSecs = Math.floor((diffMs % (1000 * 60)) / 1000);
    remainingTimeFormatted = `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')} Hours`;
    hms = `${String(diffHrs).padStart(2, '0')}:${String(diffMins).padStart(2, '0')}:${String(diffSecs).padStart(2, '0')}`;
  }

  return {
    _id: doc._id,
    title: doc.title,
    startDate: doc.startDate,
    endDate: doc.endDate,
    isActive: doc.isActive,
    discountType: doc.discountType,
    discountValue: doc.discountValue,
    remainingTimeMs,
    remainingTimeFormatted,
    hms,
  };
}

// ─── Helper: get ALL deals from admin (regardless of active/date status) ──────
// This ensures whatever admin adds always shows on the website
async function getActiveDeals(Model) {
  return Model.find({}).lean();
}

export default class HomeService {
  static async getHomePageData(query) {
    const { category, subCategory, page, limit } = query;

    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 10;
    const skip = (pageNum - 1) * limitNum;

    // Cache key specific to requested page, limit, category and subCategory
    const cacheKey = `home:data:cat_${category || "all"}:subcat_${subCategory || "all"}:page_${pageNum}:limit_${limitNum}`;

    try {
      const cached = await redisClient.get(cacheKey);
      // Temporarily bypass cache read in development to make sure updates are fetched live immediately
      // if (cached) return JSON.parse(cached);
    } catch (e) { /* skip cache on error */ }

    const productMatch = { disable: false };
    const comboMatch = { disable: false };

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      const catId = new mongoose.Types.ObjectId(category);
      comboMatch.categories = catId;
      productMatch.categoryId = catId;
    }

    if (subCategory && mongoose.Types.ObjectId.isValid(subCategory)) {
      const subCatId = new mongoose.Types.ObjectId(subCategory);
      productMatch.subCategoryId = subCatId;
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
      hotDealsByDoc,
      flashSalesByDoc,
      specialOffersByDoc,
      hotDealsByFlag,
      flashSalesByFlag,
      specialOffersByFlag,
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
      fetchDealsByFlag("hotDeal", category, subCategory),
      fetchDealsByFlag("flashSale", category, subCategory),
      fetchDealsByFlag("specialOffer", category, subCategory),
      productModel.aggregate(newArrivalsPipeline),
      productModel.aggregate(trendingPipeline),
      comboModel.find(comboMatch).select("name avgRating totalRatings icon images slug comboPrice totalMrp discount").sort({ createdAt: -1 }).limit(10).lean(),
      productModel.aggregate(productsPipeline),
      productModel.countDocuments(productMatch),
    ]);
    // Dynamically fetch and associate subcategories for the categories
    const categoryIds = categories.map(c => c._id);
    const subCategories = await subCategoryModel.find({ category: { $in: categoryIds }, disable: { $ne: true } }).lean();

    const subCatMap = {};
    for (const sub of subCategories) {
      const catId = sub.category.toString();
      if (!subCatMap[catId]) subCatMap[catId] = [];
      subCatMap[catId].push(sub);
    }

    categories.forEach(c => {
      c.subcategories = subCatMap[c._id.toString()] || [];
    });

    // Merge helper to remove duplicates (prioritize Doc values if any)
    const mergeDeals = (byDoc, byFlag) => {
      const merged = [...byDoc];
      const seen = new Set(byDoc.map(item => item._id.toString()));
      for (const item of byFlag) {
        const idStr = item._id.toString();
        if (!seen.has(idStr)) {
          seen.add(idStr);
          merged.push(item);
        }
      }
      return merged;
    };

    let finalHotDeals = mergeDeals(hotDealsByDoc, hotDealsByFlag);
    let finalFlashSales = mergeDeals(flashSalesByDoc, flashSalesByFlag);
    let finalSpecialOffers = mergeDeals(specialOffersByDoc, specialOffersByFlag);

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      const catStr = category.toString();
      finalHotDeals = finalHotDeals.filter(item => item.categoryId?.toString() === catStr);
      finalFlashSales = finalFlashSales.filter(item => item.categoryId?.toString() === catStr);
      finalSpecialOffers = finalSpecialOffers.filter(item => item.categoryId?.toString() === catStr);
    }
    if (subCategory && mongoose.Types.ObjectId.isValid(subCategory)) {
      const subCatStr = subCategory.toString();
      finalHotDeals = finalHotDeals.filter(item => item.subCategoryId?.toString() === subCatStr);
      finalFlashSales = finalFlashSales.filter(item => item.subCategoryId?.toString() === subCatStr);
      finalSpecialOffers = finalSpecialOffers.filter(item => item.subCategoryId?.toString() === subCatStr);
    }

    const hotDeals = finalHotDeals.map(item => ({
      ...item,
      hotDealInfo: findDealInfo(item._id, item.variantId, hotDealDocs)
    }));
    const flashSales = finalFlashSales.map(item => ({
      ...item,
      flashSaleInfo: findDealInfo(item._id, item.variantId, flashSaleDocs)
    }));
    const specialOffers = finalSpecialOffers.map(item => ({
      ...item,
      specialOfferInfo: findDealInfo(item._id, item.variantId, specialOfferDocs)
    }));

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
