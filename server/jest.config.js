// =============================================================
// FICHIER  : jest.config.js
// TÂCHE    : T140 — [M10] Tests unitaires Jest
//
// Tests unitaires ciblant la logique pure (utils, middlewares,
// spécification OpenAPI) — sans dépendance à MongoDB.
// =============================================================

module.exports = {
    testEnvironment: 'node',
    setupFiles: ['<rootDir>/tests/setupEnv.js'],
    testMatch: ['<rootDir>/tests/**/*.test.js'],
    collectCoverageFrom: [
        'src/utils/**/*.js',
        'src/config/swagger.js',
        'src/config/logger.js',
        'src/middlewares/**/*.js',
    ],
    clearMocks: true,
    verbose: true,
    // Marge pour le démarrage de mongodb-memory-server (tests d'intégration)
    testTimeout: 30000,
};
