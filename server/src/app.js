const express = require('express');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const voyageRoutes = require('./routes/voyageRoutes');
const compagnonRoutes = require('./routes/compagnonRoutes');
const communityRoutes = require('./routes/communityRoutes');
const dossierRoutes = require('./routes/dossierRoutes');
const boiteRoutes = require('./routes/boiteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const { initBoiteSocket } = require('./sockets/boiteSocket');
const { initNotificationSocket } = require('./sockets/notificationSocket');

const app = express();

connectDB();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
// limite augmentée pour l'upload de photos en base64 (T79)
app.use(express.json({ limit: '5mb' }));

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
app.use('/api/compagnon', compagnonRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/boites', boiteRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (_req, res) => {
    res.json({ message: '🐦 Libertia API is running', version: '1.0.0' });
});

const PORT = process.env.PORT || 5000;

// T84 — serveur HTTP partagé entre Express et Socket.IO
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        credentials: true
    }
});

initBoiteSocket(io);
initNotificationSocket(io);

server.listen(PORT, () => {
    console.log(` Serveur Libertia démarré sur le port ${PORT}`);
});

module.exports = app;
