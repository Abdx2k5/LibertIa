const User = require('../models/User');
const MessagePrive = require('../models/MessagePrive');

// Room partagée par deux utilisateurs donnés — toujours construite en
// triant les deux ids pour que les deux participants rejoignent la même room
// quel que soit l'ordre dans lequel ils ouvrent la conversation.
const dmRoomName = (id1, id2) => `dm:${[id1, id2].sort().join(':')}`;

// ─────────────────────────────────────────────
//  Messagerie privée temps réel — réutilise l'authentification socket
//  déjà branchée par boiteSocket.js (io.use(authentifierSocket)) et la
//  room personnelle "user:<id>" déjà rejointe par notificationSocket.js.
// ─────────────────────────────────────────────
const initDmSocket = (io) => {
    io.on('connection', (socket) => {
        // ── Rejoindre la room d'une conversation privée avec un autre utilisateur ──
        socket.on('join-dm', async (autreUserId) => {
            try {
                if (!autreUserId) return;
                const autre = await User.findById(autreUserId).select('_id');
                if (!autre) return socket.emit('error', { message: 'Utilisateur non trouvé' });
                socket.join(dmRoomName(socket.userId, autreUserId));
            } catch {
                socket.emit('error', { message: 'Erreur lors de la connexion à la conversation' });
            }
        });

        socket.on('leave-dm', (autreUserId) => {
            if (!autreUserId) return;
            socket.leave(dmRoomName(socket.userId, autreUserId));
        });

        // ── Envoyer un message privé ──
        socket.on('send-dm', async ({ destinataire, contenu } = {}) => {
            try {
                if (!destinataire || !contenu || !contenu.trim()) return;
                if (destinataire === socket.userId) return;

                const cible = await User.findById(destinataire).select('_id');
                if (!cible) return socket.emit('error', { message: 'Utilisateur non trouvé' });

                const message = await MessagePrive.create({
                    expediteur: socket.userId,
                    destinataire,
                    contenu: contenu.trim().slice(0, 1000)
                });

                const messagePopule = await MessagePrive.findById(message._id)
                    .populate('expediteur', 'nom profilePhoto');

                io.to(dmRoomName(socket.userId, destinataire)).emit('new-dm', messagePopule);
                // Notifie le destinataire même s'il n'a pas la conversation ouverte (badge non-lu)
                io.to(`user:${destinataire}`).emit('dm-notification', messagePopule);
            } catch {
                socket.emit('error', { message: "Erreur lors de l'envoi du message" });
            }
        });

        // ── Indicateurs de saisie ──
        socket.on('dm-typing', ({ destinataire } = {}) => {
            if (!destinataire) return;
            socket.to(dmRoomName(socket.userId, destinataire)).emit('dm-user-typing', { userId: socket.userId });
        });

        socket.on('dm-stop-typing', ({ destinataire } = {}) => {
            if (!destinataire) return;
            socket.to(dmRoomName(socket.userId, destinataire)).emit('dm-user-stop-typing', { userId: socket.userId });
        });
    });
};

module.exports = { initDmSocket };
