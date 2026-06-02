import express from "express";
import AddressController from "../controllers/address.controller.js";
import { authUser } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/address", authUser, AddressController.createAddress);
router.get("/address", authUser, AddressController.getAddresses);
router.get("/address/:id", authUser, AddressController.getAddressById);
router.put("/address/:id", authUser, AddressController.updateAddress);
router.delete("/address/:id", authUser, AddressController.deleteAddress);

export default router;
