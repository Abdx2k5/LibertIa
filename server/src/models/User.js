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
    abonnement: {
        type: String,
        enum: ['free', 'premium'],
        default: 'free'
    },
    promptsUtilises: {
        type: Number,
        default: 0
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

module.exports = mongoose.model('User', userSchema);