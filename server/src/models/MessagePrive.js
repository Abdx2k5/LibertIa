const mongoose = require('mongoose');

// ─────────────────────────────────────────────
//  Messagerie privée — message direct entre deux utilisateurs
//  (distinct de Message.js, qui est scopé à une Boîte collaborative)
// ─────────────────────────────────────────────
const messagePriveSchema = new mongoose.Schema({
    expediteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    destinataire: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contenu: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    },
    lu: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

// Pour charger l'historique d'une conversation, du plus récent au plus ancien
messagePriveSchema.index({ expediteur: 1, destinataire: 1, createdAt: -1 });
messagePriveSchema.index({ destinataire: 1, expediteur: 1, createdAt: -1 });

module.exports = mongoose.model('MessagePrive', messagePriveSchema);
