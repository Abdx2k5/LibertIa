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

        // SA5 — vérifier la blacklist avant toute chose
        const BlacklistedToken = require('../models/BlacklistedToken');
        const estBlacklisté = await BlacklistedToken.findOne({ token });
        if (estBlacklisté) {
            return res.status(401).json({ message: 'Token révoqué - veuillez vous reconnecter.' });
        }

        // SA1 — vérifier l'access token (15min)
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (err) {
            if (err.name === 'TokenExpiredError') {
                // Signal explicite au client pour appeler /refresh-token
                return res.status(401).json({ message: 'Token expiré', expired: true });
            }
            return res.status(401).json({ message: 'Non autorisé - token invalide' });
        }

        const user = await User.findById(decoded.id).select('-motDePasse -refreshToken');

        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Non autorisé - utilisateur non trouvé ou désactivé' });
        }

        req.user  = user;
        req.token = token; // SA5 — nécessaire pour blacklister au logout

        return next();

    } catch (err) {
        return res.status(401).json({ message: 'Non autorisé - erreur serveur' });
    }
};

// T99 — restreint l'accès aux administrateurs (à utiliser après `proteger`)
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        return next();
    }
    return res.status(403).json({ message: 'Accès réservé aux administrateurs' });
};

module.exports = { proteger, admin };