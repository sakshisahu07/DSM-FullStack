import mongoose from 'mongoose';

const sourceUri = "mongodb+srv://sanvisoni8998_db_user:QMCZr8OeNBpSGQ3K@dsm-online.gfsa9tp.mongodb.net/test?retryWrites=true&w=majority";

async function check() {
    try {
        console.log("Connecting to source...");
        const conn = await mongoose.connect(sourceUri);
        console.log("Connected to source host:", conn.connection.host);
        
        const admin = conn.connection.db.admin();
        const dbs = await admin.listDatabases();
        console.log("Databases on source:");
        dbs.databases.forEach(db => console.log(` - ${db.name}`));

        await mongoose.disconnect();
    } catch (error) {
        console.error("Error connecting to source:", error);
    }
}

check();
