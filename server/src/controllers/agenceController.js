const Agence = require('../models/Agence');

function getPagination(req, { defaultLimit = 10, maxLimit = 50 } = {}) {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(maxLimit, Math.max(1, parseInt(req.query.limit) || defaultLimit));
    return { page, limit, skip: (page - 1) * limit };
}

// ─────────────────────────────────────────────
//  @GET /api/agences
// ─────────────────────────────────────────────
const getAgences = async (req, res) => {
    try {
        const { page, limit, skip } = getPagination(req);
        const filtre = req.query.validees === 'true' ? { estValidee: true } : {};

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
//  @GET /api/agences/:id
// ─────────────────────────────────────────────
const getAgence = async (req, res) => {
    try {
        const agence = await Agence.findById(req.params.id);
        if (!agence) return res.status(404).json({ success: false, message: 'Agence non trouvée' });
        res.json({ success: true, data: agence });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @POST /api/agences
// ─────────────────────────────────────────────
const creerAgence = async (req, res) => {
    try {
        const { nom, email, telephone, description, adresse, site, logo } = req.body;
        if (!nom || !email) {
            return res.status(400).json({ success: false, message: 'nom et email sont requis' });
        }

        const existe = await Agence.findOne({ email: email.toLowerCase() });
        if (existe) {
            return res.status(400).json({ success: false, message: 'Email déjà utilisé' });
        }

        const agence = await Agence.create({ nom, email, telephone, description, adresse, site, logo });
        res.status(201).json({ success: true, data: agence });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @PUT /api/agences/:id
// ─────────────────────────────────────────────
const updateAgence = async (req, res) => {
    try {
        const { nom, telephone, description, adresse, site, logo } = req.body;
        const agence = await Agence.findByIdAndUpdate(
            req.params.id,
            { $set: { nom, telephone, description, adresse, site, logo } },
            { new: true, runValidators: true }
        );
        if (!agence) return res.status(404).json({ success: false, message: 'Agence non trouvée' });
        res.json({ success: true, data: agence });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @DELETE /api/agences/:id
// ─────────────────────────────────────────────
const supprimerAgence = async (req, res) => {
    try {
        const agence = await Agence.findByIdAndDelete(req.params.id);
        if (!agence) return res.status(404).json({ success: false, message: 'Agence non trouvée' });
        res.json({ success: true, message: 'Agence supprimée' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getAgences, getAgence, creerAgence, updateAgence, supprimerAgence };
