const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const voyageRoutes = require('./routes/voyageRoutes');

const app = express();

// Connexion MongoDB
connectDB();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/voyages', voyageRoutes);

// Route de test
app.get('/', (req, res) => {
    res.json({
        message: '🐦 Libertia API is running',
        version: '1.0.0'
    });
});

// Démarrage serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur Libertia démarré sur le port ${PORT}`);
});

module.exports = app;