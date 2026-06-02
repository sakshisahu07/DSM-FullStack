import mongoose from "mongoose";
import SpecialOffer from "../model/specialOffer.model.js";
import ProductModel from "../model/product.model.js";
import VariantModel from "../model/variant.model.js";
import HotDeal from "../model/hotDeal.model.js";
import comboModel from "../model/combo.model.js";
import redisClient, { clearHomeCache } from "../config/redis.js";

export default class SpecialOfferService {
  // ─── Calculate discount ───────────────────────────────────────────────────

  static calcDiscount(mrp, discountType, discountValue) {
    if (!mrp || mrp <= 0) return { discountAmount: 0, finalPrice: 0 };

    if (discountType === "percentage") {
      const discountAmount = parseFloat(
        ((mrp * discountValue) / 100).toFixed(2),
      );
      const finalPrice = parseFloat((mrp - discountAmount).toFixed(2));
      return { discountAmount, finalPrice };
    }

    // flat
    const discountAmount = discountValue;
    const finalPrice = parseFloat((mrp - discountValue).toFixed(2));
    return { discountAmount, finalPrice };
  }

  // ─── Conflict check ───────────────────────────────────────────────────────

  static async assertNoActiveConflict(
    productIds = [],
    variantIds = [],
    comboIds = [],
  ) {
    if (!productIds.length && !variantIds.length && !comboIds.length) return;

    const now = new Date();

    const orConditions = [
      ...(productIds.length ? [{ products: { $in: productIds } }] : []),
      ...(variantIds.length ? [{ variants: { $in: variantIds } }] : []),
      ...(comboIds.length ? [{ combos: { $in: comboIds } }] : []),
    ];

    // Check HotDeal conflict
    const conflictingHotDeal = await HotDeal.findOne({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: orConditions,
    }).select("title");

    if (conflictingHotDeal) {
      throw new Error(
        `One or more items are active in a Hot Deal "${conflictingHotDeal.title || "Untitled"}". Please remove that deal first.`,
      );
    }

    // Check existing SpecialOffer conflict
    const conflictingSpecial = await SpecialOffer.findOne({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
      $or: orConditions,
    }).select("title");

    if (conflictingSpecial) {
      throw new Error(
        `One or more items are already active in a Special Offer "${conflictingSpecial.title || "Untitled"}". Please remove that offer first.`,
      );
    }

    // ↓ Add more deal types here (FlashSale, etc.) following the same pattern
  }

  // ─── Create ───────────────────────────────────────────────────────────────

  static async create(body) {
    const {
      title,
      products = [],
      variants = [],
      combos = [],
      discountType,
      discountValue,
      startDate,
      endDate,
    } = body;

    // 1. Conflict check on directly passed ids
    await SpecialOfferService.assertNoActiveConflict(products, variants, combos);

    // 1a. Clear any stale flags from expired deals

    // ✅ APPLY COMBO DISCOUNT
    if (combos.length) {
      const comboDocs = await comboModel
        .find({
          _id: { $in: combos },
        })
        .lean();

      const comboOps = comboDocs.map((c) => {
        const discountAmount =
          discountType === "percentage"
            ? (c.totalMrp * discountValue) / 100
            : discountValue;

        return {
          updateOne: {
            filter: { _id: c._id },
            update: {
              specialOffer: true,
              discount: discountValue,
              discountAmount,
              comboPrice: c.totalMrp - discountAmount,
            },
          },
        };
      });

      await comboModel.bulkWrite(comboOps);
    }

    if (products.length) {
      await ProductModel.updateMany(
        { _id: { $in: products } },
        { hotDeal: false, specialOffer: false, discount: null },
      );
    }
    if (variants.length) {
      await VariantModel.updateMany(
        { _id: { $in: variants } },
        {
          hotDeal: false,
          specialOffer: false,
          discount: null,
          discountAmount: 0,
        },
      );
    }

    // 2. If products are selected → fetch all their variants
    let allVariantIds = [...variants.map((id) => id.toString())];

    if (products.length) {
      // Mark specialOffer: true on all selected products
      await ProductModel.updateMany(
        { _id: { $in: products } },
        { specialOffer: true, discount: discountValue },
      );

      // Get all variant ids belonging to these products
      const productVariants = await VariantModel.find(
        { productId: { $in: products } },
        "_id",
      ).lean();

      const productVariantIds = productVariants.map((v) => v._id.toString());

      // Merge & deduplicate
      const merged = new Set([...allVariantIds, ...productVariantIds]);
      allVariantIds = [...merged];
    }

    // 3. Apply discount on all resolved variants
    if (allVariantIds.length) {
      const variantDocs = await VariantModel.find({
        _id: { $in: allVariantIds },
      }).lean();

      const bulkOps = variantDocs.map((v) => {
        const { discountAmount, finalPrice } = SpecialOfferService.calcDiscount(
          v.mrp,
          discountType,
          discountValue,
        );

        return {
          updateOne: {
            filter: { _id: v._id },
            update: {
              specialOffer: true,
              discount: discountType === "percentage" ? discountValue : null,
              discountAmount,
              finalPrice,
            },
          },
        };
      });

      await VariantModel.bulkWrite(bulkOps);
    }

    // 4. Save offer record (store all resolved variant ids)
    const offer = await SpecialOffer.create({
      title,
      products,
      variants: allVariantIds,
      combos,
      discountType,
      discountValue,
      startDate,
      endDate,
    });

    await clearHomeCache();

    return offer;
  }

