/**
 * ttl_index.js
 * ------------
 * Crée les TTL indexes sur les collections temporaires MongoDB
 * Les documents expirent automatiquement après 12h
 * 
 * Lancer UNE SEULE FOIS :
 *   node server/src/ttl_index.js
 */

const { MongoClient } = require("mongodb");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const COLLECTIONS_TEMP = ["hotels_temp", "vols_temp", "activites_temp", "restos_temp"];

async function creerTTLIndexes() {
    const client = new MongoClient(MONGO_URI);

    try {
        await client.connect();
        const db = client.db("libertia");

        for (const col of COLLECTIONS_TEMP) {
            await db.collection(col).createIndex(
                { expire_at: 1 },
                { expireAfterSeconds: 0 }
            );
            console.log(`✅ TTL index créé → ${col}`);
        }

        console.log("\n✅ Tous les TTL indexes créés — expiration automatique 12h");

    } catch (e) {
        console.error("❌ Erreur:", e.message);
    } finally {
        await client.close();
    }
}

creerTTLIndexes();