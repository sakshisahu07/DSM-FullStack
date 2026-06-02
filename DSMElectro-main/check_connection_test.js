import 'dotenv/config';
import mongoose from 'mongoose';

async function checkConnection() {
  try {
    const url = "mongodb://dsm:dsm123@ac-qhqdlry-shard-00-00.8r4twn9.mongodb.net:27017,ac-qhqdlry-shard-00-01.8r4twn9.mongodb.net:27017,ac-qhqdlry-shard-00-02.8r4twn9.mongodb.net:27017/?ssl=true&replicaSet=atlas-qhqdlry-shard-0&authSource=admin&retryWrites=true&w=majority&appName=Cluster0";
    console.log(`Attempting to connect to: ${url}`);
    await mongoose.connect(url);
    console.log("Database connection successful!");
    process.exit(0);
  } catch (err) {
    console.error("Database connection failed:", err.message);
    process.exit(1);
  }
}

checkConnection();
