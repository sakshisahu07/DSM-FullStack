// controllers/subCategory.controller.js

import { handleApiRequest, ValidationError } from "../utils/apiResponse.js";
import SubCategoryService from "../services/subCategoryServices.js";
import {
  subCategorySchema,
  updateSubCategorySchema,
} from "../validators/subCategoryValidation.js";

export default class SubCategoryController {
  static async create(req, res) {
    return handleApiRequest(req, res, async () => {
      const { error } = subCategorySchema.validate(req.body);
      if (error) throw new ValidationError(error.details[0].message);

      // .fields() puts files in req.files, .single() puts in req.file
      const iconFile = req.files?.icon?.[0] || req.file;

      const payload = {
        ...req.body,
        icon: iconFile?.location || null,
      };

      const data = await SubCategoryService.createSubCategory(payload);

      return [{ data }, "SubCategory created successfully", 201];
    });
  }

  static async update(req, res) {
    return handleApiRequest(req, res, async () => {
      const { error } = updateSubCategorySchema.validate(req.body);
      if (error) throw new ValidationError(error.details[0].message);

      // .fields() puts files in req.files, .single() puts in req.file
      const iconFile = req.files?.icon?.[0] || req.file;

      const payload = {
        ...req.body,
        ...(iconFile && { icon: iconFile.location }),
      };

      const data = await SubCategoryService.updateSubCategory(
        req.params.id,
        payload
      );

      return [{ data }, "SubCategory updated successfully"];
    });
  }

  static async delete(req, res) {
    return handleApiRequest(req, res, async () => {
      await SubCategoryService.deleteSubCategory(req.params.id);
      return [{}, "SubCategory deleted successfully"];
    });
  }

  static async getById(req, res) {
    return handleApiRequest(req, res, async () => {
      const data = await SubCategoryService.getSubCategoryById(req.params.id);
      return [{ data }, "SubCategory fetched successfully"];
    });
  }

  static async getAll(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await SubCategoryService.getAllSubCategories(req.query);

      return [
        {
          data: result.subCategories,
          pagination: result.pagination,
        },
        "SubCategories fetched successfully",
      ];
    });
  }

  static async toggleStatus(req, res) {
    return handleApiRequest(req, res, async () => {
      const data = await SubCategoryService.toggleSubCategoryStatus(
        req.params.id
      );

      return [
        { data },
        data.disable
          ? "SubCategory disabled successfully"
          : "SubCategory enabled successfully",
      ];
    });
  }

  static async getByCategory(req, res) {
    return handleApiRequest(req, res, async () => {
      const result = await SubCategoryService.getSubCategoryByCategory(
        req.params.categoryId,
        req.query
      );

      return [
        {
          data: result.subCategories,
          pagination: result.pagination,
        },
        "SubCategories fetched successfully",
      ];
    });
  }
}