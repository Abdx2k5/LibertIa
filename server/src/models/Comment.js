const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    voyage: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Voyage',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    texte: {
        type: String,
        required: true,
        trim: true,
        maxlength: 1000
    }
}, { timestamps: true });

// Pour récupérer les commentaires d'un voyage, du plus récent au plus ancien
commentSchema.index({ voyage: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