  // ─── Deactivate ───────────────────────────────────────────────────────────

  static async deactivate(offerId) {
    const offer = await SpecialOffer.findById(offerId);
    if (!offer) throw new Error("Special offer not found.");
    if (!offer.isActive) throw new Error("Special offer is already inactive.");

    // Revert product flags
    if (offer.products.length) {
      await ProductModel.updateMany(
        { _id: { $in: offer.products } },
        { specialOffer: false, discount: null },
      );
    }

    // Revert combo flags
    if (offer.combos.length) {
      const comboDocs = await comboModel
        .find({ _id: { $in: offer.combos } }, "_id totalMrp")
        .lean();

      const comboOps = comboDocs.map((c) => ({
        updateOne: {
          filter: { _id: c._id },
          update: {
            specialOffer: false,
            discount: null,
            discountAmount: 0,
            comboPrice: c.totalMrp ?? 0,
          },
        },
      }));

      await comboModel.bulkWrite(comboOps);
    }

    // Revert variant flags & prices
    if (offer.variants.length) {
      const variantDocs = await VariantModel.find(
        { _id: { $in: offer.variants } },
        "_id mrp",
      ).lean();

      const bulkOps = variantDocs.map((v) => ({
        updateOne: {
          filter: { _id: v._id },
          update: {
            specialOffer: false,
            discount: null,
            discountAmount: 0,
            finalPrice: v.mrp ?? 0,
          },
        },
      }));

      await VariantModel.bulkWrite(bulkOps);
    }

    offer.isActive = false;
    await offer.save();

    await clearHomeCache();

    return offer;
  }

  // ─── Delete ───────────────────────────────────────────────────────────────

  static async delete(offerId) {
    const offer = await SpecialOffer.findById(offerId);
    if (!offer) throw new Error("Special offer not found.");

    // Revert product flags
    if (offer.products.length) {
      await ProductModel.updateMany(
        { _id: { $in: offer.products } },
        { specialOffer: false, discount: null },
      );
    }

    // Revert combo flags
    if (offer.combos.length) {
      const comboDocs = await comboModel
        .find({ _id: { $in: offer.combos } }, "_id totalMrp")
        .lean();

      const comboOps = comboDocs.map((c) => ({
        updateOne: {
          filter: { _id: c._id },
          update: {
            specialOffer: false,
            discount: null,
            discountAmount: 0,
            comboPrice: c.totalMrp ?? 0,
          },
        },
      }));

      await comboModel.bulkWrite(comboOps);
    }

    // Revert variant flags & prices
    if (offer.variants.length) {
      const variantDocs = await VariantModel.find(
        { _id: { $in: offer.variants } },
        "_id mrp",
      ).lean();

      const bulkOps = variantDocs.map((v) => ({
        updateOne: {
          filter: { _id: v._id },
          update: {
            specialOffer: false,
            discount: null,
            discountAmount: 0,
            finalPrice: v.mrp ?? 0,
          },
        },
      }));

      await VariantModel.bulkWrite(bulkOps);
    }

    await SpecialOffer.findByIdAndDelete(offerId);
    await clearHomeCache();

    return true;
  }

