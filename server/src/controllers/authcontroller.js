const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Générer un token JWT
const genererToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// @POST /api/auth/register
const register = async (req, res) => {
    try {
        const { nom, email, motDePasse, age } = req.body;

        // Vérifier si l'utilisateur existe déjà
        const userExiste = await User.findOne({ email });
        if (userExiste) {
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }

        // Créer l'utilisateur
        const user = await User.create({ nom, email, motDePasse, age });

        res.status(201).json({
            _id: user._id,
            nom: user.nom,
            email: user.email,
            abonnement: user.abonnement,
            token: genererToken(user._id)
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        // Trouver l'utilisateur
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // Vérifier le mot de passe
        const motDePasseValide = await user.comparerMotDePasse(motDePasse);
        if (!motDePasseValide) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        res.json({
            _id: user._id,
            nom: user.nom,
            email: user.email,
            abonnement: user.abonnement,
            token: genererToken(user._id)
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


// @GET /api/auth/me
const getMe = async (req, res) => {
    res.json(req.user);
};

module.exports = { register, login, getMe };