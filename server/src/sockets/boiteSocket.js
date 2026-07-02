const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Boite = require('../models/Boite');
const Message = require('../models/Message');

// ─────────────────────────────────────────────
//  T84 — Authentification JWT à la connexion socket
//  Le token est envoyé via `socket.handshake.auth.token`
//  (voir client/src/services/socket.service.js)
// ─────────────────────────────────────────────
const authentifierSocket = async (socket, next) => {
    try {
        const token = socket.handshake.auth?.token;
        if (!token) return next(new Error('Authentification requise'));

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.id).select('_id nom isActive');

        if (!user || !user.isActive) return next(new Error('Utilisateur non trouvé ou désactivé'));

        socket.userId = user._id.toString();
        socket.userNom = user.nom;
        next();
    } catch {
        next(new Error('Token invalide'));
    }
};

// Vérifie que l'utilisateur fait partie des membres de la boîte
const estMembreDeLaBoite = async (boiteId, userId) => {
    const boite = await Boite.findById(boiteId).select('membres');
    if (!boite) return false;
    return boite.membres.some(m => m.toString() === userId);
};

// ─────────────────────────────────────────────
//  T84 — Initialise les événements socket des boîtes collaboratives
// ─────────────────────────────────────────────
const initBoiteSocket = (io) => {
    io.use(authentifierSocket);

    io.on('connection', (socket) => {
        // ── Rejoindre la room d'une boîte (vérifie l'appartenance) ──
        socket.on('join-boite', async (boiteId) => {
            try {
                if (!boiteId) return;
                const autorise = await estMembreDeLaBoite(boiteId, socket.userId);
                if (!autorise) {
                    return socket.emit('error', { message: 'Non autorisé à rejoindre cette boîte' });
                }
                socket.join(`boite:${boiteId}`);
            } catch {
                socket.emit('error', { message: 'Erreur lors de la connexion à la boîte' });
            }
        });

        // ── Quitter la room d'une boîte ──
        socket.on('leave-boite', (boiteId) => {
            if (!boiteId) return;
            socket.leave(`boite:${boiteId}`);
        });

        // ── Envoyer un message ──
        socket.on('send-message', async ({ boiteId, contenu } = {}) => {
            try {
                if (!boiteId || !contenu || !contenu.trim()) return;

                const autorise = await estMembreDeLaBoite(boiteId, socket.userId);
                if (!autorise) {
                    return socket.emit('error', { message: 'Non autorisé à envoyer un message dans cette boîte' });
                }

                const message = await Message.create({
                    boiteId,
                    auteur: socket.userId,
                    contenu: contenu.trim().slice(0, 1000)
                });

                const messagePopule = await Message.findById(message._id)
                    .populate('auteur', 'nom profilePhoto');

                io.to(`boite:${boiteId}`).emit('new-message', messagePopule);
            } catch {
                socket.emit('error', { message: "Erreur lors de l'envoi du message" });
            }
        });

        // ── Indicateurs de saisie (diffusés aux autres membres de la room) ──
        socket.on('typing', ({ boiteId } = {}) => {
            if (!boiteId) return;
            socket.to(`boite:${boiteId}`).emit('user-typing', { userId: socket.userId, nom: socket.userNom });
        });

        socket.on('stop-typing', ({ boiteId } = {}) => {
            if (!boiteId) return;
            socket.to(`boite:${boiteId}`).emit('user-stop-typing', { userId: socket.userId, nom: socket.userNom });
        });
    });
};

module.exports = { initBoiteSocket };
