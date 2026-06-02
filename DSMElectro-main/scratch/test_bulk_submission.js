import dotenv from "dotenv";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import fetch from "node-fetch";

dotenv.config();

const MONGO_URL = process.env.MONGO_URL;
const JWT_SECRET = process.env.HASH_KEY || "secret123";
const BASE_URL = "http://localhost:5050/api/v1";

async function run() {
  console.log("Connecting to MongoDB...");
  await mongoose.connect(MONGO_URL);
  console.log("Connected to MongoDB!");

  // Find a test user or create one
  const User = mongoose.model("User", new mongoose.Schema({}, { strict: false }), "users");
  const user = await User.findOne({ number: "9892556435" });
  if (!user) {
    console.error("Test user not found!");
    await mongoose.connection.close();
    return;
  }
  console.log("Found user:", user._id, user.number);

  // Generate JWT token
  const token = jwt.sign({ id: user._id.toString() }, JWT_SECRET, { expiresIn: "1d" });
  console.log("Signed Token:", token);

  // Find country
  const Country = mongoose.model("Country", new mongoose.Schema({}, { strict: false }), "countries");
  const country = await Country.findOne({ disable: false });
  console.log("Country ID:", country?._id);

  // Find state for country
  const State = mongoose.model("State", new mongoose.Schema({}, { strict: false }), "states");
  const state = await State.findOne({ countryId: country?._id, disable: false });
  console.log("State ID:", state?._id);

  // Find city for state
  const City = mongoose.model("City", new mongoose.Schema({}, { strict: false }), "cities");
  const city = await City.findOne({ stateId: state?._id, disable: false });
  console.log("City ID:", city?._id);

  // Find a product
  const Product = mongoose.model("Product", new mongoose.Schema({}, { strict: false }), "products");
  const product = await Product.findOne();
  console.log("Product ID:", product?._id, "Product Name:", product?.name || product?.title);

  if (!country || !state || !city || !product) {
    console.error("Required test data missing!");
    await mongoose.connection.close();
    return;
  }

  // Submit Inquiry
  const payload = {
    userId: user._id.toString(),
    number: user.number,
    products: [product._id.toString()],
    country: country._id.toString(),
    state: state._id.toString(),
    city: city._id.toString(),
    pincode: "313001", // pincode string to trigger auto-creation/resolution
    message: "Dynamic Bulk Inquiry Integration Test"
  };

  console.log("Submitting bulk inquiry with payload:", payload);
  const response = await fetch(`${BASE_URL}/bulk-inquiry`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${token}`
    },
    body: JSON.stringify(payload)
  });

  const resJson = await response.json();
  console.log("Response:", JSON.stringify(resJson, null, 2));

  await mongoose.connection.close();
}

run().catch(async (err) => {
  console.error("Error:", err);
  await mongoose.connection.close();
});
