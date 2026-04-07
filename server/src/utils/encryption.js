/**
 * SA2 — Chiffrement AES-256-CBC des données sensibles (bio, preferences)
 *
 * ENCRYPTION_KEY : chaîne hexadécimale de 64 caractères (= 32 octets)
 * Générer avec : node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
 */
const crypto = require('crypto');

const ALGORITHM  = 'aes-256-cbc';
const IV_LENGTH  = 16; // 128 bits

const getKey = () => {
    const key = process.env.ENCRYPTION_KEY;
    if (!key || key.length !== 64) {
        throw new Error('ENCRYPTION_KEY manquante ou invalide dans .env (doit être 64 hex chars = 32 bytes)');
    }
    return Buffer.from(key, 'hex');
};

/**
 * Chiffre une chaîne de caractères.
 * @param {string} text
 * @returns {string} "ivHex:encryptedHex"
 */
const encrypt = (text) => {
    if (text === null || text === undefined || text === '') return text;
    const iv      = crypto.randomBytes(IV_LENGTH);
    const cipher  = crypto.createCipheriv(ALGORITHM, getKey(), iv);
    const encrypted = Buffer.concat([
        cipher.update(String(text), 'utf8'),
        cipher.final()
    ]);
    return `${iv.toString('hex')}:${encrypted.toString('hex')}`;
};

/**
 * Déchiffre une valeur chiffrée par encrypt().
 * Retourne la valeur brute si elle n'est pas au format attendu (données legacy non chiffrées).
 * @param {string} text "ivHex:encryptedHex"
 * @returns {string}
 */
const decrypt = (text) => {
    if (!text || typeof text !== 'string') return text;
    if (!text.includes(':')) return text; // donnée non chiffrée (legacy)
    try {
        const [ivHex, encryptedHex] = text.split(':');
        const iv            = Buffer.from(ivHex, 'hex');
        const encryptedText = Buffer.from(encryptedHex, 'hex');
        const decipher      = crypto.createDecipheriv(ALGORITHM, getKey(), iv);
        const decrypted     = Buffer.concat([decipher.update(encryptedText), decipher.final()]);
        return decrypted.toString('utf8');
    } catch {
        return text; // retourner brut si déchiffrement échoue
    }
};

module.exports = { encrypt, decrypt };
