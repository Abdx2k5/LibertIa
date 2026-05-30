const axios = require('axios');
const { spawn } = require('child_process');
const path = require('path');
const ROOT = path.join(__dirname, '..', '..', '..');
const User = require('../models/User');
const Voyage = require('../models/Voyage');

// ─────────────────────────────────────────────
//  CONFIG Groq
// ─────────────────────────────────────────────
const DS_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DS_MODEL = 'llama-3.3-70b-versatile';

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

// ─────────────────────────────────────────────
//  HELPER — Extraire infos du prompt
// ─────────────────────────────────────────────
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
            return res.status(400).json({
                success: false,
                message: 'Le prompt doit contenir au moins 5 caractères'
            });
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

        console.log('🔍 Extraction infos prompt via Groq...');
        const infos = await extraireInfosPrompt(prompt);
        const destination = infos.destination || 'Paris';
        const checkin = infos.checkin || getDateIn(7);
        const checkout = infos.checkout || getDateIn(10);
        const origine = infos.origine || 'CMN';
        console.log(`📍 ${destination} | ${checkin} → ${checkout}`);

        console.log('🔄 RAG + Scraping en parallèle...');
        const scrapingTimeout = new Promise(r => setTimeout(() => r(null), 120000));
        const [ragContexte, scraping] = await Promise.all([
            getRAGContexte(prompt, destination),
            Promise.race([scraperDestination(destination, checkin, checkout, origine), scrapingTimeout])
        ]);

        const donneesScraping = formaterDonneesScraping(scraping);

        console.log('🤖 Génération itinéraire via Groq...');
        const systemPrompt = `Tu es LibertIa, un expert en voyage personnalisé.
Tu génères des itinéraires complets et personnalisés en JSON.
Réponds UNIQUEMENT en JSON valide, sans texte avant ou après.`;

        const userPrompt = `DEMANDE :
"${prompt}"

INFORMATIONS :
- Destination : ${destination}
- Dates : ${checkin} au ${checkout}
- Budget : ${infos.budget || 'moyen'}
- Préférences : ${(infos.preferences || []).join(', ') || 'non spécifiées'}

${ragContexte}
${donneesScraping}

Génère un itinéraire complet avec les vraies données fournies.
Structure JSON requise :
{
  "destination": "",
  "duree_jours": 0,
  "budget_estime": "",
  "checkin": "",
  "checkout": "",
  "jours": [
    {
      "jour": 1,
      "matin":      {"activite": "", "lieu": "", "duree": ""},
      "apres_midi": {"activite": "", "lieu": "", "duree": ""},
      "soir":       {"activite": "", "lieu": "", "duree": ""}
    }
  ],
  "hebergement_recommande": {"nom": "", "prix_nuit": "", "lien": ""},
  "vol_recommande": {"compagnie": "", "prix": "", "duree": ""},
  "restaurants_recommandes": [],
  "conseils": [],
  "budget_detail": {"hotel": "", "transport": "", "repas": "", "activites": "", "total": ""}
}`;

        const responseText = await appelIA(systemPrompt, userPrompt, { temperature: 0.7, max_tokens: 2000 });

        let itineraireData;
        try {
            const jsonMatch = responseText.match(/\{[\s\S]*\}/);
            itineraireData = JSON.parse(jsonMatch[0]);
            if (!itineraireData.destination || !itineraireData.jours) throw new Error('Structure incomplète');
        } catch {
            itineraireData = {
                destination,
                duree_jours: 3,
                budget_estime: 'À définir',
                checkin, checkout,
                jours: [{
                    jour: 1,
                    matin: { activite: 'Exploration', lieu: 'Centre-ville', duree: '3h' },
                    apres_midi: { activite: 'Visites', lieu: 'À découvrir', duree: '3h' },
                    soir: { activite: 'Dîner', lieu: 'Restaurant local', duree: '2h' }
                }],
                conseils: ['Vérifiez les conditions locales'],
                budget_detail: { hotel: 'À définir', transport: 'À définir', repas: 'À définir', activites: 'À définir', total: 'À définir' }
            };
        }

        await User.findByIdAndUpdate(userId, { $inc: { promptsUtilises: 1 } });

        const voyage = await Voyage.create({
            user: userId,
            prompt,
            itineraire: itineraireData,
            titre: `${destination} — ${checkin}`,
            destination,
            dates: {
                start: new Date(checkin),
                end: new Date(checkout)
            },
            scraping_utilise: !!scraping
        });

        res.json({
            succes: true,
            promptsRestants: user.promptsRestants() - 1,
            voyageId: voyage._id,
            itineraire: itineraireData,
            meta: {
                destination, checkin, checkout,
                modele: DS_MODEL,
                rag_utilise: !!ragContexte,
                scraping_utilise: !!scraping,
                hotels_trouves: scraping?.hotels?.length || 0,
                vols_trouves: scraping?.vols?.length || 0,
                restos_trouves: scraping?.restos?.length || 0,
            }
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

// @GET /api/voyages/:id
const getVoyage = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) return res.status(404).json({ message: 'Voyage non trouvé' });
        if (!voyage.partage && voyage.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }
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
        if (voyage.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }
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
        if (voyage.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }
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
        if (voyage.user.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Vous ne pouvez pas liker votre propre voyage' });
        }
        await voyage.ajouterLike(req.user._id);
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

module.exports = { genererVoyage, getMesVoyages, getVoyage, supprimerVoyage, togglePartage, ajouterLike, retirerLike };