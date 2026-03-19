const axios = require('axios');
const { spawn } = require('child_process');
const path  = require('path');

// Racine du projet (LibertIa/) — un niveau au-dessus de server/
const ROOT = path.join(__dirname, '..', '..', '..');
const User = require('../models/User');
const Voyage = require('../models/Voyage');
<<<<<<< HEAD
// URL du service Ollama (à externaliser dans .env)
const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434/api/generate';
/*
* NOUVEAU :
 * - Validation des entrées
 * - Gestion des erreurs de connexion à l'IA (timeout, refus)
 * - Parsing JSON robuste (extraction même si l'IA ajoute du texte)
 * - Utilisation des champs existants (abonnement, promptsUtilises)
 *  MODIFICATIONS :
 * - Correction de la condition de quota (utilisation de user.peutGenerer())
 * - Gestion des erreurs Axios (timeout, refus de connexion)
 * - Parsing robuste avec fallback
 * - Utilisation des méthodes du modèle User (peutGenerer, promptsRestants)
 * - Mise à jour du compteur avec user.save() plutôt que findByIdAndUpdate
 * - Suppression des doublons dans la réponse JSON
*/
=======

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

>>>>>>> 99df27b1481503a4319172145f5d7e7703abdd39
// @POST /api/voyages/generer
const genererVoyage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user._id;
        
        // 1. Validation des inputs 
        // Protège contre les requêtes vides ou trop courtes
        if (!prompt || prompt.trim().length < 5) {
            return res.status(400).json({ 
                success: false,
                message: 'Le prompt doit contenir au moins 5 caractères' 
            });
        }  

<<<<<<< HEAD
        //Récupération utilisateur et vérification quota 
=======
        // Vérification freemium
>>>>>>> 99df27b1481503a4319172145f5d7e7703abdd39
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ 
                success: false,
                message: 'Utilisateur non trouvé' 
            });
        }
        // Utilisation de la méthode du modèle User
        if (!user.peutGenerer()) {
            return res.status(403).json({
                success: false,
                message: 'Limite de générations atteinte - passez en premium pour continuer',
                code: 'QUOTA_EXCEEDED',
                promptsRestants: user.promptsRestants()
            });
        }

<<<<<<< HEAD
        let response;
        try {
            response = await axios.post(OLLAMA_URL, {
=======
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
>>>>>>> 99df27b1481503a4319172145f5d7e7703abdd39
            model: 'mistral',
            prompt: promptEnrichi,
            stream: false,
            options: {
                temperature: 0.7,
                num_predict: 1500,
                num_ctx: 4096
            }
<<<<<<< HEAD
        });
        }  catch (error) {
            console.error('Erreur appel Ollama:', error.message);
            if (error.code === 'ECONNREFUSED') {
                return res.status(503).json({
                    success: false,
                    message: 'Service IA indisponible - Veuillez réessayer plus tard'
                });
            }
            if (error.code === 'ETIMEDOUT') {
                return res.status(504).json({
                    success: false,
                    message: 'Délai de génération dépassé - Veuillez réessayer'
                });
            }
            return res.status(500).json({
                success: false,
                message: 'Erreur lors de la communication avec l\'IA'
            });
        }

        let itinerairData;
=======
        }, { timeout: 120000 }); // 2 minutes

        // ── ÉTAPE 6 : Parser la réponse ──
        let itineraire;
>>>>>>> 99df27b1481503a4319172145f5d7e7703abdd39
        try {
            const text = response.data.response;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            itineraireData = JSON.parse(jsonMatch[0]);
            // Validation minimale (présence de destination et jours)
            if (!itineraireData.destination || !itineraireData.jours) {
                throw new Error('Structure JSON incomplète');
            }
        } catch (parseError) {
            console.error('Erreur parsing JSON:', parseError.message);
            // Fallback : on garde le prompt comme titre et on crée un itinéraire minimal
            itineraireData = {
                destination: prompt.split(' ').slice(0, 2).join(' ') || 'Destination inconnue',
                duree_jours: 3,
                budget_estime: 'À définir',
                jours: [
                    {
                        jour: 1,
                        matin: { activite: 'Exploration libre', lieu: 'Centre-ville', duree: '3h' },
                        apres_midi: { activite: 'Visites', lieu: 'À découvrir', duree: '3h' },
                        soir: { activite: 'Dîner', lieu: 'Restaurant local', duree: '2h' }
                    }
                ],
                conseils: ['Vérifiez les conditions locales', 'Réservez à l\'avance'],
                budget_detail: {
                    hotel: 'À définir',
                    transport: 'À définir',
                    repas: 'À définir',
                    activites: 'À définir'
                }
            };
        }
