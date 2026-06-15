const axios = require('axios');

// ─────────────────────────────────────────────
//  T44/T85 — Géocodage des destinations
//  Convertit un nom de destination ("Tokyo, Japon") en
//  coordonnées { lat, lng } via l'API Nominatim (OpenStreetMap),
//  gratuite et sans clé d'API.
// ─────────────────────────────────────────────

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org/search';

// Cache mémoire simple — évite de re-géocoder la même destination
// plusieurs fois pendant la durée de vie du process.
const cache = new Map();

/**
 * Géocode une destination en coordonnées { lat, lng }.
 * Retourne `null` si la destination est vide, invalide,
 * ou si le géocodage échoue (API indisponible, timeout...).
 *
 * @param {string} destination
 * @returns {Promise<{ lat: number, lng: number } | null>}
 */
async function geocoderDestination(destination) {
    if (!destination || typeof destination !== 'string') return null;

    const cle = destination.trim().toLowerCase();
    if (!cle) return null;

    if (cache.has(cle)) return cache.get(cle);

    try {
        const { data } = await axios.get(NOMINATIM_URL, {
            params: { q: destination, format: 'json', limit: 1 },
            headers: {
                // Nominatim exige un User-Agent identifiable
                'User-Agent': 'LibertIa/1.0 (https://libertia.app)'
            },
            timeout: 5000
        });

        let coords = null;
        if (Array.isArray(data) && data.length > 0) {
            const lat = parseFloat(data[0].lat);
            const lng = parseFloat(data[0].lon);
            if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
                coords = { lat, lng };
            }
        }

        cache.set(cle, coords);
        return coords;
    } catch (err) {
        console.error('⚠️ Erreur géocodage Nominatim:', err.message);
        return null;
    }
}

module.exports = { geocoderDestination };