  // ─── Get active offers ────────────────────────────────────────────────────

  static async getActive() {
    const now = new Date();
    return SpecialOffer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    })
      .populate("products", "name icon images specialOffer discount")
      .populate(
        "variants",
        "mrp finalPrice discountAmount discount specialOffer weight size productId",
      )
      .populate("combos");
  }

  // ─── Get all (admin) ──────────────────────────────────────────────────────

  static async getAll({ page = 1, limit = 10 } = {}) {
    const skip = (page - 1) * limit;
    const [data, total] = await Promise.all([
      SpecialOffer.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .populate("products", "name icon")
        .populate("variants", "mrp finalPrice weight size")
        .populate("combos"),
      SpecialOffer.countDocuments(),
    ]);
    return { data, total, page, limit };
  }

  // ─── Get by ID ────────────────────────────────────────────────────────────

  static async getById(id) {
    const offer = await SpecialOffer.findById(id)
      .populate("products", "name icon images discount specialOffer")
      .populate(
        "variants",
        "mrp finalPrice discountAmount discount specialOffer weight size productId",
      )
      .populate("combos");

    if (!offer) throw new Error("Special offer not found.");
    return offer;
  }

  // ─── Get all products that belong to active Special Offers with filters, pagination, and caching ───
  static async getSpecialOfferProducts(query = {}) {
    const { 
      category, 
      subCategory, 
      rating, 
      search, 
      tab, 
      page = 1, 
      limit = 12,
      minPrice,
      maxPrice,
      brand,
      feature
    } = query;
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    // Cache key specific to all filtered parameters
    const cacheKey = `specialOffers:products:cat_${category || "all"}:subcat_${subCategory || "all"}:rating_${rating || "all"}:search_${search || "all"}:tab_${tab || "all"}:minPrice_${minPrice || "all"}:maxPrice_${maxPrice || "all"}:brand_${brand || "all"}:feature_${feature || "all"}:page_${pageNum}:limit_${limitNum}`;

    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (e) { /* skip */ }

    // 1. Fetch active special offer docs to resolve product/variant IDs
    const now = new Date();
    const specialOfferDocs = await SpecialOffer.find({
      isActive: true,
      startDate: { $lte: now },
      endDate: { $gte: now },
    }).lean();

    const productIds = new Set();
    const variantIds = new Set();
    for (const doc of specialOfferDocs) {
      (doc.products || []).forEach(id => productIds.add(id.toString()));
      (doc.variants || []).forEach(id => variantIds.add(id.toString()));
    }

    // 2. Build pipeline on ProductModel
    const productMatch = { 
      disable: { $ne: true } 
    };

    if (category && mongoose.Types.ObjectId.isValid(category)) {
      productMatch.categoryId = new mongoose.Types.ObjectId(category);
    }

    if (subCategory && mongoose.Types.ObjectId.isValid(subCategory)) {
      productMatch.subCategoryId = new mongoose.Types.ObjectId(subCategory);
    }

    if (brand) {
      if (typeof brand === "string") {
        if (brand.includes(",")) {
          const brandIds = brand.split(",").map(id => id.trim()).filter(id => mongoose.Types.ObjectId.isValid(id));
          if (brandIds.length) {
            productMatch.brandId = { $in: brandIds.map(id => new mongoose.Types.ObjectId(id)) };
          }
        } else if (mongoose.Types.ObjectId.isValid(brand)) {
          productMatch.brandId = new mongoose.Types.ObjectId(brand);
        }
      } else if (Array.isArray(brand)) {
        const brandIds = brand.filter(id => mongoose.Types.ObjectId.isValid(id));
        if (brandIds.length) {
          productMatch.brandId = { $in: brandIds.map(id => new mongoose.Types.ObjectId(id)) };
        }
      }
    }

    if (feature) {
      const featureList = Array.isArray(feature) ? feature : [feature];
      if (featureList.length) {
        productMatch["keyFeatures.points"] = { $in: featureList };
      }
    }

    if (rating) {
      productMatch.avgRating = { $gte: parseFloat(rating) };
    }

    if (search) {
      productMatch.$or = [
        { name: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } }
      ];
    }

    const pipeline = [
      { $match: productMatch },
      // Lookup populated Category and SubCategory details
      {
        $lookup: {
          from: "categories",
          localField: "categoryId",
          foreignField: "_id",
          as: "categoryDoc"
        }
      },
      {
        $lookup: {
          from: "subcategories",
          localField: "subCategoryId",
          foreignField: "_id",
          as: "subCategoryDoc"
        }
      },
      // Lookup variants matching price filters
      {
        $lookup: {
          from: "variants",
          let: { productId: "$_id" },
          pipeline: [
            {
              $match: {
                $expr: { $eq: ["$productId", "$$productId"] },
                disable: { $ne: true },
                ...((minPrice || maxPrice) ? {
                  finalPrice: {
                    ...(minPrice ? { $gte: parseFloat(minPrice) } : {}),
                    ...(maxPrice ? { $lte: parseFloat(maxPrice) } : {})
                  }
                } : {})
              }
            }
          ],
          as: "variants"
        }
      },
      // Require at least one active variant matching price filters
      {
        $match: {
          "variants.0": { $exists: true }
        }
      },
      // Product must be in Special Offer (flagged or documented)
      {
        $match: {
          $or: [
            { specialOffer: true },
            { _id: { $in: [...productIds].map(id => new mongoose.Types.ObjectId(id)) } },
            { "variants.specialOffer": true },
            { "variants._id": { $in: [...variantIds].map(id => new mongoose.Types.ObjectId(id)) } }
          ]
        }
      }
    ];

    // Filter by tab
    let sortStage = { $sort: { createdAt: -1 } }; // default newest first

    if (tab === "best-selling") {
      sortStage = { $sort: { totalRatings: -1, avgRating: -1 } };
    } else if (tab === "new-arrivals") {
      sortStage = { $sort: { createdAt: -1 } };
    } else if (tab === "hot-deals") {
      pipeline.push({
        $match: {
          $or: [
            { hotdeal: true },
            { "variants.hotDeal": true }
          ]
        }
      });
    } else if (tab === "frequently-sale") {
      pipeline.push({
        $match: {
          $or: [
            { frequentlySale: true },
            { "variants.frequentlySale": true }
          ]
        }
      });
    } else if (tab === "flash-sale") {
      pipeline.push({
        $match: {
          $or: [
            { flashSale: true },
            { "variants.flashSale": true }
          ]
        }
      });
    }

    pipeline.push(
      sortStage,
      {
        $facet: {
          metadata: [{ $count: "total" }],
          data: [
            { $skip: skip },
            { $limit: limitNum },
            {
              $project: {
                _id: 1,
                name: 1,
                description: 1,
                avgRating: 1,
                totalRatings: 1,
                icon: 1,
                images: 1,
                slug: 1,
                categoryId: 1,
                subCategoryId: 1,
                brandId: 1,
                categoryName: { $arrayElemAt: ["$categoryDoc.title", 0] },
                subCategoryName: { $arrayElemAt: ["$subCategoryDoc.title", 0] },
                variantId: { $arrayElemAt: ["$variants._id", 0] },
                mrp: { $arrayElemAt: ["$variants.mrp", 0] },
                price: { $arrayElemAt: ["$variants.finalPrice", 0] },
                discount: { $arrayElemAt: ["$variants.discount", 0] },
              }
            }
          ]
        }
      }
    );

    const aggregationResult = await ProductModel.aggregate(pipeline);
    const totalCount = aggregationResult[0]?.metadata[0]?.total || 0;
    const specialOffers = aggregationResult[0]?.data || [];

    const resultData = {
      specialOffers,
      pagination: {
        total: totalCount,
        page: pageNum,
        limit: limitNum,
        totalPages: Math.ceil(totalCount / limitNum),
      }
    };

    // Cache the products for 3 minutes
    try {
      await redisClient.setEx(cacheKey, 180, JSON.stringify(resultData));
    } catch (e) { /* skip */ }

    return resultData;
  }
}
