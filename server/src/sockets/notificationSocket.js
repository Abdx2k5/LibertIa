// ─────────────────────────────────────────────
//  T71 — Notifications temps réel
//  Réutilise l'authentification socket de T84
//  (io.use(authentifierSocket) déjà branché dans
//  boiteSocket.js → socket.userId est déjà défini
//  au moment où l'événement "connection" se déclenche).
// ─────────────────────────────────────────────

// Instance io conservée pour permettre aux contrôleurs
// (likes, commentaires, invitations...) d'émettre des
// notifications en dehors du cycle requête/réponse socket.
let ioInstance = null;

// ─────────────────────────────────────────────
//  Initialise la room personnelle "user:<id>" de chaque
//  utilisateur connecté, pour pouvoir lui pousser ses
//  notifications individuellement.
// ─────────────────────────────────────────────
const initNotificationSocket = (io) => {
    ioInstance = io;

    io.on('connection', (socket) => {
        if (socket.userId) {
            socket.join(`user:${socket.userId}`);
        }
    });
};

// ─────────────────────────────────────────────
//  Récupère l'instance io initialisée (utilisée par
//  notificationController.creerNotification)
// ─────────────────────────────────────────────
const getIO = () => ioInstance;

// ─────────────────────────────────────────────
//  Émet une notification à un utilisateur précis
// ─────────────────────────────────────────────
const emitNotification = (io, userId, notification) => {
    if (!io || !userId) return;
    io.to(`user:${userId}`).emit('nouvelle-notification', notification);
};

module.exports = { initNotificationSocket, getIO, emitNotification };
