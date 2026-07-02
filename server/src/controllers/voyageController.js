const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');
const PDFDocument = require('pdfkit');
const ROOT = path.join(__dirname, '..', '..', '..');
const User = require('../models/User');
const Voyage = require('../models/Voyage');
const Comment = require('../models/Comment');
const Dossier = require('../models/Dossier');
const { estVoyageVisiblePour } = require('../utils/visibilite');
const { geocoderDestination } = require('../utils/geocoding');
const { creerNotification } = require('./notificationController');

// ─────────────────────────────────────────────
//  CONFIG Groq
// ─────────────────────────────────────────────
const DS_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DS_MODEL = 'llama-3.3-70b-versatile';
const IS_PROD = process.env.NODE_ENV === 'production';

// ─────────────────────────────────────────────
//  LIENS DE REDIRECTION
// ─────────────────────────────────────────────
function genererLienBooking(destination, checkin, checkout, adultes = 2) {
    const dest = encodeURIComponent(destination || '');
    const ci = (checkin || '').replace(/-/g, '');
    const co = (checkout || '').replace(/-/g, '');
    return `https://www.booking.com/search.html?ss=${dest}&checkin=${ci}&checkout=${co}&group_adults=${adultes}&no_rooms=1&lang=fr`;
}

function genererLienKiwi(origine, destination, checkin, checkout) {
    const q = encodeURIComponent(`vols ${origine || 'Casablanca'} ${destination} ${checkin || ''}`);
    return `https://www.kiwi.com/fr/search?q=${q}`;
}

function genererLienKayak(origine, destination, checkin, checkout) {
    const q = encodeURIComponent(`${destination} ${checkin || ''}`);
    return `https://www.kayak.fr/flights?q=${q}`;
}

function genererLienSkyscanner(origine, destination, checkin, checkout) {
    const orig = (origine || 'CMN').toUpperCase();
    const dest = encodeURIComponent(destination || '');
    const ci = (checkin || '').replace(/-/g, '');
    const co = (checkout || '').replace(/-/g, '');
    return `https://www.skyscanner.fr/transport/vols/${orig}/${dest}/${ci}/${co}/?adults=1&adultsv2=1&cabinclass=economy`;
}

function genererLienGoogleFlights(origine, destination, checkin, checkout) {
    const q = encodeURIComponent(`vols ${origine || 'Casablanca'} ${destination} ${checkin || ''}`);
    return `https://www.google.com/travel/flights?q=${q}`;
}

function genererLienViator(destination) {
    const dest = encodeURIComponent(destination || '');
    return `https://www.viator.com/fr-FR/search?text=${dest}`;
}

function genererLienGoogleMaps(lieu, destination) {
    const q = encodeURIComponent(`${lieu || ''} ${destination || ''}`);
    return `https://www.google.com/maps/search/${q}`;
}

function genererLienTripAdvisor(nom, destination) {
    const q = encodeURIComponent(`${nom || ''} ${destination || ''}`);
    return `https://www.tripadvisor.fr/Search?q=${q}`;
}

