const mongoose = require('mongoose');

// ─────────────────────────────────────────────
//  T82/T84 — Message d'une boîte collaborative
// ─────────────────────────────────────────────
const messageSchema = new mongoose.Schema({
    boiteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Boite',
        required: true
    },
    auteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contenu: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    }
}, { timestamps: true });

// Pour charger l'historique d'une boîte, du plus récent au plus ancien
messageSchema.index({ boiteId: 1, createdAt: -1 });

module.exports = mongoose.model('Message', messageSchema);
