const mongoose = require('mongoose');

// ─────────────────────────────────────────────
//  T71 — Notification temps réel
//  Créée par d'autres contrôleurs (likes, commentaires,
//  invitations, messages...) et poussée en direct via
//  Socket.IO (voir sockets/notificationSocket.js).
// ─────────────────────────────────────────────
const notificationSchema = new mongoose.Schema({
    destinataire: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    type: {
        type: String,
        enum: ['like', 'commentaire', 'abonnement', 'invitation_boite', 'message'],
        required: true
    },
    contenu: {
        type: String,
        required: true,
        trim: true
    },
    lien: {
        type: String,
        default: ''
    },
    lu: {
        type: Boolean,
        default: false
    },
    expediteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    }
}, { timestamps: true });

// Pour lister rapidement les notifications d'un utilisateur (les plus récentes d'abord)
notificationSchema.index({ destinataire: 1, createdAt: -1 });
// Pour compter rapidement les notifications non lues
notificationSchema.index({ destinataire: 1, lu: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