function enrichirItineraire(itineraire, checkin, checkout, origine) {
    if (!itineraire) return itineraire;
    const dest = itineraire.destination || '';

    // Hébergement
    if (itineraire.hebergement_recommande) {
        const h = itineraire.hebergement_recommande;
        h.lien_booking = genererLienBooking(dest, checkin, checkout);
        if (!h.lien || h.lien === '' || h.lien === 'N/A') {
            h.lien = h.lien_booking;
        }
    }

    // Vol
    if (itineraire.vol_recommande) {
        const v = itineraire.vol_recommande;
        v.lien_kiwi = genererLienKiwi(origine, dest, checkin, checkout);
        v.lien_kayak = genererLienKayak(origine, dest, checkin, checkout);
        v.lien_skyscanner = genererLienSkyscanner(origine, dest, checkin, checkout);
        v.lien_google_flights = genererLienGoogleFlights(origine, dest, checkin, checkout);
        if (!v.lien || v.lien === '' || v.lien === 'N/A') {
            v.lien = v.lien_skyscanner;
        }
    }

    // Activités dans chaque jour
    if (Array.isArray(itineraire.jours)) {
        itineraire.jours = itineraire.jours.map(jour => {
            ['matin', 'apres_midi', 'soir'].forEach(moment => {
                if (jour[moment]) {
                    jour[moment].lien_maps = genererLienGoogleMaps(
                        jour[moment].lieu || jour[moment].activite, dest
                    );
                }
            });
            return jour;
        });
    }

    // Restaurants
    if (Array.isArray(itineraire.restaurants_recommandes)) {
        itineraire.restaurants_recommandes = itineraire.restaurants_recommandes.map(r => {
            if (typeof r === 'string') {
                return {
                    nom: r,
                    lien_maps: genererLienGoogleMaps(r, dest),
                    lien_tripadvisor: genererLienTripAdvisor(r, dest)
                };
            }
            return {
                ...r,
                lien_maps: genererLienGoogleMaps(r.nom || r, dest),
                lien_tripadvisor: genererLienTripAdvisor(r.nom || r, dest)
            };
        });
    }

    // Liens globaux
    itineraire.liens = {
        hotels_booking: genererLienBooking(dest, checkin, checkout),
        vols_kiwi: genererLienKiwi(origine, dest, checkin, checkout),
        vols_kayak: genererLienKayak(origine, dest, checkin, checkout),
        vols_skyscanner: genererLienSkyscanner(origine, dest, checkin, checkout),
        vols_google_flights: genererLienGoogleFlights(origine, dest, checkin, checkout),
        activites_viator: genererLienViator(dest),
        destination_tripadvisor: genererLienTripAdvisor(dest, ''),
    };

    return itineraire;
}

// ─────────────────────────────────────────────
//  HELPER — Appel Groq
// ─────────────────────────────────────────────
async function appelIA(systemPrompt, userPrompt, opts = {}) {
    const { temperature = 0.7, max_tokens = 2000, retries = 2 } = opts;

    for (let tentative = 1; tentative <= retries; tentative++) {
        try {
            const response = await axios.post(DS_API_URL, {
                model: DS_MODEL,
                messages: [
                    { role: 'system', content: systemPrompt },
                    { role: 'user', content: userPrompt }
                ],
                temperature,
                max_tokens,
                stream: false
            }, {
                headers: {
                    'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                    'Content-Type': 'application/json'
                },
                timeout: 60000
            });

            return response.data.choices[0].message.content;

        } catch (err) {
            const detail = JSON.stringify(err.response?.data) || err.message;
            console.error(`❌ Groq tentative ${tentative}/${retries}:`, detail);

            if (tentative === retries) {
                if (err.response?.status === 401) throw new Error('Clé API Groq invalide');
                if (err.response?.status === 429) throw new Error('Limite API Groq atteinte — réessayez dans quelques secondes');
                throw new Error(`Erreur IA: ${detail}`);
            }
            await new Promise(r => setTimeout(r, 2000 * tentative));
        }
    }
}

// ─────────────────────────────────────────────
//  HELPER — Python (scraping + RAG)
// ─────────────────────────────────────────────
function scraperDestination(destination, checkin, checkout, origine) {
    scraperDestination
    return new Promise((resolve) => {
        const python = spawn('python', ['-c', `
import sys
sys.path.insert(0, r'${ROOT}')
from ai.scraper import scrape_destination_complete
import json

result = scrape_destination_complete(
    destination="${destination}",
    checkin="${checkin}",
    checkout="${checkout}",
    origine="${origine}"
)

def clean(obj):
    if isinstance(obj, list):
        return [clean(i) for i in obj]
    if isinstance(obj, dict):
        return {k: clean(v) for k, v in obj.items() if k not in ['_id', 'scraped_at', 'expire_at']}
    return str(obj) if hasattr(obj, 'isoformat') else obj

print(json.dumps(clean(result)))
`], { cwd: ROOT, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });

        let output = '';
        python.stdout.on('data', (d) => output += d.toString());
        python.stderr.on('data', (d) => process.stderr.write(d));
        python.on('close', () => {
            try {
                const lines = output.trim().split('\n');
                resolve(JSON.parse(lines[lines.length - 1]));
            } catch { resolve(null); }
        });
    });
}

