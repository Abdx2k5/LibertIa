// =============================================================
// FICHIER  : tests/helpers/db.js
// TÂCHE    : T140 — support des tests d'intégration
//
// Cycle de vie d'une base MongoDB éphémère (mongodb-memory-server)
// partagée par un fichier de test : connect() au démarrage,
// clear() entre les tests, disconnect() à la fin.
// =============================================================

const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

let mongod = null;

const connect = async () => {
    mongod = await MongoMemoryServer.create();
    await mongoose.connect(mongod.getUri());
};

const clear = async () => {
    const { collections } = mongoose.connection;
    for (const key of Object.keys(collections)) {
        await collections[key].deleteMany({});
    }
};

const disconnect = async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.disconnect();
    if (mongod) await mongod.stop();
};

module.exports = { connect, clear, disconnect };
