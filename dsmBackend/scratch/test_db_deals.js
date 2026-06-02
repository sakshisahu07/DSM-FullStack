import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb+srv://dsm:dsm123@cluster0.8r4twn9.mongodb.net/?appName=Cluster0";

async function check() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(mongoUrl);
    console.log("Connected.");

    const FlashSale = mongoose.model("flashSale", new mongoose.Schema({}, { strict: false }));

    const flashSales = await FlashSale.find({}).lean();

    console.log(`--- FlashSales found in DB: ${flashSales.length} ---`);
    flashSales.forEach(d => console.log(`ID: ${d._id}, title: ${d.title}, isActive: ${d.isActive}, startDate: ${d.startDate}, endDate: ${d.endDate}`));

    await mongoose.disconnect();
  } catch (err) {
    console.error(err);
  }
}

check();
