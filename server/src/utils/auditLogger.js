// SA4 — Logger d'audit centralisé
const AuditLog = require('../models/AuditLog');

/**
 * Enregistre une action critique dans la collection audit_logs.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId|null} params.userId
 * @param {string}  params.action    - voir enum dans AuditLog.js
 * @param {Object}  params.req       - req Express (pour ip et userAgent)
 * @param {boolean} params.success
 * @param {Object}  [params.details] - infos supplémentaires (email, raison...)
 */
const auditLog = async ({ userId = null, action, req, success, details = {} }) => {
    try {
        await AuditLog.create({
            userId,
            action,
            ip:        req?.ip || req?.connection?.remoteAddress || null,
            userAgent: req?.headers?.['user-agent'] || null,
            success,
            details,
            timestamp: new Date()
        });
    } catch {
        // Un échec de logging ne doit jamais faire planter l'application
    }
};

module.exports = { auditLog };
