const jwt = require('jsonwebtoken');
const User = require('../models/User');

const proteger = async (req, res, next) => {
    try {
        let token;

        if (req.headers.authorization &&
            req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Non autorisé - token manquant' });
        }

        console.log('token reçu:', token);
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('decoded:', decoded);
        req.user = await User.findById(decoded.id).select('-motDePasse');
        console.log('user trouvé:', req.user);

        if (!req.user) {
            return res.status(401).json({ message: 'Non autorisé - utilisateur non trouvé' });
        }

        return next();

    } catch (err) {
        console.log('erreur:', err.message);
        return res.status(401).json({ message: 'Non autorisé - token invalide' });
    }
};

module.exports = { proteger };