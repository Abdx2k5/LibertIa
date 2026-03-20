const axios = require('axios');
const { spawn } = require('child_process');
const path  = require('path');

const ROOT = path.join(__dirname, '..', '..', '..');
const User = require('../models/User');
const Voyage = require('../models/Voyage');

// ─────────────────────────────────────────────
//  HELPERS PYTHON
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
        python.stderr.on('data', () => {});
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

async function extraireInfosPrompt(prompt) {
    try {
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'mistral',
            prompt: `Extrait les informations de voyage depuis ce texte et réponds UNIQUEMENT en JSON valide :
"${prompt}"

JSON attendu :
{
  "destination": "nom de la ville (en français)",
  "checkin": "YYYY-MM-DD ou null",
  "checkout": "YYYY-MM-DD ou null",
  "origine": "code IATA ville départ ou CMN",
  "budget": "low/medium/high ou null",
  "duree_jours": nombre ou 3,
  "preferences": ["culture", "plage", "gastronomie", etc]
}

Réponds UNIQUEMENT avec le JSON, sans texte avant ou après.`,
            stream: false,
            options: { temperature: 0.1, num_predict: 300 }
        }, { timeout: 30000 });

        const jsonMatch = response.data.response.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}

    return {
        destination: null, checkin: getDateIn(7), checkout: getDateIn(10),
        origine: 'CMN', budget: 'medium', duree_jours: 3, preferences: []
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

function buildPromptEnrichi(prompt, infos, destination, checkin, checkout, ragContexte, donneesScraping) {
    return `Tu es LibertIa, un expert en voyage personnalisé.

DEMANDE DE L'UTILISATEUR :
"${prompt}"

INFORMATIONS EXTRAITES :
- Destination : ${destination}
- Dates : ${checkin} au ${checkout}
- Budget : ${infos.budget || 'moyen'}
- Préférences : ${(infos.preferences || []).join(', ') || 'non spécifiées'}

${ragContexte}
${donneesScraping}

Génère un itinéraire complet et personnalisé avec les vraies données fournies.
Réponds UNIQUEMENT en JSON :
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
}

// ─────────────────────────────────────────────
//  T36 — WRAPPER MISTRAL avec retry + timeout
// ─────────────────────────────────────────────
async function appelMistral(promptEnrichi, streamMode = false) {
    const MAX_RETRIES = 2;
    const TIMEOUT = 120000;

    for (let tentative = 1; tentative <= MAX_RETRIES; tentative++) {
        try {
            const response = await axios.post('http://localhost:11434/api/generate', {
                model: 'mistral',
                prompt: promptEnrichi,
                stream: streamMode,
                options: { temperature: 0.7, num_predict: 1500, num_ctx: 4096 }
            }, {
                timeout: TIMEOUT,
                responseType: streamMode ? 'stream' : 'json'
            });
            return response;

        } catch (err) {
            console.error(`❌ Mistral tentative ${tentative}/${MAX_RETRIES}:`, err.message);

            if (tentative === MAX_RETRIES) {
                if (err.code === 'ECONNREFUSED') {
                    throw new Error("Ollama non disponible — lancez 'ollama serve' d'abord");
                } else if (err.code === 'ECONNABORTED' || err.message.includes('timeout')) {
                    throw new Error('Timeout IA — la génération a pris trop de temps, réessayez');
                } else {
                    throw new Error(`Erreur IA: ${err.message}`);
                }
            }
            // Attendre avant retry
            await new Promise(r => setTimeout(r, 2000 * tentative));
        }
    }
}

// ─────────────────────────────────────────────
//  T24 — @POST /api/voyages/generer/stream
//  Génération avec Server-Sent Events (SSE)
// ─────────────────────────────────────────────
const genererVoyageStream = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (user.abonnement === 'free' && user.promptsUtilises >= 10) {
            return res.status(403).json({ message: 'Limite atteinte - passez en premium pour continuer' });
        }

        // Headers SSE
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.flushHeaders();

        const sendEvent = (event, data) => {
            res.write(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`);
        };

        // Étape 1 — Extraction
        sendEvent('status', { step: 1, message: 'Analyse de votre demande...' });
        const infos = await extraireInfosPrompt(prompt);
        const destination = infos.destination || 'Paris';
        const checkin     = infos.checkin     || getDateIn(7);
        const checkout    = infos.checkout    || getDateIn(10);
        const origine     = infos.origine     || 'CMN';
        sendEvent('infos', { destination, checkin, checkout });

        // Étape 2 — RAG + Scraping
        sendEvent('status', { step: 2, message: 'Recherche des données...' });
        const scrapingTimeout = new Promise(resolve => setTimeout(() => resolve(null), 120000));
        const [ragContexte, scraping] = await Promise.all([
            getRAGContexte(prompt, destination),
            Promise.race([scraperDestination(destination, checkin, checkout, origine), scrapingTimeout])
        ]);
        sendEvent('status', { step: 3, message: 'Données récupérées — génération en cours...' });

        // Étape 3 — Streaming Mistral
        const promptEnrichi = buildPromptEnrichi(prompt, infos, destination, checkin, checkout, ragContexte, formaterDonneesScraping(scraping));
        const streamResponse = await appelMistral(promptEnrichi, true);

        let texteComplet = '';
        await new Promise((resolve, reject) => {
            streamResponse.data.on('data', (chunk) => {
                try {
                    const lines = chunk.toString().split('\n').filter(l => l.trim());
                    for (const line of lines) {
                        const parsed = JSON.parse(line);
                        if (parsed.response) {
                            texteComplet += parsed.response;
                            sendEvent('token', { token: parsed.response });
                        }
                        if (parsed.done) resolve();
                    }
                } catch {}
            });
            streamResponse.data.on('error', reject);
            streamResponse.data.on('end', resolve);
        });

        // Étape 4 — Parser + sauvegarder
        let itineraire;
        try {
            const jsonMatch = texteComplet.match(/\{[\s\S]*\}/);
            itineraire = JSON.parse(jsonMatch[0]);
        } catch {
            sendEvent('error', { message: 'Erreur parsing réponse IA — réessayez' });
            return res.end();
        }

        await User.findByIdAndUpdate(userId, { $inc: { promptsUtilises: 1 } });
        const voyage = await Voyage.create({
            user: userId, prompt, itineraire,
            destination, checkin, checkout, scraping_utilise: !!scraping
        });

        sendEvent('done', {
            succes: true,
            promptsRestants: 10 - (user.promptsUtilises + 1),
            voyageId: voyage._id,
            itineraire,
            meta: {
                destination, checkin, checkout,
                rag_utilise: !!ragContexte,
                scraping_utilise: !!scraping,
                hotels_trouves: scraping?.hotels?.length || 0,
                vols_trouves: scraping?.vols?.length || 0,
                restos_trouves: scraping?.restos?.length || 0,
            }
        });

        res.end();

    } catch (err) {
        console.error('❌ Erreur streaming:', err);
        if (!res.headersSent) {
            res.status(500).json({ message: err.message });
        } else {
            res.write(`event: error\ndata: ${JSON.stringify({ message: err.message })}\n\n`);
            res.end();
        }
    }
};

