import express from "express";
import CountryController from "../controllers/country.controller.js";
import StateController from "../controllers/state.controller.js";
import CityController from "../controllers/city.controller.js";
import PincodeController from "../controllers/pincode.controller.js";
import { authUser, adminMiddleware, optionalAuth } from "../middlewares/authMiddleware.js";

const router = express.Router();

// COUNTRY
router.post("/country", authUser, adminMiddleware, CountryController.createCountry);
router.put("/country/:id", authUser, adminMiddleware, CountryController.updateCountry);
router.delete("/country/:id", authUser, adminMiddleware, CountryController.deleteCountry);
router.patch("/country/:id/status", authUser, adminMiddleware, CountryController.toggleCountryStatus);
router.get("/countries", optionalAuth, CountryController.getAllCountries);
router.get("/country/:id", optionalAuth, CountryController.getCountryById);

// STATE
router.post("/state", authUser, adminMiddleware, StateController.createState);
router.put("/state/:id", authUser, adminMiddleware, StateController.updateState);
router.delete("/state/:id", authUser, adminMiddleware, StateController.deleteState);
router.patch("/state/:id/status", authUser, adminMiddleware, StateController.toggleStateStatus);
router.get("/states", optionalAuth, StateController.getAllStates);
router.get("/state/:id", optionalAuth, StateController.getStateById);

// CITY
router.post("/city", authUser, adminMiddleware, CityController.createCity);
router.put("/city/:id", authUser, adminMiddleware, CityController.updateCity);
router.delete("/city/:id", authUser, adminMiddleware, CityController.deleteCity);
router.patch("/city/:id/status", authUser, adminMiddleware, CityController.toggleCityStatus);
router.get("/cities", optionalAuth, CityController.getAllCities);
router.get("/city/:id", optionalAuth, CityController.getCityById);

// PINCODE
router.post("/pincode", authUser, adminMiddleware, PincodeController.createPincode);
router.put("/pincode/:id", authUser, adminMiddleware, PincodeController.updatePincode);
router.delete("/pincode/:id", authUser, adminMiddleware, PincodeController.deletePincode);
router.patch("/pincode/:id/status", authUser, adminMiddleware, PincodeController.togglePincodeStatus);
router.get("/pincodes", authUser, PincodeController.getAllPincodes);
router.get("/pincode/:id", authUser, PincodeController.getPincodeById);

export default router;