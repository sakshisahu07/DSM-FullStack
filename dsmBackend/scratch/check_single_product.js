import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

async function check() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB");

  const productSchema = new mongoose.Schema({}, { strict: false });
  const Product = mongoose.model("product", productSchema);

  const product = await Product.findById("69c780f91bb7552fbf1b7cbb").lean();
  console.log("Product in DB:", JSON.stringify(product, null, 2));

  await mongoose.disconnect();
}

check();
