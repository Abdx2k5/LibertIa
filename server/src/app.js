const express = require('express');
const cors = require('cors');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const voyageRoutes = require('./routes/voyageRoutes');

const app = express();

connectDB();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
app.use(express.json());

// SA3 — Protection injections NoSQL
app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(key => {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else {
                    sanitize(obj[key]);
                }
            });
        }
    };
    if (req.body) sanitize(req.body);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/voyages', voyageRoutes);

app.get('/', (_req, res) => {
    res.json({ message: '🐦 Libertia API is running', version: '1.0.0' });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(` Serveur Libertia démarré sur le port ${PORT}`);
});

module.exports = app;
