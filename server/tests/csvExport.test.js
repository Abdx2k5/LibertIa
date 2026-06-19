// T140 — Tests unitaires du générateur CSV (T128)
const { toCSV, escapeValue, sendCSV } = require('../src/utils/csvExport');

const BOM = '﻿';

describe('csvExport — escapeValue', () => {
    test('null / undefined → chaîne vide', () => {
        expect(escapeValue(null, ',')).toBe('');
        expect(escapeValue(undefined, ',')).toBe('');
    });

    test('entoure de guillemets quand la valeur contient le séparateur', () => {
        expect(escapeValue('Marie, Dupont', ',')).toBe('"Marie, Dupont"');
    });

    test('double les guillemets internes (RFC 4180)', () => {
        expect(escapeValue('Jean "JJ"', ',')).toBe('"Jean ""JJ"""');
    });

    test('protège les sauts de ligne', () => {
        expect(escapeValue('ligne1\nligne2', ',')).toBe('"ligne1\nligne2"');
    });

    test('joint les tableaux avec "; "', () => {
        expect(escapeValue(['a', 'b', 'c'], ',')).toBe('a; b; c');
    });

    test('sérialise les Date en ISO 8601', () => {
        expect(escapeValue(new Date('2026-06-18T10:00:00Z'), ',')).toBe('2026-06-18T10:00:00.000Z');
    });

    test('ne quote pas une valeur contenant ";" quand le séparateur est ","', () => {
        expect(escapeValue('a;b', ',')).toBe('a;b');
        expect(escapeValue('a;b', ';')).toBe('"a;b"');
    });
});

describe('csvExport — toCSV', () => {
    const rows = [
        { nom: 'Marie', contact: { email: 'm@x.fr' }, actif: true },
        { nom: 'Jean', contact: { email: null }, actif: false },
    ];
    const cols = [
        { key: 'nom', header: 'Nom' },
        { key: 'contact.email', header: 'Email' },
        { key: 'actif', header: 'Actif', map: (v) => (v ? 'Oui' : 'Non') },
    ];

    test('préfixe un BOM UTF-8', () => {
        expect(toCSV(rows, cols).startsWith(BOM)).toBe(true);
    });

    test('génère l\'en-tête puis une ligne par enregistrement', () => {
        const lines = toCSV(rows, cols).replace(BOM, '').split('\r\n');
        expect(lines[0]).toBe('Nom,Email,Actif');
        expect(lines[1]).toBe('Marie,m@x.fr,Oui');
        expect(lines[2]).toBe('Jean,,Non');
    });

    test('résout les chemins imbriqués (contact.email)', () => {
        const csv = toCSV([{ contact: { email: 'a@b.c' } }], [{ key: 'contact.email', header: 'E' }]);
        expect(csv).toContain('a@b.c');
    });

    test('applique la fonction map de colonne', () => {
        const csv = toCSV([{ actif: true }], [{ key: 'actif', header: 'A', map: (v) => (v ? 'Oui' : 'Non') }]);
        expect(csv.replace(BOM, '').split('\r\n')[1]).toBe('Oui');
    });

    test('séparateur ";" → ajoute la ligne d\'indice "sep=;" pour Excel', () => {
        const csv = toCSV(rows, cols, { delimiter: ';' }).replace(BOM, '');
        expect(csv.split('\r\n')[0]).toBe('sep=;');
        expect(csv.split('\r\n')[1]).toBe('Nom;Email;Actif');
    });

    test('utilise le header de colonne, sinon la clé', () => {
        const csv = toCSV([{ x: 1 }], [{ key: 'x' }]).replace(BOM, '');
        expect(csv.split('\r\n')[0]).toBe('x');
    });
});

describe('csvExport — sendCSV', () => {
    const makeRes = () => {
        const res = { headers: {}, statusCode: null, body: null };
        res.setHeader = (k, v) => { res.headers[k] = v; };
        res.status = (c) => { res.statusCode = c; return res; };
        res.send = (b) => { res.body = b; return res; };
        return res;
    };

    test('positionne les en-têtes de téléchargement et le statut 200', () => {
        const res = makeRes();
        sendCSV(res, 'utilisateurs', 'a,b');
        expect(res.headers['Content-Type']).toBe('text/csv; charset=utf-8');
        expect(res.headers['Content-Disposition']).toMatch(/attachment; filename="utilisateurs_\d{4}-\d{2}-\d{2}\.csv"/);
        expect(res.statusCode).toBe(200);
        expect(res.body).toBe('a,b');
    });

    test('assainit le nom de fichier (caractères non sûrs → _)', () => {
        const res = makeRes();
        sendCSV(res, '../etc/passwd', 'x');
        expect(res.headers['Content-Disposition']).toMatch(/filename="___etc_passwd_\d{4}-\d{2}-\d{2}\.csv"/);
    });
});
