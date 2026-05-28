import { MongoClient } from 'mongodb';

// Source: Sanvi Soni
const SOURCE_URI = "mongodb+srv://sanvisoni8998_db_user:QMCZr8OeNBpSGQ3K@dsm-online.gfsa9tp.mongodb.net/";
// Target: Asad DB
const TARGET_URI = "mongodb://ASAD1:ASAD1@cluster0-shard-00-00.ey8c8.mongodb.net:27017,cluster0-shard-00-01.ey8c8.mongodb.net:27017,cluster0-shard-00-02.ey8c8.mongodb.net:27017/?ssl=true&replicaSet=atlas-3wiqe7-shard-0&authSource=admin&appName=Cluster0";

async function migrate() {
    const sourceClient = new MongoClient(SOURCE_URI);
    const targetClient = new MongoClient(TARGET_URI);

    try {
        console.log("Connecting to source and target...");
        await Promise.all([sourceClient.connect(), targetClient.connect()]);
        console.log("Connected successfully.");

        // For this project, we likely want to migrate a specific database.
        // If not specified, we'll try to find 'dsm-online' or 'test' or list them.
        const sourceAdmin = sourceClient.db().admin();
        const dbs = await sourceAdmin.listDatabases();
        
        // Filter out system dbs
        const dbsToMigrate = dbs.databases
            .map(db => db.name)
            .filter(name => !['admin', 'local', 'config'].includes(name));

        console.log(`Found databases to migrate: ${dbsToMigrate.join(', ')}`);

        for (const dbName of dbsToMigrate) {
            console.log(`\n--- Migrating Database: ${dbName} ---`);
            const sourceDb = sourceClient.db(dbName);
            const targetDb = targetClient.db(dbName);

            const collections = await sourceDb.listCollections().toArray();
            
            for (const collInfo of collections) {
                const collName = collInfo.name;
                if (collName.startsWith('system.')) continue;

                console.log(`Migrating collection: ${collName}...`);
                const sourceColl = sourceDb.collection(collName);
                const targetColl = targetDb.collection(collName);

                // Clear target collection first? (Optional - depending on user preference)
                // await targetColl.deleteMany({});

                const totalDocs = await sourceColl.countDocuments();
                if (totalDocs === 0) {
                    console.log(` - Collection ${collName} is empty. Skipping.`);
                    continue;
                }

                const cursor = sourceColl.find({});
                let count = 0;
                let batch = [];
                const BATCH_SIZE = 500;

                while (await cursor.hasNext()) {
                    const doc = await cursor.next();
                    batch.push(doc);
                    count++;

                    if (batch.length >= BATCH_SIZE) {
                        try {
                            await targetColl.insertMany(batch, { ordered: false });
                        } catch (e) {
                            console.warn(` - Some documents in ${collName} failed (likely duplicates if already exists).`);
                        }
                        batch = [];
                        process.stdout.write(` - Progress: ${count}/${totalDocs}\r`);
                    }
                }

                if (batch.length > 0) {
                    try {
                        await targetColl.insertMany(batch, { ordered: false });
                    } catch (e) {
                        console.warn(` - Final batch in ${collName} had some issues.`);
                    }
                }
                console.log(` - Completed! ${count} documents migrated.`);
            }
        }

        console.log("\nMigration completed successfully.");

    } catch (error) {
        console.error("Migration failed:", error);
    } finally {
        await sourceClient.close();
        await targetClient.close();
    }
}

migrate();
