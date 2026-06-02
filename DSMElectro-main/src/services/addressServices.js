import addressModel from "../model/address.model.js";
import redisClient from "../config/redis.js";
import { AppError } from "../utils/apiResponse.js";
import logger from "../utils/logger.js";
import cityModel from "../model/city.model.js";
import pincodeModel from "../model/pincode.model.js";

export default class AddressService {
  /**
   * CREATE ADDRESS
   */
  static async createAddress(userId, data) {
    const { firstName, lastName, phone, email, street, state, country } = data;
    let { city, pincode } = data;

    if (!firstName || !firstName.trim()) throw new AppError("First Name is required", 400);
    if (!lastName || !lastName.trim()) throw new AppError("Last Name is required", 400);

    if (!phone || !phone.trim()) throw new AppError("Phone Number is required", 400);
    if (!/^\d{10}$/.test(phone.trim())) throw new AppError("Phone Number must be exactly 10 digits", 400);

    if (!email || !email.trim()) throw new AppError("Email Address is required", 400);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) throw new AppError("Please enter a valid email address", 400);

    if (!street || !street.trim()) throw new AppError("Address/Street is required", 400);
    if (!city || !city.trim()) throw new AppError("City is required", 400);
    if (!state || !state.trim()) throw new AppError("State is required", 400);

    if (!pincode || !pincode.trim()) throw new AppError("Zip Code is required", 400);
    if (!/^\d{6}$/.test(pincode.trim())) throw new AppError("Zip Code must be exactly 6 digits", 400);

    if (!country || !country.trim()) throw new AppError("Country is required", 400);

    // Resolve City Name to City ObjectId
    const isObjectId = /^[0-9a-fA-F]{24}$/;
    if (!isObjectId.test(city.trim())) {
      let cityDoc = await cityModel.findOne({
        name: { $regex: new RegExp(`^${city.trim()}$`, "i") },
        stateId: state,
        countryId: country
      });

      if (!cityDoc) {
        cityDoc = await cityModel.create({
          name: city.trim(),
          stateId: state,
          countryId: country
        });
      }
      city = cityDoc._id;
    }

    // Resolve Pincode Code to Pincode ObjectId
    if (!isObjectId.test(pincode.trim())) {
      let pincodeDoc = await pincodeModel.findOne({
        code: pincode.trim(),
        cityId: city,
        stateId: state,
        countryId: country
      });

      if (!pincodeDoc) {
        pincodeDoc = await pincodeModel.create({
          code: pincode.trim(),
          cityId: city,
          stateId: state,
          countryId: country
        });
      }
      pincode = pincodeDoc._id;
    }

    const address = await addressModel.create({
      ...data,
      city,
      pincode,
      userId,
    });

    // Sync/update customer name and email to user profile
    const userModel = (await import("../model/user.model.js")).default;
    await userModel.findByIdAndUpdate(userId, {
      $set: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
      }
    });

    await this._clearCache(userId);
    return address;
  }

  /**
   * GET ALL ADDRESSES BY USER
   */
  static async getAddressesByUser(userId) {
    const cacheKey = `addresses:${userId}`;

    // Try cache
    try {
      const cached = await redisClient.get(cacheKey);
      if (cached) return JSON.parse(cached);
    } catch (err) {
      logger.warn(`Redis get error: ${err.message}`);
    }

    // Database fetch
    const addresses = await addressModel
      .find({ userId })
      .populate("country", "name")
      .populate("state", "name")
      .populate("city", "name")
      .populate("pincode", "code")
      .lean();

    // Set cache
    try {
      await redisClient.setEx(cacheKey, 3600, JSON.stringify(addresses)); // 1 hour cache
    } catch (err) {
      logger.warn(`Redis set error: ${err.message}`);
    }

    return addresses;
  }

  /**
   * GET SINGLE ADDRESS
   */
  static async getAddressById(addressId, userId) {
    const address = await addressModel
      .findOne({ _id: addressId, userId })
      .populate("country", "name")
      .populate("state", "name")
      .populate("city", "name")
      .populate("pincode", "code")
      .lean();

    if (!address) throw new AppError("Address not found", 404);
    return address;
  }

  /**
   * UPDATE ADDRESS
   */
  static async updateAddress(addressId, userId, data) {
    let { city, pincode, state, country } = data;

    const isObjectId = /^[0-9a-fA-F]{24}$/;
    
    if (city && !isObjectId.test(city.trim())) {
      let finalState = state;
      let finalCountry = country;
      if (!finalState || !finalCountry) {
        const existing = await addressModel.findById(addressId);
        if (existing) {
          finalState = finalState || existing.state;
          finalCountry = finalCountry || existing.country;
        }
      }

      if (finalState && finalCountry) {
        let cityDoc = await cityModel.findOne({
          name: { $regex: new RegExp(`^${city.trim()}$`, "i") },
          stateId: finalState,
          countryId: finalCountry
        });

        if (!cityDoc) {
          cityDoc = await cityModel.create({
            name: city.trim(),
            stateId: finalState,
            countryId: finalCountry
          });
        }
        data.city = cityDoc._id;
      }
    }

    if (pincode && !isObjectId.test(pincode.trim())) {
      let finalCity = data.city || city;
      let finalState = state;
      let finalCountry = country;
      if (!finalCity || !finalState || !finalCountry) {
        const existing = await addressModel.findById(addressId);
        if (existing) {
          finalCity = finalCity || existing.city;
          finalState = finalState || existing.state;
          finalCountry = finalCountry || existing.country;
        }
      }

      if (finalCity && finalState && finalCountry) {
        let pincodeDoc = await pincodeModel.findOne({
          code: pincode.trim(),
          cityId: finalCity,
          stateId: finalState,
          countryId: finalCountry
        });

        if (!pincodeDoc) {
          pincodeDoc = await pincodeModel.create({
            code: pincode.trim(),
            cityId: finalCity,
            stateId: finalState,
            countryId: finalCountry
          });
        }
        data.pincode = pincodeDoc._id;
      }
    }

    const address = await addressModel.findOneAndUpdate(
      { _id: addressId, userId },
      { $set: data },
      { new: true }
    );

    if (!address) throw new AppError("Address not found or unauthorized", 404);

    // Sync/update customer name and email to user profile if provided in the update payload
    const updateFields = {};
    if (data.firstName && data.firstName.trim()) updateFields.firstName = data.firstName.trim();
    if (data.lastName && data.lastName.trim()) updateFields.lastName = data.lastName.trim();
    if (data.email && data.email.trim()) updateFields.email = data.email.trim();

    if (Object.keys(updateFields).length > 0) {
      const userModel = (await import("../model/user.model.js")).default;
      await userModel.findByIdAndUpdate(userId, { $set: updateFields });
    }

    await this._clearCache(userId);
    return address;
  }

  /**
   * DELETE ADDRESS
   */
  static async deleteAddress(addressId, userId) {
    const result = await addressModel.findOneAndDelete({ _id: addressId, userId });
    
    if (!result) throw new AppError("Address not found or unauthorized", 404);

    await this._clearCache(userId);
    return true;
  }

  /**
   * CLEAR CACHE HELPER
   */
  static async _clearCache(userId) {
    try {
      await redisClient.del(`addresses:${userId}`);
    } catch (err) {
      logger.warn(`Redis del error: ${err.message}`);
    }
  }
}
