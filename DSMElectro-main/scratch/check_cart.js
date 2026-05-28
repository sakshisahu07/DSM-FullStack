import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

async function check() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB");

  const cartSchema = new mongoose.Schema({}, { strict: false });
  const Cart = mongoose.model("cart", cartSchema);

  const carts = await Cart.find({}).lean();
  console.log("Carts in DB:", JSON.stringify(carts, null, 2));

  await mongoose.disconnect();
}

check();
