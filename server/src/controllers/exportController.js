// =============================================================
// FICHIER  : src/controllers/exportController.js
// TÂCHE    : T128 — [M9] Export données CSV / Excel (admin)
//
// Exporte les données de la plateforme au format CSV (ouvrable
// dans Excel/LibreOffice). Réservé aux administrateurs.
//
// Paramètres de requête communs :
//   ?sep=;        → séparateur de colonnes (défaut ",", ";" pour Excel FR)
//   ?statut=...   → filtres spécifiques selon la ressource
//
// Aucune dépendance externe : voir utils/csvExport.js.
// =============================================================

const User = require('../models/User');
const Voyage = require('../models/Voyage');
const Agency = require('../models/Agency');
const { toCSV, sendCSV } = require('../utils/csvExport');
const { auditLog } = require('../utils/auditLogger');

// Le séparateur ";" est pratique pour Excel en locale française.
const resolveDelimiter = (req) => (req.query.sep === ';' ? ';' : ',');

const oui = (v) => (v ? 'Oui' : 'Non');

// ─────────────────────────────────────────────
//  @GET /api/export/utilisateurs  (admin)
//  Filtres : ?role=admin|user  ?abonnement=free|premium  ?actif=true|false
//  N'expose AUCUN champ sensible (mot de passe, tokens, bio chiffrée).
// ─────────────────────────────────────────────
const exporterUtilisateurs = async (req, res) => {
    try {
        const filtre = {};
        if (['user', 'admin'].includes(req.query.role)) filtre.role = req.query.role;
        if (['free', 'premium'].includes(req.query.abonnement)) filtre.abonnement = req.query.abonnement;
        if (req.query.actif === 'true') filtre.isActive = true;
        if (req.query.actif === 'false') filtre.isActive = false;

        const users = await User.find(filtre)
            .select('nom email role abonnement promptsUtilises isActive lastLogin createdAt')
            .sort({ createdAt: -1 })
            .lean();

        const columns = [
            { key: 'nom', header: 'Nom' },
            { key: 'email', header: 'Email' },
            { key: 'role', header: 'Rôle' },
            { key: 'abonnement', header: 'Abonnement' },
            { key: 'promptsUtilises', header: 'Prompts utilisés' },
            { key: 'isActive', header: 'Actif', map: oui },
            { key: 'lastLogin', header: 'Dernière connexion' },
            { key: 'createdAt', header: 'Inscription' },
        ];

        const csv = toCSV(users, columns, { delimiter: resolveDelimiter(req) });

        await auditLog({
            userId: req.user._id,
            action: 'export_data',
            req,
            success: true,
            details: { ressource: 'utilisateurs', total: users.length },
        });

        sendCSV(res, 'utilisateurs', csv);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/export/voyages  (admin)
//  Filtres : ?visibilite=prive|amis|public
// ─────────────────────────────────────────────
const exporterVoyages = async (req, res) => {
    try {
        const filtre = {};
        if (['prive', 'amis', 'public'].includes(req.query.visibilite)) {
            filtre.visibilite = req.query.visibilite;
        }

        const voyages = await Voyage.find(filtre)
            .select('titre destination dates budget visibilite likeCount commentCount user createdAt')
            .populate('user', 'nom email')
            .sort({ createdAt: -1 })
            .lean();

        const columns = [
            { key: 'titre', header: 'Titre' },
            { key: 'destination', header: 'Destination' },
            { key: 'user.nom', header: 'Voyageur' },
            { key: 'user.email', header: 'Email voyageur' },
            { key: 'dates.start', header: 'Départ', map: (d) => (d ? new Date(d) : '') },
            { key: 'dates.end', header: 'Retour', map: (d) => (d ? new Date(d) : '') },
            { key: 'budget.total', header: 'Budget' },
            { key: 'budget.currency', header: 'Devise' },
            { key: 'visibilite', header: 'Visibilité' },
            { key: 'likeCount', header: 'Likes' },
            { key: 'commentCount', header: 'Commentaires' },
            { key: 'createdAt', header: 'Créé le' },
        ];

        const csv = toCSV(voyages, columns, { delimiter: resolveDelimiter(req) });

        await auditLog({
            userId: req.user._id,
            action: 'export_data',
            req,
            success: true,
            details: { ressource: 'voyages', total: voyages.length },
        });

        sendCSV(res, 'voyages', csv);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/export/agences  (admin)
//  Filtres : ?statut=en_attente|approuvee|rejetee
// ─────────────────────────────────────────────
const exporterAgences = async (req, res) => {
    try {
        const filtre = {};
        if (['en_attente', 'approuvee', 'rejetee'].includes(req.query.statut)) {
            filtre.statut = req.query.statut;
        }

        const agences = await Agency.find(filtre)
            .select('nom localisation statut verifiee specialites contact proprietaire motifRejet createdAt')
            .populate('proprietaire', 'nom email')
            .sort({ createdAt: -1 })
            .lean();

        const columns = [
            { key: 'nom', header: 'Nom' },
            { key: 'localisation', header: 'Localisation' },
            { key: 'statut', header: 'Statut' },
            { key: 'verifiee', header: 'Vérifiée', map: oui },
            { key: 'specialites', header: 'Spécialités' },
            { key: 'contact.email', header: 'Email contact' },
            { key: 'contact.telephone', header: 'Téléphone' },
            { key: 'proprietaire.nom', header: 'Propriétaire' },
            { key: 'proprietaire.email', header: 'Email propriétaire' },
            { key: 'motifRejet', header: 'Motif rejet' },
            { key: 'createdAt', header: 'Créée le' },
        ];

        const csv = toCSV(agences, columns, { delimiter: resolveDelimiter(req) });

        await auditLog({
            userId: req.user._id,
            action: 'export_data',
            req,
            success: true,
            details: { ressource: 'agences', total: agences.length },
        });

        sendCSV(res, 'agences', csv);
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    exporterUtilisateurs,
    exporterVoyages,
    exporterAgences,
};
