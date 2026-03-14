const mongoose = require('mongoose');

const voyageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Prompt original de l'utilisateur
    prompt: {
        type: String,
        required: true
    },
    itineraire: {
        type: Object,
        required: true
    },
    partage: {
        type: Boolean,
        default: false
    },
    // Titre généré automatiquement (affichage liste)
    titre: {
        type: String,
        required: true
    },
    
    // Destination principale (pour recherche/filtres)
    destination: {
        type: String,
        required: true
    },
    
    // Dates pour calculer la durée
    dates: {
        start: { 
            type: Date, 
            required: true 
        },
        end: { 
            type: Date, 
            required: true 
        }
    },
    // Budget pour suivi
    budget: {
        total: Number,
        currency: { 
            type: String, 
            default: 'EUR' 
        }
    },
    // Likes (tableau d'utilisateurs)
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    
    // Compteur de likes optimisé
    likeCount: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

//Met à jour likeCount avant sauvegarde
voyageSchema.pre('save', function(next) {
    this.likeCount = this.likes.length;
    next();
});

// Ajouter un like
voyageSchema.methods.ajouterLike = async function(userId) {
    if (!this.likes.includes(userId)) {
        this.likes.push(userId);
        await this.save();
    }
    return this;
};

// Retirer un like
voyageSchema.methods.retirerLike = async function(userId) {
    this.likes = this.likes.filter(id => id.toString() !== userId.toString());
    await this.save();
    return this;
};
// Pour recherche rapide par utilisateur
voyageSchema.index({ user: 1, createdAt: -1 });

// Pour le fil d'actualité (voyages publics)
voyageSchema.index({ partage: 1, createdAt: -1 });

module.exports = mongoose.model('Voyage', voyageSchema);