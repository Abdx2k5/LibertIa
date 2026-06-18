const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    auteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    contenu: {
        type: String,
        required: true,
        trim: true,
        maxlength: 5000
    },
    date: { type: Date, default: Date.now }
});

const forumSchema = new mongoose.Schema({
    titre: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200
    },
    categorie: {
        type: String,
        required: true,
        trim: true,
        maxlength: 100
    },
    auteur: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    posts: [postSchema]
}, { timestamps: true });

forumSchema.index({ createdAt: -1 });
forumSchema.index({ categorie: 1 });

module.exports = mongoose.model('Forum', forumSchema);
