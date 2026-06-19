// =============================================================
// FICHIER  : src/app.js
// RÔLE     : Construit et exporte l'application Express (middlewares,
//            routes, gestion d'erreurs) SANS effet de bord.
//
// Aucun appel à connectDB(), aucun listen(), aucun socket ici : le
// démarrage réel vit dans server.js. Cette séparation permet aux
// tests (supertest + mongodb-memory-server) d'importer `app` sans
// ouvrir de port ni dépendre d'une base externe (T140).
// =============================================================

const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
require('dotenv').config({ quiet: true });

const logger = require('./config/logger'); // T138
const authRoutes = require('./routes/authRoutes');
const voyageRoutes = require('./routes/voyageRoutes');
const compagnonRoutes = require('./routes/compagnonRoutes');
const communityRoutes = require('./routes/communityRoutes');
const dossierRoutes = require('./routes/dossierRoutes');
const boiteRoutes = require('./routes/boiteRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const avisRoutes = require('./routes/avisRoutes');
const agencyRoutes = require('./routes/agencyRoutes');
const exportRoutes = require('./routes/exportRoutes');
const adminRoutes = require('./routes/adminRoutes'); // T127
const { swaggerSpec, swaggerHtml } = require('./config/swagger');

const app = express();

app.use(cors({
    origin: "http://localhost:5173",
    credentials: true
}));
// limite augmentée pour l'upload de photos en base64 (T79)
app.use(express.json({ limit: '5mb' }));

// T138 — journalisation HTTP via Morgan, redirigée vers Winston.
// Désactivée en environnement de test pour ne pas polluer Jest.
if (process.env.NODE_ENV !== 'test') {
    app.use(morgan('combined', { stream: logger.stream }));
}

app.use((req, res, next) => {
    const sanitize = (obj) => {
        if (obj && typeof obj === 'object') {
            Object.keys(obj).forEach(key => {
                if (key.startsWith('$') || key.includes('.')) {
                    delete obj[key];
                } else {
                    sanitize(obj[key]);
                }
            });
        }
    };
    if (req.body) sanitize(req.body);
    next();
});

app.use('/api/auth', authRoutes);
app.use('/api/voyages', voyageRoutes);
app.use('/api/compagnon', compagnonRoutes);
app.use('/api/community', communityRoutes);
app.use('/api/dossiers', dossierRoutes);
app.use('/api/boites', boiteRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/avis', avisRoutes);
app.use('/api/agences', agencyRoutes);
app.use('/api/export', exportRoutes);
app.use('/api/admin', adminRoutes);

// T141 — Documentation Swagger / OpenAPI
//   GET /api-docs      → interface Swagger UI (rendue via CDN)
//   GET /api-docs.json → spécification OpenAPI brute
app.get('/api-docs.json', (_req, res) => {
    res.json(swaggerSpec);
});
app.get('/api-docs', (_req, res) => {
    res.type('html').send(swaggerHtml);
});

app.get('/', (_req, res) => {
    res.json({ message: '🐦 Libertia API is running', version: '1.0.0', docs: '/api-docs' });
});

// T138 — gestionnaire d'erreurs : journalise la stack via Winston
// (placé après toutes les routes pour capter les erreurs propagées).
// eslint-disable-next-line no-unused-vars
app.use((err, req, res, _next) => {
    logger.error(`${req.method} ${req.originalUrl} — ${err.message}`, { stack: err.stack });
    res.status(err.status || 500).json({ success: false, message: 'Erreur serveur' });
});

module.exports = app;
