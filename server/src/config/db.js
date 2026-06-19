const mongoose = require('mongoose');
const dotenv = require('dotenv');
const logger = require('./logger'); // T138
dotenv.config();
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        logger.info('MongoDB connecté');
    } catch (err) {
        logger.error(`Erreur MongoDB: ${err.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;