import categoryModel from "../model/category.model.js";
import subCategoryModel from "../model/subCategory.model.js";
import { AppError } from "../utils/apiResponse.js";

export default class CategoryService {
  // CREATE CATEGORY
  static async createCategory(payload) {
    const category = await categoryModel.create(payload);
    return category;
  }

  // UPDATE CATEGORY
  static async updateCategory(categoryId, payload) {
    const category = await categoryModel.findById(categoryId);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    Object.assign(category, payload);
    await category.save();

    return category;
  }

  // DELETE CATEGORY
  static async deleteCategory(categoryId) {
    const category = await categoryModel.findById(categoryId);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    await category.deleteOne();

    return true;
  }

  // GET CATEGORY BY ID
  static async getCategoryById(categoryId) {
    const category = await categoryModel.findById(categoryId);

    if (!category) {
      throw new AppError("Category not found", 404);
    }

    return category;
  }

  // GET ALL WITH PAGINATION (NEW FIRST)
  static async getAllCategories(query) {
    const page = parseInt(query.page) || 1;
    const limit = parseInt(query.limit) || 10;

    const skip = (page - 1) * limit;

    const categories = await categoryModel
      .find()
      .sort({ createdAt: -1 }) // newest first
      .skip(skip)
      .limit(limit)
      .lean();

    // Dynamically fetch and associate subcategories in a single batch query
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

    const total = await categoryModel.countDocuments();

    return {
      categories,
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  // TOGGLE DISABLE
  static async toggleCategoryStatus(categoryId) {
    const updated = await categoryModel.findByIdAndUpdate(
      categoryId,
      [
        {
          $set: {
            disable: { $not: "$disable" },
          },
        },
      ],
      {
        new: true,
        updatePipeline: true,
      },
    );

    if (!updated) {
      throw new AppError("Category not found", 404);
    }

    return updated;
  }
}
