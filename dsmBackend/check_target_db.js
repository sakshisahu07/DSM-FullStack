import mongoose from 'mongoose';

const targetUri = "mongodb://ASAD1:ASAD1@cluster0-shard-00-00.ey8c8.mongodb.net:27017,cluster0-shard-00-01.ey8c8.mongodb.net:27017,cluster0-shard-00-02.ey8c8.mongodb.net:27017/?ssl=true&replicaSet=atlas-3wiqe7-shard-0&authSource=admin&appName=Cluster0";

async function check() {
    try {
        console.log("Connecting to target...");
        const conn = await mongoose.connect(targetUri);
        console.log("Connected to target host:", conn.connection.host);
        
        const admin = conn.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log("Databases on target:");
        dbs.databases.forEach(db => console.log(` - ${db.name}`));

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error connecting to target:", error);
    }
}

check();
