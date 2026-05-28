import { MongoClient } from 'mongodb';

const sourceUri = "mongodb+srv://sanvisoni8998_db_user:QMCZr8OeNBpSGQ3K@dsm-online.gfsa9tp.mongodb.net/";

async function run() {
    const client = new MongoClient(sourceUri);
    try {
        console.log("Attempting to connect to source with MongoClient...");
        await client.connect();
        console.log("Connected successfully!");
        
        const dbs = await client.db().admin().listDatabases();
        console.log("Databases:", dbs.databases.map(d => d.name));

    } catch (err) {
        console.error("Failed to connect:", err);
    } finally {
        await client.close();
    }
}

run();
