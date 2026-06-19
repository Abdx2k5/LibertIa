// =============================================================
// FICHIER  : src/server.js
// RÔLE     : Point d'entrée d'exécution. Connecte MongoDB, partage
//            le serveur HTTP entre Express et Socket.IO, puis écoute.
//
// La logique applicative (routes/middlewares) vit dans app.js ;
// ce fichier ne contient que le démarrage à effets de bord.
// =============================================================

const http = require('http');
const { Server } = require('socket.io');

const app = require('./app');
const connectDB = require('./config/db');
const logger = require('./config/logger');
const { initBoiteSocket } = require('./sockets/boiteSocket');
const { initNotificationSocket } = require('./sockets/notificationSocket');

const PORT = process.env.PORT || 5000;

connectDB();

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
    logger.info(`Serveur Libertia démarré sur le port ${PORT}`);
});

module.exports = { server, io };
