const Agency = require('../models/Agency');
const { auditLog } = require('../utils/auditLogger'); // T127

const PROPRIETAIRE_SELECT = 'nom email';

// ─────────────────────────────────────────────
//  @GET /api/agences?statut=approuvee&q=...
//  Liste des agences. Par défaut, seules les agences approuvées
//  sont renvoyées (annuaire public). Filtre optionnel par statut
//  et recherche texte (nom / localisation).
// ─────────────────────────────────────────────
const listerAgences = async (req, res) => {
    try {
        const filtre = {};
        const statut = req.query.statut;
        if (statut && ['en_attente', 'approuvee', 'rejetee'].includes(statut)) {
            filtre.statut = statut;
        } else {
            filtre.statut = 'approuvee';
        }

        const q = (req.query.q || '').trim();
        if (q) {
            filtre.$or = [
                { nom: { $regex: q, $options: 'i' } },
                { localisation: { $regex: q, $options: 'i' } }
            ];
        }

        const agences = await Agency.find(filtre).sort({ createdAt: -1 });
        res.json({ success: true, data: agences, total: agences.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/agences/en-attente  (admin)
//  Liste des agences en attente de validation.
// ─────────────────────────────────────────────
const listerEnAttente = async (req, res) => {
    try {
        const agences = await Agency.find({ statut: 'en_attente' })
            .sort({ createdAt: 1 })
            .populate('proprietaire', PROPRIETAIRE_SELECT);
        res.json({ success: true, data: agences, total: agences.length });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/agences/:id
// ─────────────────────────────────────────────
const getAgence = async (req, res) => {
    try {
        const agence = await Agency.findById(req.params.id)
            .populate('proprietaire', PROPRIETAIRE_SELECT);
        if (!agence) {
            return res.status(404).json({ success: false, message: 'Agence non trouvée' });
        }
        res.json({ success: true, data: agence });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @POST /api/agences
//  Crée une agence en statut "en_attente" (proprietaire = req.user).
// ─────────────────────────────────────────────
const creerAgence = async (req, res) => {
    try {
        const nom = (req.body.nom || '').trim();
        if (!nom) {
            return res.status(400).json({ success: false, message: 'Le nom est requis' });
        }

        const agence = await Agency.create({
            nom,
            description: req.body.description,
            logo: req.body.logo,
            couverture: req.body.couverture,
            localisation: req.body.localisation,
            contact: req.body.contact,
            specialites: req.body.specialites,
            services: req.body.services,
            proprietaire: req.user._id,
            statut: 'en_attente',
            verifiee: false
        });

        res.status(201).json({ success: true, data: agence });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @PATCH /api/agences/:id/valider  (admin)
// ─────────────────────────────────────────────
const validerAgence = async (req, res) => {
    try {
        const agence = await Agency.findById(req.params.id);
        if (!agence) {
            return res.status(404).json({ success: false, message: 'Agence non trouvée' });
        }

        agence.statut = 'approuvee';
        agence.verifiee = true;
        agence.motifRejet = undefined;
        await agence.save();

        // T127 — trace de l'action admin
        await auditLog({
            userId: req.user._id,
            action: 'admin_valider_agence',
            req,
            success: true,
            details: { agenceId: String(agence._id), nom: agence.nom },
        });

        res.json({ success: true, data: agence });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @PATCH /api/agences/:id/rejeter  (admin)
//  body : { motif }
// ─────────────────────────────────────────────
const rejeterAgence = async (req, res) => {
    try {
        const agence = await Agency.findById(req.params.id);
        if (!agence) {
            return res.status(404).json({ success: false, message: 'Agence non trouvée' });
        }

        agence.statut = 'rejetee';
        agence.verifiee = false;
        agence.motifRejet = (req.body.motif || '').trim();
        await agence.save();

        // T127 — trace de l'action admin
        await auditLog({
            userId: req.user._id,
            action: 'admin_rejeter_agence',
            req,
            success: true,
            details: { agenceId: String(agence._id), nom: agence.nom, motif: agence.motifRejet },
        });

        res.json({ success: true, data: agence });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    listerAgences,
    listerEnAttente,
    getAgence,
    creerAgence,
    validerAgence,
    rejeterAgence
};
