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
    // T50 — Niveau de visibilité du voyage
    //   prive  : visible uniquement par le propriétaire
    //   amis   : visible par le propriétaire + ses followers
    //   public : visible par tout le monde (fil communauté)
    visibilite: {
        type: String,
        enum: ['prive', 'amis', 'public'],
        default: 'prive'
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
    },

    // Compteur de commentaires optimisé (T59)
    commentCount: {
        type: Number,
        default: 0
    }

}, { timestamps: true });

//Met à jour likeCount avant sauvegarde
voyageSchema.pre('save', function() {
    this.likeCount = this.likes.length;

    // T50 — Garder `partage` synchronisé avec `visibilite` (rétrocompatibilité
    // fil communauté + contrôle d'accès qui se basaient sur `partage`)
    if (this.isModified('visibilite')) {
        this.partage = this.visibilite !== 'prive';
    } else if (this.isModified('partage')) {
        if (this.partage && this.visibilite === 'prive') this.visibilite = 'public';
        if (!this.partage) this.visibilite = 'prive';
    }
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

// T55 — Pour le fil communauté filtré par visibilité
voyageSchema.index({ visibilite: 1, createdAt: -1 });

module.exports = mongoose.model('Voyage', voyageSchema);