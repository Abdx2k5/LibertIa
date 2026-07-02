// SA4 — Audit logs : toutes les actions critiques stockées en MongoDB
const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    action: {
        type: String,
        required: true,
        enum: [
            'register',
            'login',
            'logout',
            'update_profile',
            'delete_account',
            'refresh_token',
            'forgot_password',
            'reset_password'
        ]
    },
    ip: {
        type: String,
        default: null
    },
    userAgent: {
        type: String,
        default: null
    },
    success: {
        type: Boolean,
        required: true
    },
    details: {
        type: mongoose.Schema.Types.Mixed,
        default: {}
    },
    timestamp: {
        type: Date,
        default: Date.now,
        index: true
    }
}, { timestamps: false });

auditLogSchema.index({ userId: 1, timestamp: -1 });
auditLogSchema.index({ action: 1,  timestamp: -1 });

module.exports = mongoose.model('AuditLog', auditLogSchema, 'audit_logs');
