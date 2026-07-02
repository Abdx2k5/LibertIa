const mongoose = require('mongoose');
const MessagePrive = require('../models/MessagePrive');
const User = require('../models/User');

// ─────────────────────────────────────────────
//  @GET /api/messages/conversations
//  Liste des conversations de l'utilisateur connecté, triées par
//  dernier message, avec le compteur de messages non lus.
// ─────────────────────────────────────────────
const getConversations = async (req, res) => {
    try {
        const moi = req.user._id;

        const conversations = await MessagePrive.aggregate([
            { $match: { $or: [{ expediteur: moi }, { destinataire: moi }] } },
            { $sort: { createdAt: -1 } },
            {
                $group: {
                    _id: {
                        $cond: [{ $eq: ['$expediteur', moi] }, '$destinataire', '$expediteur']
                    },
                    dernierMessage: { $first: '$$ROOT' },
                    nonLus: {
                        $sum: {
                            $cond: [
                                { $and: [{ $eq: ['$destinataire', moi] }, { $eq: ['$lu', false] }] },
                                1, 0
                            ]
                        }
                    }
                }
            },
            { $sort: { 'dernierMessage.createdAt': -1 } }
        ]);

        const autresIds = conversations.map((c) => c._id);
        const utilisateurs = await User.find({ _id: { $in: autresIds } }).select('nom profilePhoto');
        const utilisateursMap = new Map(utilisateurs.map((u) => [u._id.toString(), u]));

        const data = conversations
            .filter((c) => utilisateursMap.has(c._id.toString()))
            .map((c) => ({
                utilisateur: utilisateursMap.get(c._id.toString()),
                dernierMessage: c.dernierMessage,
                nonLus: c.nonLus
            }));

        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/messages/:userId?page=1&limit=30
//  Historique paginé de la conversation avec :userId.
//  Marque les messages reçus non lus comme lus au passage.
// ─────────────────────────────────────────────
const getThread = async (req, res) => {
    try {
        const moi = req.user._id;
        const { userId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ success: false, message: 'Identifiant invalide' });
        }

        const autre = await User.findById(userId).select('nom profilePhoto');
        if (!autre) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit, 10) || 30));
        const skip = (page - 1) * limit;

        const filtre = {
            $or: [
                { expediteur: moi, destinataire: userId },
                { expediteur: userId, destinataire: moi }
            ]
        };

        const [messages, total] = await Promise.all([
            MessagePrive.find(filtre)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('expediteur', 'nom profilePhoto'),
            MessagePrive.countDocuments(filtre)
        ]);

        await MessagePrive.updateMany(
            { expediteur: userId, destinataire: moi, lu: false },
            { $set: { lu: true } }
        );

        res.json({
            success: true,
            data: messages.reverse(),
            utilisateur: autre,
            pagination: { page, limit, total, pages: Math.ceil(total / limit) }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getConversations, getThread };
