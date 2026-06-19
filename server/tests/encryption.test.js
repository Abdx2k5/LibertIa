// T140 — Tests unitaires du chiffrement AES-256-CBC (SA2)
const { encrypt, decrypt } = require('../src/utils/encryption');

describe('encryption — encrypt/decrypt', () => {
    test('aller-retour : decrypt(encrypt(x)) === x', () => {
        const clair = 'Voyageuse passionnée 🌍 — accents éàü';
        const chiffre = encrypt(clair);
        expect(chiffre).not.toBe(clair);
        expect(decrypt(chiffre)).toBe(clair);
    });

    test('format de sortie "ivHex:encryptedHex"', () => {
        const chiffre = encrypt('hello');
        expect(chiffre).toMatch(/^[0-9a-f]{32}:[0-9a-f]+$/);
    });

    test('deux chiffrements de la même valeur diffèrent (IV aléatoire)', () => {
        expect(encrypt('même texte')).not.toBe(encrypt('même texte'));
    });

    test('valeurs vides renvoyées telles quelles', () => {
        expect(encrypt('')).toBe('');
        expect(encrypt(null)).toBeNull();
        expect(encrypt(undefined)).toBeUndefined();
    });

    test('decrypt laisse passer les données legacy non chiffrées', () => {
        expect(decrypt('texte sans deux-points')).toBe('texte sans deux-points');
    });

    test('decrypt renvoie la valeur brute si le déchiffrement échoue', () => {
        expect(decrypt('deadbeef:notvalidhex')).toBe('deadbeef:notvalidhex');
    });

    test('encrypt lève une erreur si ENCRYPTION_KEY est invalide', () => {
        const original = process.env.ENCRYPTION_KEY;
        process.env.ENCRYPTION_KEY = 'trop-courte';
        expect(() => encrypt('x')).toThrow(/ENCRYPTION_KEY/);
        process.env.ENCRYPTION_KEY = original;
    });
});
