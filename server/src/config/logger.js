// =============================================================
// FICHIER  : src/config/logger.js
// TÂCHE    : T138 — [M10] Logging Winston + Morgan
//
// Logger applicatif centralisé (Winston) :
//   • console  → lisible et colorée en développement,
//   • fichiers → logs/combined.log (tout) et logs/error.log (erreurs),
//                au format JSON horodaté pour l'exploitation.
//
// Expose aussi `logger.stream`, branché sur Morgan dans app.js
// pour que les logs HTTP transitent par Winston.
// =============================================================

const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Dossier des logs (créé au démarrage si absent)
const LOG_DIR = path.join(__dirname, '..', '..', 'logs');
if (!fs.existsSync(LOG_DIR)) {
    fs.mkdirSync(LOG_DIR, { recursive: true });
}

const isProd = process.env.NODE_ENV === 'production';

// Format fichier : JSON horodaté + stack des erreurs
const fileFormat = winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json()
);

// Format console : compact et coloré
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, ...meta }) => {
        const rest = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
        return `${timestamp} ${level}: ${message}${rest}`;
    })
);

const logger = winston.createLogger({
    // "http" (niveau 3) inclut error/warn/info/http : garantit que les
    // logs de requêtes Morgan sont conservés, même en production.
    level: process.env.LOG_LEVEL || (isProd ? 'http' : 'debug'),
    defaultMeta: { service: 'libertia-api' },
    transports: [
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'error.log'),
            level: 'error',
            format: fileFormat,
            maxsize: 5 * 1024 * 1024, // 5 Mo
            maxFiles: 5,
        }),
        new winston.transports.File({
            filename: path.join(LOG_DIR, 'combined.log'),
            format: fileFormat,
            maxsize: 5 * 1024 * 1024,
            maxFiles: 5,
        }),
    ],
    // Ne jamais faire planter le process à cause du logging
    exitOnError: false,
});

// En dehors de la production, on logge aussi en console.
// (En test, on reste silencieux pour ne pas polluer la sortie Jest.)
if (!isProd && process.env.NODE_ENV !== 'test') {
    logger.add(new winston.transports.Console({ format: consoleFormat }));
}

// Stream consommé par Morgan (chaque ligne HTTP → niveau "http")
logger.stream = {
    write: (message) => logger.http(message.trim()),
};

module.exports = logger;
