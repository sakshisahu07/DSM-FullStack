import dns from "dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);

import mongoose from 'mongoose';
import variantModel from '../src/model/variant.model.js';
import dotenv from 'dotenv';
dotenv.config();

const mongoUrl = process.env.MONGO_URL || "mongodb+srv://dsm:dsm123@cluster0.8r4twn9.mongodb.net/?appName=Cluster0";

async function run() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(mongoUrl);
    console.log("Connected.");

    const variantId = "6a180b05a94f3ac43ba22802";
    console.log(`Updating stock for variant ${variantId}...`);
    
    const result = await variantModel.findByIdAndUpdate(
      variantId,
      { $set: { stock: 100 } },
      { new: true }
    );

    if (result) {
      console.log("Variant updated successfully!");
      console.log(`New Stock in DB: ${result.stock}`);
    } else {
      console.log("Variant not found!");
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
