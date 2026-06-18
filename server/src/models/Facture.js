const mongoose = require('mongoose');
const crypto = require('crypto');

const factureSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    montant: {
        type: Number,
        required: true,
        min: 0
    },
    date: {
        type: Date,
        default: Date.now
    },
    statut: {
        type: String,
        enum: ['payee', 'en_attente', 'annulee'],
        default: 'en_attente'
    },
    reference: {
        type: String,
        unique: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: 200,
        default: 'Abonnement LibertIa'
    }
}, { timestamps: true });

factureSchema.pre('save', function () {
    if (!this.reference) {
        const ts = Date.now().toString(36).toUpperCase();
        const rand = crypto.randomBytes(3).toString('hex').toUpperCase();
        this.reference = `LIB-${ts}-${rand}`;
    }
});

factureSchema.index({ user: 1, createdAt: -1 });

module.exports = mongoose.model('Facture', factureSchema);
