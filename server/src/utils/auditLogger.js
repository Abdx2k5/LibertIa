// SA4 — Logger d'audit centralisé
// T127/T138 — chaque action critique est désormais (1) persistée en base
// (collection audit_logs) ET (2) émise dans Winston (fichiers logs/).
const AuditLog = require('../models/AuditLog');
const logger = require('../config/logger');

/**
 * Enregistre une action critique dans la collection audit_logs
 * et la reflète dans les logs applicatifs Winston.
 *
 * @param {Object} params
 * @param {mongoose.Types.ObjectId|null} params.userId
 * @param {string}  params.action    - voir enum dans AuditLog.js
 * @param {Object}  params.req       - req Express (pour ip et userAgent)
 * @param {boolean} params.success
 * @param {Object}  [params.details] - infos supplémentaires (email, raison...)
 */
const auditLog = async ({ userId = null, action, req, success, details = {} }) => {
    const meta = {
        userId: userId ? String(userId) : null,
        ip: req?.ip || req?.connection?.remoteAddress || null,
        success,
        ...details,
    };

    // (2) Trace applicative — un échec d'audit "métier" remonte en warn.
    if (success === false) {
        logger.warn(`audit:${action}`, meta);
    } else {
        logger.info(`audit:${action}`, meta);
    }

    try {
        await AuditLog.create({
            userId,
            action,
            ip:        meta.ip,
            userAgent: req?.headers?.['user-agent'] || null,
            success,
            details,
            timestamp: new Date(),
        });
    } catch (err) {
        // Un échec de logging ne doit jamais faire planter l'application,
        // mais on le signale dans les logs applicatifs.
        logger.error(`Échec d'écriture audit_logs (action=${action}): ${err.message}`);
    }
};

module.exports = { auditLog };
