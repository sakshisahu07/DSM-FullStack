import express from "express";
import AppReferralController from "../controllers/appReferral.controller.js";
import { authUser, adminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Admin routes
router.get("/admin/app-referral/config", authUser, adminMiddleware, AppReferralController.getConfig);
router.put("/admin/app-referral/config", authUser, adminMiddleware, AppReferralController.updateConfig);
router.get("/admin/app-referral/transactions", authUser, adminMiddleware, AppReferralController.getTransactions);

// User routes
router.get("/app-referral/stats", authUser, AppReferralController.getMyStats);
router.get("/app-referral/generate-link", authUser, AppReferralController.generateDynamicLink);

export default router;
