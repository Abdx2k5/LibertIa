// =============================================================
// FICHIER  : src/utils/csvExport.js
// TÂCHE    : T128 — [M9] Export données CSV / Excel
//
// Génération de CSV conforme RFC 4180, sans dépendance externe.
// Le BOM UTF-8 garantit l'ouverture correcte des accents dans
// Microsoft Excel (sinon "é" → "Ã©").
//
// Excel français utilise le point-virgule comme séparateur : on
// l'autorise via `delimiter` et on ajoute l'en-tête "sep=;" que
// Excel interprète pour choisir le bon séparateur de colonnes.
// =============================================================

const BOM = '﻿';

// Échappe une valeur selon RFC 4180 :
//   - null/undefined → chaîne vide
//   - Date           → ISO 8601
//   - tableau        → éléments joints par "; "
//   - objet          → JSON
//   - entoure de guillemets si la valeur contient le séparateur,
//     un guillemet ou un saut de ligne (et double les guillemets).
const escapeValue = (value, delimiter) => {
    if (value === null || value === undefined) return '';

    let str;
    if (value instanceof Date) {
        str = isNaN(value.getTime()) ? '' : value.toISOString();
    } else if (Array.isArray(value)) {
        str = value.map((v) => (v && typeof v === 'object' ? JSON.stringify(v) : v)).join('; ');
    } else if (typeof value === 'object') {
        str = JSON.stringify(value);
    } else {
        str = String(value);
    }

    if (str.includes(delimiter) || str.includes('"') || str.includes('\n') || str.includes('\r')) {
        return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
};

// Récupère une valeur potentiellement imbriquée ("contact.email")
const getByPath = (obj, path) =>
    path.split('.').reduce((acc, key) => (acc == null ? undefined : acc[key]), obj);

/**
 * Construit une chaîne CSV.
 *
 * @param {Object[]} rows     - documents (objets simples / lean)
 * @param {Array}    columns  - [{ key, header, map? }]
 *                              key   : chemin dans l'objet ("nom", "contact.email")
 *                              header: libellé de colonne (défaut = key)
 *                              map   : (value, row) => valeur transformée
 * @param {Object}   [opts]
 * @param {string}   [opts.delimiter=',']
 * @returns {string} CSV avec BOM UTF-8
 */
const toCSV = (rows, columns, opts = {}) => {
    const delimiter = opts.delimiter || ',';
    const lines = [];

    // Indice "sep=" uniquement quand on s'écarte de la virgule (Excel FR)
    if (delimiter !== ',') {
        lines.push(`sep=${delimiter}`);
    }

    // En-tête
    lines.push(columns.map((c) => escapeValue(c.header ?? c.key, delimiter)).join(delimiter));

    // Données
    for (const row of rows) {
        const cells = columns.map((c) => {
            const raw = c.map ? c.map(getByPath(row, c.key), row) : getByPath(row, c.key);
            return escapeValue(raw, delimiter);
        });
        lines.push(cells.join(delimiter));
    }

    return BOM + lines.join('\r\n');
};

/**
 * Envoie un CSV en téléchargement (Content-Disposition: attachment).
 *
 * @param {import('express').Response} res
 * @param {string} filename - nom de base sans extension
 * @param {string} csv      - contenu généré par toCSV
 */
const sendCSV = (res, filename, csv) => {
    const safe = String(filename).replace(/[^a-zA-Z0-9_-]/g, '_');
    const stamp = new Date().toISOString().slice(0, 10); // AAAA-MM-JJ
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${safe}_${stamp}.csv"`);
    res.status(200).send(csv);
};

module.exports = { toCSV, sendCSV, escapeValue };