<<<<<<< HEAD
        // Mise à jour du compteur de prompts utilisés
        user.promptsUtilises += 1;
        await user.save();
        // Création du voyage avec les champs du modèle Voyage
        const voyage = await Voyage.create({
            user: userId,
            prompt,
            itineraire: itineraireData,
            titre: `Voyage à ${itineraireData.destination}`,
            destination: itineraireData.destination,
            dates: {
                start: new Date(),
                end: new Date(Date.now() + (itineraireData.duree_jours || 3) * 24 * 60 * 60 * 1000)
            },
            budget: { total: parseFloat(itineraireData.budget_estime) || 0, currency: 'EUR' }
=======

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
>>>>>>> 99df27b1481503a4319172145f5d7e7703abdd39
        });
        //Réponse
        res.json({
<<<<<<< HEAD
            success: true,
            message: 'Voyage généré avec succès',
            data: {
                voyageId: voyage._id,
                itineraire: itineraireData,
                promptsRestants: user.abonnement === 'free' ? 10 - user.promptsUtilises : 'Illimité'
=======
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
>>>>>>> 99df27b1481503a4319172145f5d7e7703abdd39
            }
        });

    } catch (err) {
<<<<<<< HEAD
        console.error('Erreur génération voyage:', err);
=======
        console.error('❌ Erreur genererVoyage:', err);
>>>>>>> 99df27b1481503a4319172145f5d7e7703abdd39
        res.status(500).json({ message: err.message });
    }
};

/**
 * desc    Obtenir tous les voyages de l'utilisateur
 * route   GET /api/voyages/mes-voyages
 * access  Private
 */
const getMesVoyages = async (req, res) => {
    try {
        const voyages = await Voyage.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(voyages);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * @ desc    Obtenir un voyage par ID
 * @ route   GET /api/voyages/:id
 * @ access  Private
 */
const getVoyage = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) {
            return res.status(404).json({ message: 'Voyage non trouvé' });
        }
        // Vérifier que l'utilisateur est propriétaire (si privé)
        if (!voyage.partage && voyage.user._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }
// Si le champ vues existe, on l'incrémente  on peut l'ajouter plus tard)
        res.json(voyage);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

/**
 * AJOUT : Supprimer un voyage
 * DELETE /api/voyages/:id
 */
const supprimerVoyage = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) {
            return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        }
        if (voyage.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }
        await voyage.deleteOne();
        res.json({ success: true, message: 'Voyage supprimé' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * AJOUT : Basculer la visibilité publique/privée
 * PATCH /api/voyages/:id/partage
 */
const togglePartage = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) {
            return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        }
        if (voyage.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ success: false, message: 'Non autorisé' });
        }
        voyage.partage = !voyage.partage;
        await voyage.save();
        res.json({
            success: true,
            message: voyage.partage ? 'Voyage partagé publiquement' : 'Voyage privé',
            partage: voyage.partage
        });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * AJOUT : Ajouter un like (utilise la méthode du modèle Voyage)
 * POST /api/voyages/:id/like
 */
const ajouterLike = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) {
            return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        }
        // Empêcher de liker son propre voyage (optionnel)
        if (voyage.user.toString() === req.user._id.toString()) {
            return res.status(400).json({ success: false, message: 'Vous ne pouvez pas liker votre propre voyage' });
        }
        await voyage.ajouterLike(req.user._id); // méthode du modèle
        res.json({ success: true, likeCount: voyage.likeCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};

/**
 * AJOUT : Retirer un like (utilise la méthode du modèle Voyage)
 * DELETE /api/voyages/:id/like
 */
const retirerLike = async (req, res) => {
    try {
        const voyage = await Voyage.findById(req.params.id);
        if (!voyage) {
            return res.status(404).json({ success: false, message: 'Voyage non trouvé' });
        }
        await voyage.retirerLike(req.user._id); // méthode du modèle
        res.json({ success: true, likeCount: voyage.likeCount });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
};
module.exports = { genererVoyage, getMesVoyages, getVoyage ,supprimerVoyage, togglePartage, ajouterLike, retirerLike};