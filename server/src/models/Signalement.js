const mongoose = require('mongoose');

const signalementSchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['voyage', 'commentaire', 'utilisateur', 'groupe', 'forum'],
        required: true
    },
    cible: {
        type: String,
        required: true,
        trim: true
    },
    cibleId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true
    },
    raison: {
        type: String,
        required: true,
        trim: true,
        maxlength: 500
    },
    auteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    statut: {
        type: String,
        enum: ['en_attente', 'traite', 'rejete'],
        default: 'en_attente'
    }
}, { timestamps: true });

signalementSchema.index({ statut: 1, createdAt: -1 });

module.exports = mongoose.model('Signalement', signalementSchema);
