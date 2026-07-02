const mongoose = require('mongoose');

const agenceSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: true,
        trim: true,
        maxlength: 150
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    telephone: {
        type: String,
        trim: true
    },
    description: {
        type: String,
        trim: true,
        maxlength: 1000,
        default: ''
    },
    adresse: {
        type: String,
        trim: true,
        default: ''
    },
    site: {
        type: String,
        trim: true,
        default: ''
    },
    logo: {
        type: String,
        default: ''
    },
    estValidee: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

agenceSchema.index({ estValidee: 1, createdAt: -1 });

module.exports = mongoose.model('Agence', agenceSchema);
