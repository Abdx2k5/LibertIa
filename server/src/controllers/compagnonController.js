const axios = require('axios');
const Compagnon = require('../models/Compagnon');
const User = require('../models/User');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const getCompagnon = async (req, res) => {
    try {
        let compagnon = await Compagnon.findOne({ user: req.user._id });
        if (!compagnon) compagnon = await Compagnon.create({ user: req.user._id });
        res.json(compagnon);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const chat = async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ message: 'Message requis' });

        let compagnon = await Compagnon.findOne({ user: req.user._id });
        if (!compagnon) compagnon = await Compagnon.create({ user: req.user._id });

        const user = await User.findById(req.user._id);

        const systemPrompt = `Tu es Colibri, le compagnon de voyage de ${user.nom}. Tu es petit mais puissant, comme le colibri qui fait sa part pour eteindre le feu de la foret. Tu as ${compagnon.points} points et tu es de niveau ${compagnon.niveau}. Tu parles en francais, tu es chaleureux et passionne de voyage. Reponds en 2-3 phrases max.`;

        const response = await axios.post(GROQ_API_URL, {
            model: 'llama-3.3-70b-versatile',
            messages: [
                { role: 'system', content: systemPrompt },
                ...compagnon.historique_chat.slice(-6).map(m => ({ role: m.role, content: m.content })),
                { role: 'user', content: message }
            ],
            max_tokens: 150,
            temperature: 0.8
        }, {
            headers: {
                'Authorization': `Bearer ${process.env.GROQ_API_KEY}`,
                'Content-Type': 'application/json'
            }
        });

        const reponse = response.data.choices[0].message.content;
        compagnon.historique_chat.push({ role: 'user', content: message });
        compagnon.historique_chat.push({ role: 'assistant', content: reponse });
        await compagnon.ajouterPoints(5);

        res.json({ reponse, points: compagnon.points, niveau: compagnon.niveau, humeur: compagnon.humeur });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const ajouterPhoto = async (req, res) => {
    try {
        const { data, caption } = req.body;
        if (!data) return res.status(400).json({ message: 'Photo requise' });

        let compagnon = await Compagnon.findOne({ user: req.user._id });
        if (!compagnon) compagnon = await Compagnon.create({ user: req.user._id });

        compagnon.photos.push({ data, caption: caption || '' });
        await compagnon.ajouterPoints(10);

        res.json({ message: 'Colibri a adore ta photo ! +10 points', points: compagnon.points, niveau: compagnon.niveau });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

const getClassement = async (req, res) => {
    try {
        const classement = await Compagnon.find()
            .sort({ points: -1 })
            .limit(10)
            .populate('user', 'nom profilePhoto');

        res.json(classement.map((c, i) => ({
            rang: i + 1,
            nom: c.user?.nom || 'Voyageur',
            points: c.points,
            niveau: c.niveau,
            humeur: c.humeur
        })));
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { getCompagnon, chat, ajouterPhoto, getClassement };
