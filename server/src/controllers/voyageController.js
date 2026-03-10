const axios = require('axios');
const User = require('../models/User');

// @POST /api/voyages/generer
const genererVoyage = async (req, res) => {
    try {
        const { prompt } = req.body;
        const userId = req.user._id;

        // Vérifier limite prompts freemium
        const user = await User.findById(userId);
        if (user.abonnement === 'free' && user.promptsUtilises >= 10) {
            return res.status(403).json({
                message: 'Limite atteinte - passez en premium pour continuer'
            });
        }

        // Appel Ollama (Mistral local)
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
            stream: false
        });

        // Parser la réponse JSON
        let itineraire;
        try {
            const text = response.data.response;
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            itineraire = JSON.parse(jsonMatch[0]);
        } catch {
            return res.status(500).json({ message: 'Erreur parsing réponse IA' });
        }

        // Incrémenter compteur prompts
        await User.findByIdAndUpdate(userId, {
            $inc: { promptsUtilises: 1 }
        });

        res.json({
            succes: true,
            promptsRestants: 10 - (user.promptsUtilises + 1),
            itineraire
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { genererVoyage };