import express from "express";
import RoleController from "../controllers/role.controller.js";
import { authUser, adminMiddleware } from "../middlewares/authMiddleware.js";

const router = express.Router();

// All role routes require authentication and Super Admin access
router.get("/permissions", authUser, adminMiddleware, RoleController.getPermissions);
router.get("/roles", authUser, adminMiddleware, RoleController.getAllRoles);
router.post("/roles", authUser, adminMiddleware, RoleController.createRole);
router.put("/roles/:id", authUser, adminMiddleware, RoleController.updateRole);
router.delete("/roles/:id", authUser, adminMiddleware, RoleController.deleteRole);
router.patch("/roles/:id/permissions", authUser, adminMiddleware, RoleController.updateRolePermissions);

export default router;
