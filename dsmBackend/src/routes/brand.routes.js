import express from "express";
import BrandController from "../controllers/brand.controller.js";
import { authUser, adminMiddleware } from "../middlewares/authMiddleware.js";
import ObjectStorageService from "../middlewares/uploads.js";

const router = express.Router();

// CREATE
router.post(
  "/brand",
  authUser,
  adminMiddleware,
  ObjectStorageService.s3Uploader().single("icon"),
  BrandController.createBrand,
);

// UPDATE
router.put(
  "/brand/:id",
  authUser,
  adminMiddleware,
  ObjectStorageService.s3Uploader().single("icon"),
  BrandController.updateBrand,
);

// DELETE
router.delete(
  "/brand/:id",
  authUser,
  adminMiddleware,
  BrandController.deleteBrand,
);

// TOGGLE STATUS
router.patch(
  "/brand/:id/status",
  authUser,
  adminMiddleware,
  BrandController.toggleBrandStatus,
);

// GET ALL
router.get("/brands", BrandController.getAllBrands);

// GET BY CATEGORY
router.get("/brands/category/:categoryId", BrandController.getBrandsByCategory);

// GET BY SUB-CATEGORY
router.get("/brands/sub-category/:subCategoryId", BrandController.getBrandsBySubCategory);

// GET BY ID
router.get("/brand/:id", BrandController.getBrandById);

export default router;
