const axios = require('axios');
const User = require('../models/User');
const Voyage = require('../models/Voyage');

// @POST /api/voyages/generer
const genererVoyage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user._id;

        const user = await User.findById(userId);
        if (user.abonnement === 'free' && user.promptsUtilises >= 10) {
            return res.status(403).json({
                message: 'Limite atteinte - passez en premium pour continuer'
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
                num_predict: 800,
                num_ctx: 2048
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