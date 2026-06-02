import mongoose from 'mongoose';
import CartService from './src/services/cartServices.js';
import redisClient from './src/config/redis.js';

const mongoUrl = "mongodb+srv://dsm:dsm123@cluster0.8r4twn9.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(mongoUrl);
    console.log("Connected.");

    // Connect redis
    await redisClient.connect();
    console.log("Redis connected.");

    const userId = "6a17dd77950cee3406a88c97";
    const variantId = "6a11902475a31af1603a8246"; // variant for test3

    console.log("Adding to cart...");
    const res = await CartService.addToCart(userId, [{ variantId, quantity: 1 }]);
    console.log("Result:", JSON.stringify(res, null, 2));

    const cart = await CartService.getCart(userId);
    console.log("Cart contents:", JSON.stringify(cart, null, 2));

    await redisClient.disconnect();
    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
