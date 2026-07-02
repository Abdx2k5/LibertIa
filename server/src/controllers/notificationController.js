const Notification = require('../models/Notification');
const { getIO, emitNotification } = require('../sockets/notificationSocket');

const EXPEDITEUR_SELECT = 'nom profilePhoto';

// ─────────────────────────────────────────────
//  HELPER INTERNE — crée une notification et la pousse
//  en temps réel via Socket.IO. Appelé par d'autres
//  contrôleurs (likes, commentaires, invitations boîte...).
//
//  params : { destinataire, expediteur, type, contenu, lien }
// ─────────────────────────────────────────────
const creerNotification = async ({ destinataire, expediteur = null, type, contenu, lien = '' }) => {
    try {
        if (!destinataire || !type || !contenu) return null;

        // Pas de notification quand on déclenche soi-même l'action
        if (expediteur && destinataire.toString() === expediteur.toString()) {
            return null;
        }

        const notification = await Notification.create({
            destinataire,
            expediteur,
            type,
            contenu,
            lien
        });

        const notifPopulee = await Notification.findById(notification._id)
            .populate('expediteur', EXPEDITEUR_SELECT);

        const io = getIO();
        if (io) emitNotification(io, destinataire.toString(), notifPopulee);

        return notifPopulee;
    } catch {
        return null;
    }
};

// ─────────────────────────────────────────────
//  @GET /api/notifications?page=1&limit=20
//  Liste paginée des notifications de l'utilisateur connecté
// ─────────────────────────────────────────────
const getNotifications = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit, 10) || 20));
        const skip = (page - 1) * limit;

        const [notifications, total] = await Promise.all([
            Notification.find({ destinataire: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit)
                .populate('expediteur', EXPEDITEUR_SELECT),
            Notification.countDocuments({ destinataire: req.user._id })
        ]);

        res.json({
            success: true,
            data: notifications,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/notifications/non-lues/count
// ─────────────────────────────────────────────
const getNonLuesCount = async (req, res) => {
    try {
        const count = await Notification.countDocuments({ destinataire: req.user._id, lu: false });
        res.json({ success: true, count });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @PATCH /api/notifications/:id/lire
// ─────────────────────────────────────────────
const marquerLue = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ success: false, message: 'Notification non trouvée' });

        if (notification.destinataire.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        notification.lu = true;
        await notification.save();

        res.json({ success: true, data: notification });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @PATCH /api/notifications/tout-lire
// ─────────────────────────────────────────────
const marquerToutLu = async (req, res) => {
    try {
        await Notification.updateMany(
            { destinataire: req.user._id, lu: false },
            { $set: { lu: true } }
        );

        res.json({ success: true, message: 'Toutes les notifications ont été marquées comme lues' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @DELETE /api/notifications/:id
// ─────────────────────────────────────────────
const supprimerNotification = async (req, res) => {
    try {
        const notification = await Notification.findById(req.params.id);
        if (!notification) return res.status(404).json({ success: false, message: 'Notification non trouvée' });

        if (notification.destinataire.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }

        await notification.deleteOne();

        res.json({ success: true, message: 'Notification supprimée' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    getNotifications,
    getNonLuesCount,
    marquerLue,
    marquerToutLu,
    supprimerNotification,
    creerNotification
};
