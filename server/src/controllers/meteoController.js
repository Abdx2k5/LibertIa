const axios = require('axios');

// ─────────────────────────────────────────────
//  T112 — @GET /api/meteo?destination=
//  Météo actuelle via OpenWeatherMap
// ─────────────────────────────────────────────
const getMeteo = async (req, res) => {
    try {
        const destination = (req.query.destination || '').trim();

        if (!destination) {
            return res.status(400).json({ success: false, message: 'Le paramètre "destination" est requis' });
        }

        const apiKey = process.env.OPENWEATHERMAP_API_KEY;
        if (!apiKey) {
            return res.status(503).json({ success: false, message: 'Service météo non configuré' });
        }

        const response = await axios.get(
            'https://api.openweathermap.org/data/2.5/weather',
            {
                params: { q: destination, appid: apiKey, units: 'metric', lang: 'fr' },
                timeout: 10000
            }
        );

        const d = response.data;
        res.json({
            success: true,
            data: {
                destination: d.name,
                pays: d.sys?.country,
                temperature: d.main?.temp,
                ressenti: d.main?.feels_like,
                humidite: d.main?.humidity,
                description: d.weather?.[0]?.description,
                icone: d.weather?.[0]?.icon,
                vent: { vitesse: d.wind?.speed, direction: d.wind?.deg },
                visibilite: d.visibility,
                nuages: d.clouds?.all,
                lever_soleil: d.sys?.sunrise ? new Date(d.sys.sunrise * 1000).toISOString() : null,
                coucher_soleil: d.sys?.sunset ? new Date(d.sys.sunset * 1000).toISOString() : null
            }
        });
    } catch (err) {
        if (err.response?.status === 404) {
            return res.status(404).json({ success: false, message: 'Destination non trouvée' });
        }
        res.status(500).json({ success: false, message: err.message });
    }
};

module.exports = { getMeteo };
