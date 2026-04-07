const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const { decrypt } = require('../utils/encryption'); // SA2

const userSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true
    },
    motDePasse: {
        type: String,
        required: true
    },
    age: {
        type: Number
    },
    // SA2 — stocké en base comme JSON chiffré (AES-256-CBC)
    preferences: {
        type: String,
        default: null
    },
    // GESTION ABONNEMENT FREE/PREMIUM 
    abonnement: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
    },
    promptsUtilises: {
        type: Number,
        default: 0,
        min: 0
    },
    // Limite adaptée selon abonnement (10 pour free, illimité pour premium)
    limitePrompts: {
        type: Number,
        default: 10,
        description: "10 pour free, on gère premium dans le code"
    },
    // Dates d'abonnement
    dateDebutAbonnement: {
        type: Date,
        description: "Quand l'utilisateur est passé premium"
    },
    dateFinAbonnement: {
        type: Date,
        description: "Quand l'abonnement expire (null si free)"
    },
    // Historique des paiements Stripe
    historiquePaiements: [{
        montant: Number,
        date: { type: Date, default: Date.now },
        stripePaymentId: String,
        statut: {
            type: String,
            enum: ['réussi', 'échoué', 'remboursé']
        }
    }],
   // Photo de profil 
    profilePhoto: {
        type: String,
        default: 'default-avatar.png'
    },
    // SA2 — bio chiffrée AES-256-CBC (maxlength retiré : données chiffrées plus longues)
    bio: {
        type: String
    },
    // Liste des followers (pour fonctionnalité sociale)
    followers: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Liste des abonnements (pour fonctionnalité sociale)
    following: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    // Token pour réinitialisation mot de passe
    resetPasswordToken: String,
    // Date d'expiration du token
    resetPasswordExpire: Date,
    // Refresh token (SA1)
    refreshToken: {
        type: String,
        default: null
    },
    // Dernière connexion
    lastLogin: Date,
    // État du compte (actif/désactivé)
    isActive: {
        type: Boolean,
        default: true
    }
}, { timestamps: true });

// Hash mot de passe avant sauvegarde
userSchema.pre('save', async function () {
    if (!this.isModified('motDePasse')) return;
    this.motDePasse = await bcrypt.hash(this.motDePasse, 10);
});
// Comparer mot de passe
userSchema.methods.comparerMotDePasse = async function (motDePasseSaisi) {
    return await bcrypt.compare(motDePasseSaisi, this.motDePasse);
};
//GÉRER FREE/PREMIUM :
// Vérifier si l'utilisateur peut encore générer des voyages
userSchema.methods.peutGenerer = function() {
    if (this.abonnement === 'premium') return true;
    return this.promptsUtilises < 10;
};
// Obtenir le nombre de prompts restants
userSchema.methods.promptsRestants = function() {
    if (this.abonnement === 'premium') return 'Illimité';
    return Math.max(0, 10 - this.promptsUtilises);
};
// Passer l'utilisateur en premium
userSchema.methods.passerEnPremium = function(dureeMois = 1) {
    this.abonnement = 'premium';
    this.dateDebutAbonnement = new Date();
    // Calcul de la date de fin (par défaut 1 mois)
    const fin = new Date();
    fin.setMonth(fin.getMonth() + dureeMois);
    this.dateFinAbonnement = fin;
    
    return this.save();
};
// Vérifier si l'abonnement premium a expiré
userSchema.methods.estExpire = function() {
    if (this.abonnement !== 'premium') return false;
    if (!this.dateFinAbonnement) return false;
    return new Date() > this.dateFinAbonnement;
};

// SA2 — Déchiffrement automatique des champs sensibles dans les réponses JSON
userSchema.set('toJSON', {
    transform(doc, ret) {
        // Déchiffrer bio
        if (ret.bio) {
            ret.bio = decrypt(ret.bio);
        }
        // Déchiffrer preferences (stocké comme JSON chiffré → retourner tableau)
        if (ret.preferences) {
            try {
                ret.preferences = JSON.parse(decrypt(ret.preferences));
            } catch {
                ret.preferences = [];
            }
        } else {
            ret.preferences = [];
        }
        // Supprimer les champs sensibles des réponses
        delete ret.motDePasse;
        delete ret.resetPasswordToken;
        delete ret.resetPasswordExpire;
        delete ret.refreshToken;
        return ret;
    }
});

// Index textuel pour recherche par nom
userSchema.index({ nom: 'text' });

module.exports = mongoose.model('User', userSchema);