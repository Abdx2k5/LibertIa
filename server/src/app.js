
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());

// Routes (on les ajoutera au fur et à mesure)
app.get('/', (req, res) => {
    res.json({
        message: '🐦 Libertia API is running',
        version: '1.0.0'
    });
});

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('✅ MongoDB connecté'))
    .catch((err) => console.error('❌ Erreur MongoDB:', err));

// Démarrage serveur
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Serveur Libertia démarré sur le port ${PORT}`);
});

module.exports = app;
```

Ensuite dans ton `.env` ajoute :
```
PORT = 5000
MONGO_URI = mongodb://localhost:27017/libertia