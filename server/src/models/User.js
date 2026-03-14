const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

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
    preferences: {
        type: [String],
        default: []
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
    // Bio de l'utilisateur
    bio: {
        type: String,
        maxlength: 500
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
// Index pour recherche rapide par email
userSchema.index({ email: 1 });
// Index textuel pour recherche par nom
userSchema.index({ nom: 'text' });


module.exports = mongoose.model('User', userSchema);