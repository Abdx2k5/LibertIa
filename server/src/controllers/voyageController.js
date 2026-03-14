const axios = require('axios');
const User = require('../models/User');
const Voyage = require('../models/Voyage');
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

        //Récupération utilisateur et vérification quota 
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

        let response;
        try {
            response = await axios.post(OLLAMA_URL, {
            model: 'mistral',
            prompt: `Tu es un expert en voyage. Génère un itinéraire détaillé en JSON pour: ${prompt}. 
            Réponds UNIQUEMENT en JSON avec cette structure:
            {
              "destination": "",
              "duree_jours": 0,
              "budget_estime": "",
              "jours": [
                {
                  "jour": 1,
                  "matin": {"activite": "", "lieu": "", "duree": ""},
                  "apres_midi": {"activite": "", "lieu": "", "duree": ""},
                  "soir": {"activite": "", "lieu": "", "duree": ""}
                }
              ],
              "conseils": [],
              "budget_detail": {
                "hotel": "",
                "transport": "",
                "repas": "",
                "activites": ""
              }
            }`,
            stream: false,
            options: {
                temperature: 0.7,
                num_predict: 800,
                num_ctx: 2048
            }
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
        });
        //Réponse
        res.json({
            success: true,
            message: 'Voyage généré avec succès',
            data: {
                voyageId: voyage._id,
                itineraire: itineraireData,
                promptsRestants: user.abonnement === 'free' ? 10 - user.promptsUtilises : 'Illimité'
            }
        });

    } catch (err) {
        console.error('Erreur génération voyage:', err);
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