function getRAGContexte(query, destination) {
    if (IS_PROD) return Promise.resolve('');
    return new Promise((resolve) => {
        const python = spawn('python', ['-c', `
import sys
sys.path.insert(0, r'${ROOT}')
from ai.embeddings import rechercher
import json

contexte = rechercher("${query}", destination="${destination}", n_results=4)
print(json.dumps({"contexte": contexte}))
`], { cwd: ROOT, env: { ...process.env, PYTHONIOENCODING: 'utf-8' } });

        let output = '';
        python.stdout.on('data', (d) => output += d.toString());
        python.stderr.on('data', () => { });
        python.on('close', () => {
            try {
                const lines = output.trim().split('\n');
                const parsed = JSON.parse(lines[lines.length - 1]);
                resolve(parsed.contexte || '');
            } catch { resolve(''); }
        });
    });
}

function getDateIn(jours) {
    const d = new Date();
    d.setDate(d.getDate() + jours);
    return d.toISOString().split('T')[0];
}

function parseNumber(value) {
    if (typeof value === 'number') return value;
    if (!value) return 0;
    const match = String(value).replace(/\s/g, '').match(/\d+([.,]\d+)?/);
    if (!match) return 0;
    return parseFloat(match[0].replace(',', '.'));
}

const VISIBILITES = ['prive', 'amis', 'public'];

