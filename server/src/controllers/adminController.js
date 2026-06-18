const User = require('../models/User');
const Voyage = require('../models/Voyage');
const Facture = require('../models/Facture');
const Agence = require('../models/Agence');
const Signalement = require('../models/Signalement');

// ─────────────────────────────────────────────
//  MIDDLEWARE — vérifier rôle admin
//  Utilise req.user.role (à ajouter au User model si besoin)
//  Pour l'instant on utilise un flag dans l'env pour simplifier
// ─────────────────────────────────────────────
const estAdmin = (req, res, next) => {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    if (!adminEmails.includes(req.user.email)) {
        return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
    }
    next();
};

// ─────────────────────────────────────────────
//  T119 — @GET /api/admin/stats
// ─────────────────────────────────────────────
const getStats = async (req, res) => {
    try {
        const maintenant = new Date();
        const debut30j = new Date(maintenant.getTime() - 30 * 24 * 60 * 60 * 1000);

        const [
            totalUsers,
            newUsers30j,
            totalVoyages,
            newVoyages30j,
            totalPremium,
            totalFactures,
            revenuTotal,
            topDestinations,
            signalements
        ] = await Promise.all([
            User.countDocuments({ isActive: true }),
            User.countDocuments({ isActive: true, createdAt: { $gte: debut30j } }),
            Voyage.countDocuments(),
            Voyage.countDocuments({ createdAt: { $gte: debut30j } }),
            User.countDocuments({ abonnement: 'premium', isActive: true }),
            Facture.countDocuments({ statut: 'payee' }),
            Facture.aggregate([{ $match: { statut: 'payee' } }, { $group: { _id: null, total: { $sum: '$montant' } } }]),
            Voyage.aggregate([
                { $group: { _id: '$destination', count: { $sum: 1 } } },
                { $sort: { count: -1 } },
                { $limit: 10 }
            ]),
            Signalement.countDocuments({ statut: 'en_attente' })
        ]);

        res.json({
            success: true,
            data: {
                users: { total: totalUsers, nouveaux30j: newUsers30j, premium: totalPremium },
                voyages: { total: totalVoyages, nouveaux30j: newVoyages30j },
                finances: { facturesPayed: totalFactures, revenuTotal: revenuTotal[0]?.total || 0 },
                topDestinations: topDestinations.map(d => ({ destination: d._id, count: d.count })),
                signalements_en_attente: signalements
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  T122 — @GET /api/admin/users
// ─────────────────────────────────────────────
const getUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const { q, abonnement, actif } = req.query;

        const filtre = {};
        if (q) filtre.$or = [
            { nom: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
            { email: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
        ];
        if (abonnement) filtre.abonnement = abonnement;
        if (actif !== undefined) filtre.isActive = actif === 'true';

        const [users, total] = await Promise.all([
            User.find(filtre)
                .select('nom email abonnement isActive promptsUtilises createdAt lastLogin')
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            User.countDocuments(filtre)
        ]);

        res.json({ success: true, data: users, page, totalPages: Math.ceil(total / limit), total });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  T122 — @PATCH /api/admin/users/:id/suspendre
// ─────────────────────────────────────────────
const suspendreUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

        user.isActive = !user.isActive;
        await user.save({ validateModifiedOnly: true });

        const action = user.isActive ? 'réactivé' : 'suspendu';
        res.json({ success: true, message: `Compte ${action}`, isActive: user.isActive });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  T126 — @GET /api/admin/agences
// ─────────────────────────────────────────────
const getAgences = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const skip = (page - 1) * limit;
        const filtre = req.query.validees !== undefined ? { estValidee: req.query.validees === 'true' } : {};

        const [agences, total] = await Promise.all([
            Agence.find(filtre).sort({ createdAt: -1 }).skip(skip).limit(limit),
            Agence.countDocuments(filtre)
        ]);

        res.json({ success: true, data: agences, page, totalPages: Math.ceil(total / limit), total });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  T126 — @PATCH /api/admin/agences/:id/valider
// ─────────────────────────────────────────────
const validerAgence = async (req, res) => {
    try {
        const agence = await Agence.findById(req.params.id);
        if (!agence) return res.status(404).json({ success: false, message: 'Agence non trouvée' });

        agence.estValidee = !agence.estValidee;
        await agence.save();

        const action = agence.estValidee ? 'validée' : 'invalidée';
        res.json({ success: true, message: `Agence ${action}`, estValidee: agence.estValidee });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { estAdmin, getStats, getUsers, suspendreUser, getAgences, validerAgence };