// ─────────────────────────────────────────────
//  @POST /api/voyages/generer (version normale)
// ─────────────────────────────────────────────
const genererVoyage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (user.abonnement === 'free' && user.promptsUtilises >= 10) {
            return res.status(403).json({ message: 'Limite atteinte - passez en premium pour continuer' });
        }

        console.log('🔍 Extraction infos prompt...');
        const infos = await extraireInfosPrompt(prompt);
        const destination = infos.destination || 'Paris';
        const checkin     = infos.checkin     || getDateIn(7);
        const checkout    = infos.checkout    || getDateIn(10);
        const origine     = infos.origine     || 'CMN';
        console.log(`📍 Destination: ${destination} | ${checkin} → ${checkout}`);

        console.log('🔄 RAG + Scraping en parallèle...');
        const scrapingTimeout = new Promise(resolve => setTimeout(() => resolve(null), 120000));
        const [ragContexte, scraping] = await Promise.all([
            getRAGContexte(prompt, destination),
            Promise.race([scraperDestination(destination, checkin, checkout, origine), scrapingTimeout])
        ]);

        const promptEnrichi = buildPromptEnrichi(
            prompt, infos, destination, checkin, checkout,
            ragContexte, formaterDonneesScraping(scraping)
        );

        console.log('🤖 Génération Mistral...');
        const response = await appelMistral(promptEnrichi); // T36 — retry + timeout

        let itineraire;
        try {
            const jsonMatch = response.data.response.match(/\{[\s\S]*\}/);
            itineraire = JSON.parse(jsonMatch[0]);
        } catch {
            return res.status(500).json({ message: 'Erreur parsing réponse IA — réessayez' });
        }

        await User.findByIdAndUpdate(userId, { $inc: { promptsUtilises: 1 } });
        const voyage = await Voyage.create({
            user: userId, prompt, itineraire,
            destination, checkin, checkout, scraping_utilise: !!scraping
        });

        res.json({
            succes: true,
            promptsRestants: 10 - (user.promptsUtilises + 1),
            voyageId: voyage._id,
            itineraire,
            meta: {
                destination, checkin, checkout,
                rag_utilise: !!ragContexte,
                scraping_utilise: !!scraping,
                hotels_trouves: scraping?.hotels?.length || 0,
                vols_trouves: scraping?.vols?.length || 0,
                restos_trouves: scraping?.restos?.length || 0,
            }
        });

    } catch (err) {
        console.error('❌ Erreur genererVoyage:', err);
        res.status(500).json({ message: err.message }); // T36 — message clair
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
        res.json(voyage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { genererVoyage, genererVoyageStream, getMesVoyages, getVoyage };