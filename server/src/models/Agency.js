const mongoose = require('mongoose');

// T99 — Modèle Agence de voyage (M6)
// Une agence est créée par un utilisateur (proprietaire) en statut
// "en_attente", puis validée ou rejetée par un administrateur.

const serviceSchema = new mongoose.Schema({
    titre: { type: String, required: true, trim: true },
    description: { type: String, trim: true },
    prix: { type: Number, min: 0 },
    icone: { type: String }
}, { _id: false });

const agencySchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: 2000
    },
    logo: { type: String },
    couverture: { type: String },
    localisation: {
        type: String,
        trim: true
    },
    contact: {
        telephone: String,
        email: String,
        adresse: String,
        siteWeb: String,
        horaires: String
    },
    specialites: [{ type: String, trim: true }],
    services: [serviceSchema],
    proprietaire: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    statut: {
        type: String,
        enum: ['en_attente', 'approuvee', 'rejetee'],
        default: 'en_attente'
    },
    verifiee: {
        type: Boolean,
        default: false
    },
    motifRejet: {
        type: String,
        trim: true
    }
}, { timestamps: true });

// Recherche texte par nom / localisation
agencySchema.index({ nom: 'text', localisation: 'text' });

module.exports = mongoose.model('Agency', agencySchema);
