const User = require('../models/User');
const Voyage = require('../models/Voyage');
const Facture = require('../models/Facture');
const Agence = require('../models/Agence');
const Signalement = require('../models/Signalement');

// ── Middleware admin ──
const estAdmin = (req, res, next) => {
    const adminEmails = (process.env.ADMIN_EMAILS || '').split(',').map(e => e.trim().toLowerCase());
    if (!adminEmails.includes(req.user.email.toLowerCase())) {
        return res.status(403).json({ success: false, message: 'Accès réservé aux administrateurs' });
    }
    next();
};

// @GET /api/admin/stats
const getStats = async (req, res) => {
    try {
        const debut30j = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
        const [totalUsers, newUsers30j, totalVoyages, newVoyages30j, totalPremium, totalFactures, revenuTotal, topDestinations, signalements] = await Promise.all([
            User.countDocuments({ isActive: true }),
            User.countDocuments({ isActive: true, createdAt: { $gte: debut30j } }),
            Voyage.countDocuments(),
            Voyage.countDocuments({ createdAt: { $gte: debut30j } }),
            User.countDocuments({ abonnement: 'premium', isActive: true }),
            Facture.countDocuments({ statut: 'payee' }),
            Facture.aggregate([{ $match: { statut: 'payee' } }, { $group: { _id: null, total: { $sum: '$montant' } } }]),
            Voyage.aggregate([{ $group: { _id: '$destination', count: { $sum: 1 } } }, { $sort: { count: -1 } }, { $limit: 10 }]),
            Signalement.countDocuments({ statut: 'en_attente' })
        ]);
        res.json({
            success: true,
            data: {
                totalUsers, newUsers30j, totalVoyages, newVoyages30j,
                totalPremium, signalements,
                topDestinations: topDestinations.map(d => ({ destination: d._id, count: d.count })),
                finances: { facturesPayed: totalFactures, revenuTotal: revenuTotal[0]?.total || 0 }
            }
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @GET /api/admin/users
const getUsers = async (req, res) => {
    try {
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(50, Math.max(1, parseInt(req.query.limit) || 20));
        const { q, abonnement, actif } = req.query;
        const filtre = {};
        if (q) filtre.$or = [
            { nom: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') },
            { email: new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i') }
        ];
        if (abonnement) filtre.abonnement = abonnement;
        if (actif !== undefined) filtre.isActive = actif === 'true';
        const [users, total] = await Promise.all([
            User.find(filtre).select('nom email abonnement isActive promptsUtilises createdAt lastLogin').sort({ createdAt: -1 }).skip((page-1)*limit).limit(limit),
            User.countDocuments(filtre)
        ]);
        res.json({ success: true, data: users, page, totalPages: Math.ceil(total / limit), total });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @PATCH /api/admin/users/:id/suspendre
const suspendreUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        user.isActive = !user.isActive;
        await user.save({ validateModifiedOnly: true });
        res.json({ success: true, message: `Compte ${user.isActive ? 'réactivé' : 'suspendu'}`, isActive: user.isActive });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @DELETE /api/admin/users/:id
const supprimerUser = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        await Voyage.deleteMany({ user: user._id });
        await user.deleteOne();
        res.json({ success: true, message: 'Utilisateur supprimé' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @PATCH /api/admin/users/:id/premium
const togglePremium = async (req, res) => {
    try {
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        user.abonnement = user.abonnement === 'premium' ? 'free' : 'premium';
        await user.save({ validateModifiedOnly: true });
        res.json({ success: true, message: `Abonnement mis à jour : ${user.abonnement}`, abonnement: user.abonnement });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @PATCH /api/admin/users/:id/role
const changerRole = async (req, res) => {
    try {
        const { role } = req.body; // 'admin' ou 'user'
        if (!['admin', 'user'].includes(role)) return res.status(400).json({ success: false, message: 'Rôle invalide' });
        const user = await User.findById(req.params.id);
        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });

        // Ajouter/retirer de ADMIN_EMAILS n'est pas dynamique — on stocke le rôle dans un champ
        user.role = role;
        await user.save({ validateModifiedOnly: true });
        res.json({ success: true, message: `Rôle mis à jour : ${role}`, role });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @GET /api/admin/agences
const getAgences = async (req, res) => {
    try {
        const filtre = req.query.validees !== undefined ? { estValidee: req.query.validees === 'true' } : {};
        const agences = await Agence.find(filtre).sort({ createdAt: -1 }).limit(50);
        res.json({ success: true, data: agences });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @PATCH /api/admin/agences/:id/valider
const validerAgence = async (req, res) => {
    try {
        const agence = await Agence.findById(req.params.id);
        if (!agence) return res.status(404).json({ success: false, message: 'Agence non trouvée' });
        agence.estValidee = !agence.estValidee;
        await agence.save();
        res.json({ success: true, message: `Agence ${agence.estValidee ? 'validée' : 'invalidée'}`, estValidee: agence.estValidee });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { estAdmin, getStats, getUsers, suspendreUser, supprimerUser, togglePremium, changerRole, getAgences, validerAgence };