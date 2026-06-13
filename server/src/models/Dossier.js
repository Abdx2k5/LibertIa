const mongoose = require('mongoose');

const dossierSchema = new mongoose.Schema({
    voyage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voyage',
        required: true,
        unique: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Titre du carnet (initialisé avec le titre du voyage)
    titre: {
        type: String,
        trim: true,
        maxlength: 100
    },
    notes: {
        type: String,
        trim: true,
        maxlength: 2000,
        default: ''
    },
    // Photos du voyage (T79) — stockées en base64
    photos: [{
        data: { type: String, required: true },
        caption: { type: String, trim: true, maxlength: 200, default: '' },
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

// Pour lister les carnets d'un utilisateur
dossierSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Dossier', dossierSchema);