async function extraireInfosPrompt(prompt) {
    try {
        const text = await appelIA(
            'Tu es un extracteur d\'informations de voyage. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.',
            `Extrait les informations de voyage depuis ce texte :
"${prompt}"

JSON attendu :
{
  "destination": "nom de la ville (en français)",
  "checkin": "YYYY-MM-DD ou null",
  "checkout": "YYYY-MM-DD ou null",
  "origine": "code IATA ville départ ou CMN",
  "budget": "low/medium/high ou null",
  "duree_jours": nombre ou 3,
  "preferences": ["culture", "plage", "gastronomie"]
}`,
            { temperature: 0.1, max_tokens: 300 }
        );

        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch { }

    return {
        destination: null,
        checkin: getDateIn(7),
        checkout: getDateIn(10),
        origine: 'CMN',
        budget: 'medium',
        duree_jours: 3,
        preferences: []
    };
}

function formaterDonneesScraping(scraping) {
    if (!scraping) return '';
    let texte = '\n=== DONNÉES TEMPS RÉEL ===\n\n';
    const hebergements = [...(scraping.hotels || []), ...(scraping.airbnb || [])];
    if (hebergements.length > 0) {
        texte += 'HÉBERGEMENTS DISPONIBLES (prix réels) :\n';
        hebergements.slice(0, 5).forEach(h => {
            texte += `- ${h.nom} | ${h.prix_nuit} | Note: ${h.note} | ${h.source}\n`;
            if (h.lien_booking) texte += `  Réserver: ${h.lien_booking}\n`;
        });
        texte += '\n';
    }
    if (scraping.vols?.length > 0) {
        texte += 'VOLS DISPONIBLES (prix réels) :\n';
        scraping.vols.slice(0, 3).forEach(v => {
            texte += `- ${v.compagnie} | ${v.prix} | Durée: ${v.duree}\n`;
        });
        texte += '\n';
    }
    if (scraping.restos?.length > 0) {
        texte += 'RESTAURANTS :\n';
        scraping.restos.slice(0, 5).forEach(r => {
            texte += `- ${r.nom} | Note: ${r.note} | ${r.cuisine}\n`;
        });
        texte += '\n';
    }
    return texte;
}

// ─────────────────────────────────────────────
//  @POST /api/voyages/generer
// ─────────────────────────────────────────────
const genererVoyage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user._id;

        if (!prompt || prompt.trim().length < 5) {
            return res.status(400).json({ success: false, message: 'Le prompt doit contenir au moins 5 caractères' });
        }

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        if (!user.peutGenerer()) {
            return res.status(403).json({
                success: false,
                message: 'Limite atteinte — passez en premium',
                code: 'QUOTA_EXCEEDED',
                promptsRestants: user.promptsRestants()
            });
        }

        const infos = await extraireInfosPrompt(prompt);
        const destination = infos.destination || 'Paris';
        const checkin = infos.checkin || getDateIn(7);
        const checkout = infos.checkout || getDateIn(10);
        const origine = infos.origine || 'CMN';

        const scrapingTimeout = new Promise(r => setTimeout(() => r(null), 120000));
        const [ragContexte, scraping, coordonnees] = await Promise.all([
            getRAGContexte(prompt, destination),
            Promise.race([scraperDestination(destination, checkin, checkout, origine), scrapingTimeout]),
            geocoderDestination(destination)
        ]);

        const donneesScraping = formaterDonneesScraping(scraping);

        const systemPrompt = `Tu es LibertIa, un expert en voyage personnalisé. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.`;
        const userPrompt = `DEMANDE : "${prompt}"
- Destination : ${destination}
- Dates : ${checkin} au ${checkout}
- Budget : ${infos.budget || 'moyen'}
- Préférences : ${(infos.preferences || []).join(', ') || 'non spécifiées'}
${ragContexte}
${donneesScraping}
Structure JSON requise :
{"destination":"","duree_jours":0,"budget_estime":"","checkin":"","checkout":"","jours":[{"jour":1,"matin":{"activite":"","lieu":"","duree":""},"apres_midi":{"activite":"","lieu":"","duree":""},"soir":{"activite":"","lieu":"","duree":""}}],"hebergement_recommande":{"nom":"","prix_nuit":"","lien":""},"vol_recommande":{"compagnie":"","prix":"","duree":"","lien":""},"restaurants_recommandes":[{"nom":"","cuisine":"","prix":""}],"conseils":[],"budget_detail":{"hotel":"","transport":"","repas":"","activites":"","total":""}}`;

        const responseText = await appelIA(systemPrompt, userPrompt, { temperature: 0.7, max_tokens: 2000 });

        let itineraireData;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            itineraireData = JSON.parse(jsonMatch[0]);
            if (!itineraireData.destination || !itineraireData.jours) throw new Error('Structure incomplète');
        } catch {
            itineraireData = {
                destination, duree_jours: 3, budget_estime: 'À définir', checkin, checkout,
                jours: [{ jour: 1, matin: { activite: 'Exploration', lieu: 'Centre-ville', duree: '3h' }, apres_midi: { activite: 'Visites', lieu: 'À découvrir', duree: '3h' }, soir: { activite: 'Dîner', lieu: 'Restaurant local', duree: '2h' } }],
                conseils: ['Vérifiez les conditions locales'],
                budget_detail: { hotel: 'À définir', transport: 'À définir', repas: 'À définir', activites: 'À définir', total: 'À définir' }
            };
        }

        // ── Enrichir avec les liens de redirection ──
        itineraireData = enrichirItineraire(itineraireData, checkin, checkout, origine);

        await User.findByIdAndUpdate(userId, { $inc: { promptsUtilises: 1 } });

        const voyage = await Voyage.create({
            user: userId, prompt, itineraire: itineraireData,
            titre: `${destination} — ${checkin}`, destination,
            dates: { start: new Date(checkin), end: new Date(checkout) },
            coordonnees: coordonnees || { lat: null, lng: null },
            scraping_utilise: !!scraping
        });

        res.json({
            succes: true,
            promptsRestants: user.promptsRestants() - 1,
            voyageId: voyage._id,
            itineraire: itineraireData,
            meta: { destination, checkin, checkout, modele: DS_MODEL, rag_utilise: !!ragContexte, scraping_utilise: !!scraping }
        });

    } catch (err) {
        console.error('❌ Erreur genererVoyage:', err);
        res.status(500).json({ success: false, message: err.message });
    }
};

