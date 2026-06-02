import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from 'mongoose';
import CartService from '../src/services/cartServices.js';
import dotenv from 'dotenv';
dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb+srv://dsm:dsm123@cluster0.8r4twn9.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(mongoUrl);
    console.log("Connected.");

    const userId = "6a152d3675a31af1603aa9d8";
    
    console.log("Calling removeCoupon...");
    const res = await CartService.removeCoupon(userId);
    console.log("Result:", JSON.stringify(res, null, 2));

    const cart = await CartService.getCart(userId);
    console.log("Cart after removeCoupon:", JSON.stringify(cart, null, 2));

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
