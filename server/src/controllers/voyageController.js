const axios = require('axios');
const { spawn } = require('child_process');
const path  = require('path');

// Racine du projet (LibertIa/) — un niveau au-dessus de server/
const ROOT = path.join(__dirname, '..', '..', '..');
const User = require('../models/User');
const Voyage = require('../models/Voyage');

// ─────────────────────────────────────────────
//  HELPER — Appel Python (scraping + RAG)
// ─────────────────────────────────────────────

/**
 * Lance un script Python et retourne le résultat JSON
 */
function runPython(script, args = []) {
    return new Promise((resolve, reject) => {
        const python = spawn('python', [script, ...args]);
        let output = '';
        let error  = '';

        python.stdout.on('data', (data) => output += data.toString());
        python.stderr.on('data', (data) => error  += data.toString());

        python.on('close', (code) => {
            if (code !== 0) {
                console.error(`⚠️  Python error (${script}):`, error);
                resolve(null); // Ne pas bloquer si scraping échoue
            } else {
                try {
                    resolve(JSON.parse(output));
                } catch {
                    resolve(null);
                }
            }
        });
    });
}

/**
 * Lance le scraping pour une destination
 */
function scraperDestination(destination, checkin, checkout, origine) {
    return new Promise((resolve) => {
        const args = [
            destination,
            checkin    || getDateIn(7),   // défaut : dans 7 jours
            checkout   || getDateIn(10),  // défaut : 3 nuits
            origine    || 'CMN'
        ];

        const python = spawn('python', ['-c', `
import sys
sys.path.insert(0, r'${ROOT}')
from ai.scraper import scrape_destination_complete
import json

result = scrape_destination_complete(
    destination="${args[0]}",
    checkin="${args[1]}",
    checkout="${args[2]}",
    origine="${args[3]}"
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

        python.on('close', (code) => {
            try {
                const lines = output.trim().split('\n');
                const jsonLine = lines[lines.length - 1]; // Dernière ligne = JSON
                resolve(JSON.parse(jsonLine));
            } catch {
                resolve(null);
            }
        });
    });
}

/**
 * Récupère le contexte RAG pour une destination
 */
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
                const jsonLine = lines[lines.length - 1];
                const parsed = JSON.parse(jsonLine);
                resolve(parsed.contexte || '');
            } catch {
                resolve('');
            }
        });
    });
}

// ─────────────────────────────────────────────
//  HELPER — Dates
// ─────────────────────────────────────────────
function getDateIn(jours) {
    const d = new Date();
    d.setDate(d.getDate() + jours);
    return d.toISOString().split('T')[0];
}

// ─────────────────────────────────────────────
//  HELPER — Extraire infos du prompt via Mistral
// ─────────────────────────────────────────────
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
        });

        const text = response.data.response;
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) return JSON.parse(jsonMatch[0]);
    } catch {}

    // Fallback par défaut
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

// ─────────────────────────────────────────────
//  HELPER — Formater les données scraping
//  pour les injecter dans le prompt Mistral
// ─────────────────────────────────────────────
function formaterDonneesScraping(scraping) {
    if (!scraping) return '';

    let texte = '\n=== DONNÉES TEMPS RÉEL ===\n\n';

    // Hôtels (Booking + Airbnb)
    const hebergements = [...(scraping.hotels || []), ...(scraping.airbnb || [])];
    if (hebergements.length > 0) {
        texte += '🏨 HÉBERGEMENTS DISPONIBLES (prix réels) :\n';
        hebergements.slice(0, 5).forEach(h => {
            texte += `- ${h.nom} | ${h.prix_nuit} | Note: ${h.note} | ${h.source}\n`;
            if (h.lien_booking) texte += `  → Réserver: ${h.lien_booking}\n`;
        });
        texte += '\n';
    }

    // Vols
    if (scraping.vols && scraping.vols.length > 0) {
        texte += '✈️  VOLS DISPONIBLES (prix réels) :\n';
        scraping.vols.slice(0, 3).forEach(v => {
            texte += `- ${v.compagnie} | ${v.prix} | Durée: ${v.duree} | ${v.horaires}\n`;
        });
        texte += '\n';
    }

    // Restaurants
    if (scraping.restos && scraping.restos.length > 0) {
        texte += '🍽️  RESTAURANTS :\n';
        scraping.restos.slice(0, 5).forEach(r => {
            texte += `- ${r.nom} | Note: ${r.note} | ${r.cuisine}\n`;
            if (r.lien) texte += `  → Voir: ${r.lien}\n`;
        });
        texte += '\n';
    }

    return texte;
}

// ─────────────────────────────────────────────
//  CONTROLLER PRINCIPAL
// ─────────────────────────────────────────────

// @POST /api/voyages/generer
const genererVoyage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user._id;

        // Vérification freemium
        const user = await User.findById(userId);
        if (user.abonnement === 'free' && user.promptsUtilises >= 10) {
            return res.status(403).json({
                message: 'Limite atteinte - passez en premium pour continuer'
            });
        }

        // ── ÉTAPE 1 : Extraire destination + dates du prompt ──
        console.log('🔍 Extraction infos prompt...');
        const infos = await extraireInfosPrompt(prompt);
        const destination = infos.destination || 'Paris';
        const checkin     = infos.checkin     || getDateIn(7);
        const checkout    = infos.checkout    || getDateIn(10);
        const origine     = infos.origine     || 'CMN';

        console.log(`📍 Destination: ${destination} | ${checkin} → ${checkout}`);

        // ── ÉTAPE 2 : RAG — contexte local (parallèle avec scraping) ──
        // ── ÉTAPE 3 : Scraping temps réel ──
        console.log('🔄 RAG + Scraping en parallèle...');
        const scrapingTimeout = new Promise(resolve => setTimeout(() => resolve(null), 120000));
        const [ragContexte, scraping] = await Promise.all([
            getRAGContexte(prompt, destination),
            Promise.race([scraperDestination(destination, checkin, checkout, origine), scrapingTimeout])
        ]);

        const donneesScraping = formaterDonneesScraping(scraping);

        // ── ÉTAPE 4 : Construire le prompt enrichi pour Mistral ──
        const promptEnrichi = `Tu es LibertIa, un expert en voyage personnalisé.

DEMANDE DE L'UTILISATEUR :
"${prompt}"

INFORMATIONS EXTRAITES :
- Destination : ${destination}
- Dates : ${checkin} au ${checkout}
- Budget : ${infos.budget || 'moyen'}
- Préférences : ${(infos.preferences || []).join(', ') || 'non spécifiées'}

${ragContexte}
${donneesScraping}

En utilisant les données ci-dessus, génère un itinéraire complet et personnalisé.
Intègre les vrais hôtels, vols et restaurants fournis avec leurs prix réels.
Réponds UNIQUEMENT en JSON avec cette structure :
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
  "hebergement_recommande": {
    "nom": "",
    "prix_nuit": "",
    "lien": ""
  },
  "vol_recommande": {
    "compagnie": "",
    "prix": "",
    "duree": ""
  },
  "restaurants_recommandes": [],
  "conseils": [],
  "budget_detail": {
    "hotel": "",
    "transport": "",
    "repas": "",
    "activites": "",
    "total": ""
  }
}`;

        // ── ÉTAPE 5 : Génération Mistral ──
        console.log('🤖 Génération Mistral...');
        const response = await axios.post('http://localhost:11434/api/generate', {
            model: 'mistral',
            prompt: promptEnrichi,
            stream: false,
            options: {
                temperature: 0.7,
                num_predict: 1500,
                num_ctx: 4096
            }
        }, { timeout: 120000 }); // 2 minutes

        // ── ÉTAPE 6 : Parser la réponse ──
        let itineraire;
        try {
            const text = response.data.response;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            itineraire = JSON.parse(jsonMatch[0]);
        } catch {
            return res.status(500).json({ message: 'Erreur parsing réponse IA' });
        }

        // ── ÉTAPE 7 : Sauvegarder ──
        await User.findByIdAndUpdate(userId, {
            $inc: { promptsUtilises: 1 }
        });

        const voyage = await Voyage.create({
            user: userId,
            prompt,
            itineraire,
            destination,
            checkin,
            checkout,
            scraping_utilise: !!scraping
        });

        res.json({
            succes: true,
            promptsRestants: 10 - (user.promptsUtilises + 1),
            voyageId: voyage._id,
            itineraire,
            meta: {
                destination,
                checkin,
                checkout,
                rag_utilise:      !!ragContexte,
                scraping_utilise: !!scraping,
                hotels_trouves:   scraping?.hotels?.length || 0,
                vols_trouves:     scraping?.vols?.length   || 0,
                restos_trouves:   scraping?.restos?.length || 0,
            }
        });

    } catch (err) {
        console.error('❌ Erreur genererVoyage:', err);
        res.status(500).json({ message: err.message });
    }
};

// @GET /api/voyages/mes-voyages
const getMesVoyages = async (req, res) => {
    try {
        const voyages = await Voyage.find({ user: req.user._id })
            .sort({ createdAt: -1 });
        res.json(voyages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @GET /api/voyages/:id
const getVoyage = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }
        res.json(voyage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { genererVoyage, getMesVoyages, getVoyage };