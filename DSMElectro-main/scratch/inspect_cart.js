import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from 'mongoose';
import cartModel from '../src/model/cart.model.js';
import variantModel from '../src/model/variant.model.js';
import dotenv from 'dotenv';
dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb+srv://dsm:dsm123@cluster0.8r4twn9.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(mongoUrl);
    console.log("Connected.");

    const userId = "6a152d3675a31af1603aa9d8";
    const cart = await cartModel.findOne({ userId }).lean();
    
    console.log("--- CART DETAILS ---");
    console.log(JSON.stringify(cart, null, 2));

    if (cart && cart.items && cart.items.length > 0) {
      console.log("\n--- CART ITEMS STOCK DETAILS ---");
      for (const item of cart.items) {
        if (item.variantId) {
          const variant = await variantModel.findById(item.variantId).lean();
          console.log(`Variant ID: ${item.variantId}`);
          console.log(`Cart Quantity: ${item.quantity}`);
          console.log(`Variant Stock in DB: ${variant ? variant.stock : 'Not Found'}`);
          console.log(`Variant Disable status: ${variant ? variant.disable : 'Not Found'}`);
          console.log("------------------------");
        }
      }
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
