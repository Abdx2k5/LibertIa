const mongoose = require('mongoose');

// T64 — Groupes de voyageurs (communauté)
const groupeSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ''
    },
    // URL ou image encodée (base64), facultative
    image: {
        type: String,
        default: ''
    },
    membres: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    createur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Destination principale du groupe (pour la recherche)
    destination: {
        type: String,
        trim: true,
        default: ''
    },
    tags: [{
        type: String,
        trim: true,
        lowercase: true
    }]
}, { timestamps: true });

// Pour la liste paginée des groupes (les plus récents en premier)
groupeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Groupe', groupeSchema);
