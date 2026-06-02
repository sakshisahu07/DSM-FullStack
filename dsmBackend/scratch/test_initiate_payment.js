import 'dotenv/config'; // ESM-compliant dotenv loading at import time

import mongoose from 'mongoose';
import orderModel from '../src/model/order.model.js';
import OrderService from '../src/services/orderServices.js';

const mongoUrl = process.env.MONGO_URL || "mongodb://dsm:dsm123@ac-qhqdlry-shard-00-02.8r4twn9.mongodb.net:27017/test?replicaSet=atlas-m4j47o-shard-0&ssl=true&authSource=admin";

async function run() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(mongoUrl);
    console.log("Connected.");

    // Fetch the most recent unpaid pending order
    const order = await orderModel.findOne({
      status: "PENDING",
      paymentStatus: "UNPAID"
    }).sort({ createdAt: -1 });

    if (!order) {
      console.log("No pending unpaid orders found! Fetching any recent order just to test.");
      const anyOrder = await orderModel.findOne().sort({ createdAt: -1 });
      if (!anyOrder) {
        console.log("No orders in database at all!");
        await mongoose.disconnect();
        return;
      }
      console.log(`Testing with order: ${anyOrder._id}, customerId: ${anyOrder.customerId}`);
      const res = await OrderService.initiatePayment(anyOrder._id, anyOrder.customerId);
      console.log("Result:", res);
    } else {
      console.log(`Testing with pending unpaid order: ${order._id}, customerId: ${order.customerId}`);
      const res = await OrderService.initiatePayment(order._id, order.customerId);
      console.log("Result:", res);
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error("DIAGNOSTIC ERROR TRACE:");
    console.error(error);
    await mongoose.disconnect();
  }
}

run();
