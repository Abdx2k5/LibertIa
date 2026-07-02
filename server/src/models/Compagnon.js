const mongoose = require('mongoose');

const compagnonSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    points: { type: Number, default: 0 },
    niveau: { type: Number, default: 1 },
    humeur: { type: String, default: 'joyeux' },
    historique_chat: [{
        role: String,
        content: String,
        date: { type: Date, default: Date.now }
    }],
    photos: [{
        data: String,
        caption: String,
        date: { type: Date, default: Date.now }
    }]
}, { timestamps: true });

compagnonSchema.methods.ajouterPoints = function(pts) {
    this.points += pts;
    this.niveau = Math.floor(this.points / 100) + 1;
    if (this.points > 500) this.humeur = "excite";
    else if (this.points > 200) this.humeur = "joyeux";
    else if (this.points > 50) this.humeur = "curieux";
    return this.save();
};

module.exports = mongoose.model("Compagnon", compagnonSchema);