// @GET /api/voyages/mes-voyages
const getMesVoyages = async (req, res) => {
    try {
        const voyages = await Voyage.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(voyages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @GET /api/voyages/carte
const getCarteVoyages = async (req, res) => {
    try {
        const voyages = await Voyage.find({ user: req.user._id }).sort({ createdAt: -1 });
        const data = [];
        for (const voyage of voyages) {
            let { lat, lng } = voyage.coordonnees || {};
            if (lat == null || lng == null) {
                const coords = await geocoderDestination(voyage.destination);
                if (coords) { voyage.coordonnees = coords; await voyage.save(); lat = coords.lat; lng = coords.lng; }
            }
            if (lat == null || lng == null) continue;
            data.push({ id: voyage._id, titre: voyage.titre, destination: voyage.destination, dates: voyage.dates, partage: voyage.partage, budget: voyage.budget, coordonnees: { lat, lng } });
        }
        res.json({ success: true, data });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @GET /api/voyages/:id
const getVoyage = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ message: 'Voyage non trouvé' });
        if (!(await estVoyageVisiblePour(voyage, req.user))) return res.status(403).json({ success: false, message: 'Non autorisé' });
        res.json(voyage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @DELETE /api/voyages/:id
const supprimerVoyage = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        if (voyage.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Non autorisé' });
        await Promise.all([Comment.deleteMany({ voyage: voyage._id }), Dossier.deleteOne({ voyage: voyage._id })]);
        await voyage.deleteOne();
        res.json({ success: true, message: 'Voyage supprimé' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @PATCH /api/voyages/:id/partage
const togglePartage = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        if (voyage.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Non autorisé' });
        voyage.partage = !voyage.partage;
        await voyage.save();
        res.json({ success: true, partage: voyage.partage });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @POST /api/voyages/:id/like
const ajouterLike = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        if (voyage.user.toString() === req.user._id.toString()) return res.status(400).json({ success: false, message: 'Vous ne pouvez pas liker votre propre voyage' });
        await voyage.ajouterLike(req.user._id);
        await creerNotification({ destinataire: voyage.user, expediteur: req.user._id, type: 'like', contenu: `${req.user.nom} a aimé votre voyage "${voyage.titre}"`, lien: `/voyage/${voyage._id}` });
        res.json({ success: true, likeCount: voyage.likeCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @DELETE /api/voyages/:id/like
const retirerLike = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        await voyage.retirerLike(req.user._id);
        res.json({ success: true, likeCount: voyage.likeCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @GET /api/voyages/:id/budget
const getBudget = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        if (voyage.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Non autorisé' });
        res.json({ success: true, budget: voyage.budget, budget_detail: voyage.itineraire?.budget_detail || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @PATCH /api/voyages/:id/budget
const updateBudget = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        if (voyage.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Non autorisé' });
        const { total, currency, budget_detail } = req.body;
        if (total !== undefined) voyage.budget.total = total;
        if (currency !== undefined) voyage.budget.currency = currency;
        if (budget_detail && typeof budget_detail === 'object') { voyage.itineraire.budget_detail = { ...(voyage.itineraire.budget_detail || {}), ...budget_detail }; voyage.markModified('itineraire'); }
        await voyage.save();
        res.json({ success: true, budget: voyage.budget, budget_detail: voyage.itineraire?.budget_detail || null });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @POST /api/voyages/:id/budget/recalculer
const recalculerBudget = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        if (voyage.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Non autorisé' });
        const itineraire = voyage.itineraire || {};
        const nuits = Math.max(1, Math.round((new Date(voyage.dates.end) - new Date(voyage.dates.start)) / 86400000));
        const transport = parseNumber(itineraire.vol_recommande?.prix);
        const hotel = parseNumber(itineraire.hebergement_recommande?.prix_nuit) * nuits;
        const repas = parseNumber(itineraire.budget_detail?.repas);
        const activites = parseNumber(itineraire.budget_detail?.activites);
        const total = transport + hotel + repas + activites;
        itineraire.budget_detail = { ...itineraire.budget_detail, transport, hotel, repas, activites, total };
        voyage.itineraire = itineraire; voyage.budget.total = total; voyage.markModified('itineraire');
        await voyage.save();
        res.json({ success: true, budget: voyage.budget, budget_detail: itineraire.budget_detail });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @GET /api/voyages/:id/conseils
const getConseils = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        if (!(await estVoyageVisiblePour(voyage, req.user))) return res.status(403).json({ success: false, message: 'Non autorisé' });
        res.json({ success: true, conseils: voyage.itineraire?.conseils || [] });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @POST /api/voyages/:id/conseils/regenerer
const regenererConseils = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        if (voyage.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Non autorisé' });
        const responseText = await appelIA(
            'Tu es LibertIa, un expert en voyage. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.',
            `Donne 5 conseils pratiques pour un voyage à ${voyage.destination}. JSON : {"conseils":["conseil 1","conseil 2","conseil 3","conseil 4","conseil 5"]}`,
            { temperature: 0.6, max_tokens: 500 }
        );
        let conseils;
        try { const parsed = JSON.parse(responseText.match(/\{[\s\S]*\}/)[0]); if (!Array.isArray(parsed.conseils)) throw new Error(); conseils = parsed.conseils; }
        catch { return res.status(502).json({ success: false, message: 'Réponse IA invalide, réessayez' }); }
        voyage.itineraire = { ...voyage.itineraire, conseils }; voyage.markModified('itineraire');
        await voyage.save();
        res.json({ success: true, conseils });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @GET /api/voyages/:id/privacite
const getPrivacite = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        if (voyage.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Non autorisé' });
        res.json({ success: true, visibilite: voyage.visibilite, partage: voyage.partage });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// @PATCH /api/voyages/:id/privacite
const updatePrivacite = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        if (voyage.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Non autorisé' });
        const { visibilite } = req.body;
        if (!VISIBILITES.includes(visibilite)) return res.status(400).json({ success: false, message: `visibilite doit être l'une de : ${VISIBILITES.join(', ')}` });
        voyage.visibilite = visibilite; await voyage.save();
        res.json({ success: true, visibilite: voyage.visibilite, partage: voyage.partage });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

// ─────────────────────────────────────────────
//  @POST /api/voyages/generer/stream  (SSE)
// ─────────────────────────────────────────────
const genererVoyageStream = async (req, res) => {
    const sendEvent = (event, data) => res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);

    try {
        const { prompt } = req.body;
        const userId = req.user._id;

        if (!prompt || prompt.trim().length < 5) return res.status(400).json({ success: false, message: 'Le prompt doit contenir au moins 5 caractères' });

        const user = await User.findById(userId);
        if (!user) return res.status(404).json({ success: false, message: 'Utilisateur non trouvé' });
        if (!user.peutGenerer()) return res.status(403).json({ success: false, message: 'Limite atteinte — passez en premium', code: 'QUOTA_EXCEEDED', promptsRestants: user.promptsRestants() });

        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();

        sendEvent('status', { message: 'Analyse de votre demande...' });
        const infos = await extraireInfosPrompt(prompt);
        const destination = infos.destination || 'Paris';
        const checkin = infos.checkin || getDateIn(7);
        const checkout = infos.checkout || getDateIn(10);
        const origine = infos.origine || 'CMN';

        sendEvent('status', { message: `Destination : ${destination}` });

        const [ragContexte, coordonnees] = await Promise.all([
            getRAGContexte(prompt, destination),
            geocoderDestination(destination)
        ]);

        sendEvent('status', { message: 'Génération de votre itinéraire...' });

        const systemPrompt = `Tu es LibertIa, un expert en voyage personnalisé. Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.`;
        const userPrompt = `DEMANDE : "${prompt}"
Destination : ${destination} | Dates : ${checkin} au ${checkout} | Budget : ${infos.budget || 'moyen'}
${ragContexte}
Structure JSON :
{"destination":"","duree_jours":0,"budget_estime":"","checkin":"","checkout":"","jours":[{"jour":1,"matin":{"activite":"","lieu":"","duree":""},"apres_midi":{"activite":"","lieu":"","duree":""},"soir":{"activite":"","lieu":"","duree":""}}],"hebergement_recommande":{"nom":"","prix_nuit":"","lien":""},"vol_recommande":{"compagnie":"","prix":"","duree":"","lien":""},"restaurants_recommandes":[{"nom":"","cuisine":"","prix":""}],"conseils":[],"budget_detail":{"hotel":"","transport":"","repas":"","activites":"","total":""}}`;

        const groqResponse = await axios.post(DS_API_URL, {
            model: DS_MODEL,
            messages: [{ role: 'system', content: systemPrompt }, { role: 'user', content: userPrompt }],
            temperature: 0.7, max_tokens: 2000, stream: true
        }, {
            headers: { 'Authorization': `Bearer ${process.env.GROQ_API_KEY}`, 'Content-Type': 'application/json', 'Accept': 'text/event-stream' },
            responseType: 'stream', timeout: 60000
        });

        let fullText = '';
        await new Promise((resolve, reject) => {
            let buffer = '';
            groqResponse.data.on('data', (chunk) => {
                buffer += chunk.toString();
                const lines = buffer.split('\n');
                buffer = lines.pop();
                for (const line of lines) {
                    const trimmed = line.trim();
                    if (!trimmed || !trimmed.startsWith('data: ')) continue;
                    const jsonStr = trimmed.slice(6);
                    if (jsonStr === '[DONE]') { resolve(); return; }
                    try {
                        const parsed = JSON.parse(jsonStr);
                        const token = parsed.choices?.[0]?.delta?.content;
                        if (token) { fullText += token; sendEvent('token', { token }); }
                    } catch { }
                }
            });
            groqResponse.data.on('end', resolve);
            groqResponse.data.on('error', reject);
        });

        let itineraireData;
        try {
            const jsonMatch = fullText.match(/\{[\s\S]*\}/);
            itineraireData = JSON.parse(jsonMatch[0]);
            if (!itineraireData.destination || !itineraireData.jours) throw new Error('Structure incomplète');
        } catch {
            itineraireData = {
                destination, duree_jours: 3, budget_estime: 'À définir', checkin, checkout,
                jours: [{ jour: 1, matin: { activite: 'Exploration', lieu: 'Centre-ville', duree: '3h' }, apres_midi: { activite: 'Visites', lieu: 'À découvrir', duree: '3h' }, soir: { activite: 'Dîner', lieu: 'Restaurant local', duree: '2h' } }],
                conseils: ['Vérifiez les conditions locales'],
                budget_detail: { hotel: 'À définir', transport: 'À définir', repas: 'À définir', activites: 'À définir', total: 'À définir' }
            };
        }

        // ── Enrichir avec les liens de redirection ──
        itineraireData = enrichirItineraire(itineraireData, checkin, checkout, origine);

        await User.findByIdAndUpdate(userId, { $inc: { promptsUtilises: 1 } });

        const voyage = await Voyage.create({
            user: userId, prompt, itineraire: itineraireData,
            titre: `${destination} — ${checkin}`, destination,
            dates: { start: new Date(checkin), end: new Date(checkout) },
            coordonnees: coordonnees || { lat: null, lng: null },
            scraping_utilise: false
        });

        const promptsRestants = Math.max(0, user.promptsRestants() - 1);
        sendEvent('done', { voyageId: voyage._id, itineraire: itineraireData, promptsRestants });
        res.end();

    } catch (err) {
        console.error('❌ Erreur genererVoyageStream:', err);
        if (!res.headersSent) return res.status(500).json({ success: false, message: err.message });
        sendEvent('error', { message: err.message });
        res.end();
    }
};

// ─────────────────────────────────────────────
//  @GET /api/voyages/:id/export-pdf
// ─────────────────────────────────────────────
const exportPDF = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        if (voyage.user.toString() !== req.user._id.toString()) return res.status(403).json({ success: false, message: 'Non autorisé' });

        const doc = new PDFDocument({ margin: 50, size: 'A4' });
        const filename = `libertia-voyage-${voyage._id}.pdf`;
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        doc.pipe(res);

        const itin = voyage.itineraire || {};

        doc.fontSize(24).fillColor('#1B4F72').text('LibertIa', { align: 'center' });
        doc.fontSize(16).fillColor('#333').text(voyage.titre, { align: 'center' });
        doc.moveDown(0.5);
        doc.fontSize(11).fillColor('#666').text(`Destination : ${voyage.destination}`, { align: 'center' });
        if (voyage.dates?.start && voyage.dates?.end) {
            doc.text(`Dates : ${new Date(voyage.dates.start).toLocaleDateString('fr-FR')} → ${new Date(voyage.dates.end).toLocaleDateString('fr-FR')}`, { align: 'center' });
        }
        doc.moveDown();
        doc.moveTo(50, doc.y).lineTo(545, doc.y).strokeColor('#1B4F72').stroke();
        doc.moveDown();

        if (itin.budget_estime || itin.budget_detail) {
            doc.fontSize(14).fillColor('#1B4F72').text('Budget estimé');
            doc.moveDown(0.3);
            doc.fontSize(11).fillColor('#333');
            if (itin.budget_estime) doc.text(`Total estimé : ${itin.budget_estime}`);
            const bd = itin.budget_detail || {};
            if (bd.hotel) doc.text(`  Hébergement : ${bd.hotel}`);
            if (bd.transport) doc.text(`  Transport : ${bd.transport}`);
            if (bd.repas) doc.text(`  Repas : ${bd.repas}`);
            if (bd.activites) doc.text(`  Activités : ${bd.activites}`);
            doc.moveDown();
        }

        if (itin.hebergement_recommande?.nom) {
            doc.fontSize(14).fillColor('#1B4F72').text('Hébergement recommandé');
            doc.moveDown(0.3);
            const h = itin.hebergement_recommande;
            doc.fontSize(11).fillColor('#333').text(`${h.nom}${h.prix_nuit ? ' — ' + h.prix_nuit + '/nuit' : ''}`);
            if (h.lien_booking) doc.text(`Réserver : ${h.lien_booking}`, { link: h.lien_booking, underline: true, color: '#1B4F72' });
            doc.moveDown();
        }

        if (itin.vol_recommande?.compagnie) {
            doc.fontSize(14).fillColor('#1B4F72').text('Vol recommandé');
            doc.moveDown(0.3);
            const v = itin.vol_recommande;
            doc.fontSize(11).fillColor('#333').text(`${v.compagnie}${v.prix ? ' — ' + v.prix : ''}${v.duree ? ' (' + v.duree + ')' : ''}`);
            if (v.lien_skyscanner) doc.text(`Réserver : ${v.lien_skyscanner}`, { link: v.lien_skyscanner, underline: true, color: '#1B4F72' });
            doc.moveDown();
        }

        if (Array.isArray(itin.jours) && itin.jours.length > 0) {
            doc.fontSize(14).fillColor('#1B4F72').text('Programme');
            doc.moveDown(0.3);
            itin.jours.forEach((j) => {
                doc.fontSize(12).fillColor('#1B4F72').text(`Jour ${j.jour}`);
                doc.fontSize(10).fillColor('#333');
                [{ label: 'Matin', data: j.matin }, { label: 'Après-midi', data: j.apres_midi }, { label: 'Soir', data: j.soir }].forEach(({ label, data }) => {
                    if (data?.activite) doc.text(`  ${label} : ${data.activite}${data.lieu ? ' — ' + data.lieu : ''}${data.duree ? ' (' + data.duree + ')' : ''}`);
                });
                doc.moveDown(0.5);
            });
        }

        if (Array.isArray(itin.conseils) && itin.conseils.length > 0) {
            doc.fontSize(14).fillColor('#1B4F72').text('Conseils');
            doc.moveDown(0.3);
            doc.fontSize(11).fillColor('#333');
            itin.conseils.forEach((c) => doc.text(`• ${typeof c === 'string' ? c : c?.texte || JSON.stringify(c)}`));
            doc.moveDown();
        }

        doc.moveDown();
        doc.fontSize(9).fillColor('#aaa').text('Généré par LibertIa — www.libertia.com', { align: 'center' });
        doc.end();

    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = {
    genererVoyage, genererVoyageStream, getMesVoyages, getVoyage, getCarteVoyages,
    supprimerVoyage, togglePartage, ajouterLike, retirerLike,
    getBudget, updateBudget, recalculerBudget, getConseils, regenererConseils,
    getPrivacite, updatePrivacite, exportPDF
};