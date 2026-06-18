const Facture = require('../models/Facture');

function getPagination(req, { defaultLimit = 10, maxLimit = 50 } = {}) {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));
    return { page, limit, skip: (page - 1) * limit };
}

// ─────────────────────────────────────────────
//  T109 — @GET /api/factures
//  Factures de l'utilisateur connecté
// ─────────────────────────────────────────────
const getMesFactures = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);

        const [factures, total] = await Promise.all([
            Facture.find({ user: req.user._id })
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(limit),
            Facture.countDocuments({ user: req.user._id })
        ]);

        res.json({ success: true, data: factures, page, totalPages: Math.ceil(total / limit), total });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/factures/:id
// ─────────────────────────────────────────────
const getFacture = async (req, res) => {
    try {
        const facture = await Facture.findOne({ _id: req.params.id, user: req.user._id });
        if (!facture) return res.status(404).json({ success: false, message: 'Facture non trouvée' });
        res.json({ success: true, data: facture });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @POST /api/factures
//  Créer une facture (usage interne / admin)
// ─────────────────────────────────────────────
const creerFacture = async (req, res) => {
    try {
        const { montant, description, statut } = req.body;
        if (montant === undefined || montant < 0) {
            return res.status(400).json({ success: false, message: 'Montant invalide' });
        }

        const facture = await Facture.create({
            user: req.user._id,
            montant,
            description: description || 'Abonnement LibertIa',
            statut: statut || 'en_attente'
        });

        res.status(201).json({ success: true, data: facture });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getMesFactures, getFacture, creerFacture };
