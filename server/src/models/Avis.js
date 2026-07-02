const mongoose = require('mongoose');

// ─────────────────────────────────────────────
//  T95 — Avis sur les agences / hôtels / vols
//  Un utilisateur ne peut laisser qu'un seul avis par cible
//  (cibleType + cibleNom) — un nouvel envoi met à jour l'avis
//  existant (voir avisController.creerAvis).
// ─────────────────────────────────────────────
const avisSchema = new mongoose.Schema({
    cibleType: {
        type: String,
        enum: ['agence', 'hotel', 'vol'],
        required: true
    },
    cibleNom: {
        type: String,
        required: true,
        trim: true
    },
    utilisateur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    note: {
        type: Number,
        required: true,
        min: 1,
        max: 5
    },
    commentaire: {
        type: String,
        trim: true,
        maxlength: 500,
        default: ''
    }
}, { timestamps: true });

// Pour lister rapidement les avis d'une cible, du plus récent au plus ancien
avisSchema.index({ cibleType: 1, cibleNom: 1, createdAt: -1 });
// Un seul avis par utilisateur et par cible
avisSchema.index({ cibleType: 1, cibleNom: 1, utilisateur: 1 }, { unique: true });

module.exports = mongoose.model('Avis', avisSchema);
