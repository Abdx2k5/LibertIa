// SA5 — Blacklist JWT : tokens révoqués purgés automatiquement via TTL index
const mongoose = require('mongoose');

const blacklistedTokenSchema = new mongoose.Schema({
    token: {
        type: String,
        required: true,
        unique: true
    },
    // TTL index : MongoDB supprime automatiquement le document quand expireAt est atteint
    expireAt: {
        type: Date,
        required: true
    }
});

// Index unique sur le token pour les lookups rapides
blacklistedTokenSchema.index({ token: 1 });

// TTL index : purge automatique (expires: 0 = supprimer à expireAt exactement)
blacklistedTokenSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('BlacklistedToken', blacklistedTokenSchema, 'blacklisted_tokens');
