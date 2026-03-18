/**
 * cron.js
 * -------
 * Cron job toutes les 12h :
 * 1. Purge les collections temporaires MongoDB (TTL)
 * 2. Réindexe ChromaDB depuis les données fraîches
 * 
 * Lancer en arrière-plan :
 *   node server/src/cron.js
 */

const cron    = require("node-cron");
const { MongoClient } = require("mongodb");
const { spawn } = require("child_process");

const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017";
const COLLECTIONS_TEMP = ["hotels_temp", "vols_temp", "activites_temp", "restos_temp"];

// ─────────────────────────────────────────────
//  PURGE MongoDB collections temporaires
// ─────────────────────────────────────────────
async function purgerMongoDB() {
  const client = new MongoClient(MONGO_URI);
  try {
    await client.connect();
    const db = client.db("libertia");

    for (const col of COLLECTIONS_TEMP) {
      const result = await db.collection(col).deleteMany({});
      console.log(`  🗑️  ${col} — ${result.deletedCount} docs supprimés`);
    }

    console.log("  ✅ MongoDB purgé");
  } catch (e) {
    console.error("  ❌ Erreur purge MongoDB:", e.message);
  } finally {
    await client.close();
  }
}

// ─────────────────────────────────────────────
//  RÉINDEXATION ChromaDB (appel Python)
// ─────────────────────────────────────────────
function reindexerChromaDB() {
  return new Promise((resolve, reject) => {
    console.log("  🔄 Réindexation ChromaDB...");

    const python = spawn("python", ["ai/embeddings.py", "--full"]);

    python.stdout.on("data", (data) => process.stdout.write(`  ${data}`));
    python.stderr.on("data", (data) => process.stderr.write(`  ⚠️  ${data}`));

    python.on("close", (code) => {
      if (code === 0) {
        console.log("  ✅ ChromaDB réindexé");
        resolve();
      } else {
        reject(new Error(`embeddings.py exited with code ${code}`));
      }
    });
  });
}

// ─────────────────────────────────────────────
//  JOB COMPLET
// ─────────────────────────────────────────────
async function runJob() {
  console.log(`\n⏰ Cron 12h — ${new Date().toISOString()}`);
  console.log("=".repeat(40));

  await purgerMongoDB();
  await reindexerChromaDB();

  console.log("✅ Job terminé\n");
}

// ─────────────────────────────────────────────
//  SCHEDULE — toutes les 12h (00:00 et 12:00)
// ─────────────────────────────────────────────
cron.schedule("0 0,12 * * *", runJob);

console.log("⏰ Cron job LibertIa démarré — purge + réindexation toutes les 12h");

// Lancer immédiatement au démarrage (optionnel)
// runJob();