const axios = require('axios');
const { spawn } = require('child_process');
const path  = require('path');

// Racine du projet (LibertIa/) — un niveau au-dessus de server/
const ROOT = path.join(__dirname, '..', '..', '..');
const User = require('../models/User');
const Voyage = require('../models/Voyage');

// @POST /api/voyages/generer
const genererVoyage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user._id;

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

        const response = await axios.post('http://localhost:11434/api/generate', {
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
                num_predict: 1500,
                num_ctx: 4096
            }
        });

        let itineraire;
        try {
            const text = response.data.response;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            itineraire = JSON.parse(jsonMatch[0]);
        } catch {
            return res.status(500).json({ message: 'Erreur parsing réponse IA' });
        }

        await User.findByIdAndUpdate(userId, {
            $inc: { promptsUtilises: 1 }
        });

        const voyage = await Voyage.create({
            user: userId,
            prompt,
            itineraire
        });
        //Réponse
        res.json({
            succes: true,
            promptsRestants: 10 - (user.promptsUtilises + 1),
            voyageId: voyage._id,
            itineraire
        });

    } catch (err) {
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