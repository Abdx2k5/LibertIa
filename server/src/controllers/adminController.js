// =============================================================
// FICHIER  : src/controllers/adminController.js
// TÂCHE    : T127 — [M9] Logs d'activité admin
//
// Expose la consultation des journaux d'audit (collection
// audit_logs) à l'administrateur : connexions, modifications de
// profil, exports, validations d'agences, etc.
// =============================================================

const AuditLog = require('../models/AuditLog');

// Bornes de pagination
const DEFAULT_LIMIT = 50;
const MAX_LIMIT = 200;

// ─────────────────────────────────────────────
//  @GET /api/admin/logs  (admin)
//  Filtres : ?action=  ?success=true|false  ?userId=
//            ?page=1  ?limit=50
//  Tri : du plus récent au plus ancien.
// ─────────────────────────────────────────────
const getLogs = async (req, res) => {
    try {
        const filtre = {};

        if (req.query.action) filtre.action = req.query.action;
        if (req.query.userId) filtre.userId = req.query.userId;
        if (req.query.success === 'true') filtre.success = true;
        if (req.query.success === 'false') filtre.success = false;

        const page = Math.max(1, parseInt(req.query.page, 10) || 1);
        const limit = Math.min(MAX_LIMIT, Math.max(1, parseInt(req.query.limit, 10) || DEFAULT_LIMIT));
        const skip = (page - 1) * limit;

        const [logs, total] = await Promise.all([
            AuditLog.find(filtre)
                .sort({ timestamp: -1 })
                .skip(skip)
                .limit(limit)
                .populate('userId', 'nom email role')
                .lean(),
            AuditLog.countDocuments(filtre),
        ]);

        res.json({
            success: true,
            data: logs,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit) || 0,
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @GET /api/admin/logs/stats  (admin)
//  Répartition des actions + taux d'échec, pour le tableau de bord.
// ─────────────────────────────────────────────
const getLogsStats = async (req, res) => {
    try {
        const parAction = await AuditLog.aggregate([
            {
                $group: {
                    _id: '$action',
                    total: { $sum: 1 },
                    echecs: { $sum: { $cond: [{ $eq: ['$success', false] }, 1, 0] } },
                },
            },
            { $sort: { total: -1 } },
        ]);

        const total = parAction.reduce((acc, a) => acc + a.total, 0);
        const echecs = parAction.reduce((acc, a) => acc + a.echecs, 0);

        res.json({
            success: true,
            data: {
                total,
                echecs,
                parAction: parAction.map((a) => ({ action: a._id, total: a.total, echecs: a.echecs })),
            },
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getLogs, getLogsStats };
