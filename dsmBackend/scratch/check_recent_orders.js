import mongoose from 'mongoose';
import orderModel from '../src/model/order.model.js';

const mongoUrl = "mongodb://dsm:dsm123@ac-qhqdlry-shard-00-02.8r4twn9.mongodb.net:27017/test?replicaSet=atlas-m4j47o-shard-0&ssl=true&authSource=admin";

async function run() {
  try {
    console.log("Connecting to DB...");
    await mongoose.connect(mongoUrl);
    console.log("Connected.");

    const now = new Date();
    console.log("Current server local time:", now.toString());
    console.log("Current server UTC time:", now.toUTCString());

    // Get today's start in local server timezone
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    console.log("todayStart local:", todayStart.toString());
    console.log("todayStart UTC:", todayStart.toUTCString());

    const recentOrders = await orderModel.find()
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    console.log("\nLast 10 orders in DB:");
    recentOrders.forEach(o => {
      console.log(`Order ID: ${o._id}, Total: ${o.orderTotal}, Status: ${o.status}, PaymentStatus: ${o.paymentStatus}, CreatedAt: ${o.createdAt.toISOString()} (${new Date(o.createdAt).toString()})`);
    });

    const todayCount = await orderModel.countDocuments({ createdAt: { $gte: todayStart } });
    console.log(`\nOrders counted starting from todayStart: ${todayCount}`);

    await mongoose.disconnect();
  } catch (error) {
    console.error("Error:", error);
  }
}

run();
