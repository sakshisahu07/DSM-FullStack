import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

async function check() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB");

  const productSchema = new mongoose.Schema({}, { strict: false });
  const Product = mongoose.model("product", productSchema);

  const products = await Product.find({ name: /iPhone/i }).lean();
  console.log("iPhone products:", JSON.stringify(products, null, 2));

  await mongoose.disconnect();
}

check();
