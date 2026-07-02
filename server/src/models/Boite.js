const mongoose = require('mongoose');

// ─────────────────────────────────────────────
//  T82 — Boîte collaborative (groupe de voyage)
//  Permet à plusieurs utilisateurs d'échanger autour
//  d'un voyage via une messagerie temps réel (T84).
// ─────────────────────────────────────────────
const boiteSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    },
    image: {
        type: String,
        default: ''
    },
    // Voyage associé (optionnel)
    voyageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voyage',
        default: null
    },
    createur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    membres: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }]
}, { timestamps: true });

// Pour lister rapidement les boîtes d'un utilisateur
boiteSchema.index({ membres: 1 });

module.exports = mongoose.model('Boite', boiteSchema);
