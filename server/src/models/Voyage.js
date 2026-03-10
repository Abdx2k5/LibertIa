const mongoose = require('mongoose');

const voyageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
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
    likes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

module.exports = mongoose.model('Voyage', voyageSchema);