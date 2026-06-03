import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const MONGO_URL = process.env.MONGO_URL;

async function check() {
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB");

  const productSchema = new mongoose.Schema({}, { strict: false });
  const Product = mongoose.model("product", productSchema);

  const variantSchema = new mongoose.Schema({
    productId: { type: mongoose.Schema.Types.ObjectId, ref: "product" }
  }, { strict: false, strictPopulate: false });
  
  const Variant = mongoose.model("variant", variantSchema);

  const variants = await Variant.find({}).populate("productId").lean();

  const iphoneVariants = variants.filter(v => v.productId?.name && /iPhone/i.test(v.productId.name));
  console.log("iPhone variants:", JSON.stringify(iphoneVariants, null, 2));

  await mongoose.disconnect();
}

check();
