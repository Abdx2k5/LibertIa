const User = require('../models/User');
const Voyage = require('../models/Voyage');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const { encrypt } = require('../utils/encryption');   // SA2
const { auditLog } = require('../utils/auditLogger'); // SA4

// ─────────────────────────────────────────────
//  HELPERS — SA1 : Access token 15min / Refresh 7j
// ─────────────────────────────────────────────
const genererTokenAcces = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '15m' });
};

const genererTokenRafraichissement = (id) => {
    return jwt.sign({ id }, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh', { expiresIn: '7d' });
};

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// ─────────────────────────────────────────────
//  AUTH
// ─────────────────────────────────────────────

// @POST /api/auth/register
const register = async (req, res) => {
    try {
        const { nom, email, motDePasse, age } = req.body;

        const userExiste = await User.findOne({ email });
        if (userExiste) {
            await auditLog({ action: 'register', req, success: false, details: { email, raison: 'Email déjà utilisé' } });
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }

        const user = await User.create({ nom, email, motDePasse, age });

        // SA1 — générer et stocker le refresh token
        const accessToken  = genererTokenAcces(user._id);
        const refreshToken = genererTokenRafraichissement(user._id);
        user.refreshToken = refreshToken;
        await user.save({ validateModifiedOnly: true });

        // SA4
        await auditLog({ userId: user._id, action: 'register', req, success: true });

        res.status(201).json({
            _id: user._id,
            nom: user.nom,
            email: user.email,
            abonnement: user.abonnement,
            token: accessToken,
            refreshToken
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @POST /api/auth/login
const login = async (req, res) => {
    try {
        const { email, motDePasse } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            await auditLog({ action: 'login', req, success: false, details: { email, raison: 'Email introuvable' } });
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        const motDePasseValide = await user.comparerMotDePasse(motDePasse);
        if (!motDePasseValide) {
            await auditLog({ userId: user._id, action: 'login', req, success: false, details: { raison: 'Mot de passe incorrect' } });
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

        // SA1 — générer et stocker le refresh token
        const accessToken  = genererTokenAcces(user._id);
        const refreshToken = genererTokenRafraichissement(user._id);
        user.refreshToken  = refreshToken;
        user.lastLogin     = new Date();
        await user.save({ validateModifiedOnly: true });

        // SA4
        await auditLog({ userId: user._id, action: 'login', req, success: true });

        res.json({
            _id: user._id,
            nom: user.nom,
            email: user.email,
            abonnement: user.abonnement,
            token: accessToken,
            refreshToken
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @GET /api/auth/me
const getMe = async (req, res) => {
    res.json(req.user);
};

// ─────────────────────────────────────────────
//  T6 — @POST /api/auth/forgot-password
// ─────────────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        const resetTokenHashe = crypto.createHash('sha256').update(resetToken).digest('hex');

        user.resetPasswordToken = resetTokenHashe;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000;
        await user.save();

        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

        await transporter.sendMail({
            from: `"LibertIa" <${process.env.EMAIL_USER}>`,
            to: user.email,
            subject: 'Réinitialisation de votre mot de passe — LibertIa',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                    <h2 style="color: #1B4F72;">LibertIa 🌍</h2>
                    <p>Bonjour <strong>${user.nom}</strong>,</p>
                    <p>Vous avez demandé une réinitialisation de votre mot de passe.</p>
                    <p>Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe :</p>
                    <a href="${resetUrl}" 
                       style="display:inline-block; background:#1B4F72; color:white; padding:12px 24px; 
                              border-radius:6px; text-decoration:none; margin:16px 0;">
                        Réinitialiser mon mot de passe
                    </a>
                    <p style="color:#888; font-size:12px;">Ce lien expire dans <strong>15 minutes</strong>.</p>
                    <p style="color:#888; font-size:12px;">Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
                </div>
            `
        });

        res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────
//  T8 — @POST /api/auth/reset-password/:token
// ─────────────────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { motDePasse } = req.body;

        const resetTokenHashe = crypto.createHash('sha256').update(token).digest('hex');

        const user = await User.findOne({
            resetPasswordToken: resetTokenHashe,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token invalide ou expiré.' });
        }

        user.motDePasse = motDePasse;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;
        await user.save();

        res.json({ message: 'Mot de passe mis à jour avec succès.' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────
//  T12 — @PUT /api/auth/update-profile
// ─────────────────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { nom, age, preferences, bio } = req.body;

        const champsAutorises = {};
        if (nom)         champsAutorises.nom         = nom;
        if (age)         champsAutorises.age         = age;
        // SA2 — chiffrer les données sensibles avant stockage
        if (preferences) champsAutorises.preferences = encrypt(JSON.stringify(preferences));
        if (bio)         champsAutorises.bio         = encrypt(bio);

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: champsAutorises },
            { new: true, runValidators: true }
        ).select('-motDePasse -resetPasswordToken -resetPasswordExpire');

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // SA4
        await auditLog({ userId, action: 'update_profile', req, success: true, details: { champs: Object.keys(champsAutorises) } });

        res.json({ message: 'Profil mis à jour avec succès.', user });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────
//  T16 — @DELETE /api/auth/supprimer-compte
//  Suppression RGPD — anonymisation + purge
// ─────────────────────────────────────────────
const supprimerCompte = async (req, res) => {
    try {
        const userId = req.user._id;
        const { motDePasse } = req.body;

        // 1. Vérifier le mot de passe (confirmation obligatoire)
        if (!motDePasse) {
            return res.status(400).json({ message: 'Mot de passe requis pour confirmer la suppression.' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        const motDePasseValide = await user.comparerMotDePasse(motDePasse);
        if (!motDePasseValide) {
            return res.status(401).json({ message: 'Mot de passe incorrect.' });
        }

        // SA5 — blacklister l'access token courant
        if (req.token) {
            const BlacklistedToken = require('../models/BlacklistedToken');
            const decoded = jwt.decode(req.token);
            const expireAt = decoded?.exp
                ? new Date(decoded.exp * 1000)
                : new Date(Date.now() + 15 * 60 * 1000);
            await BlacklistedToken.create({ token: req.token, expireAt }).catch(() => {});
        }

        // 2. Anonymisation des données (RGPD)
        //    On ne supprime pas physiquement pour garder l'intégrité des données
        //    mais on efface toutes les données personnelles identifiables
        const emailHashe = crypto
            .createHash('sha256')
            .update(user.email + Date.now().toString())
            .digest('hex');

        await User.findByIdAndUpdate(userId, {
            $set: {
                nom:            'Utilisateur supprimé',
                email:          `supprime_${emailHashe.substring(0, 16)}@libertia.deleted`,
                bio:            null,
                profilePhoto:   'default-avatar.png',
                preferences:    null, // SA2 — null car champ String chiffré
                followers:      [],
                following:      [],
                isActive:       false,
                abonnement:     'free',
                // Effacer les tokens de sécurité
                resetPasswordToken:   undefined,
                resetPasswordExpire:  undefined,
            },
            // Effacer l'historique des paiements
            $unset: {
                historiquePaiements: '',
                dateDebutAbonnement: '',
                dateFinAbonnement:   '',
                lastLogin:           '',
                age:                 '',
            }
        });

        // 3. Supprimer les voyages de l'utilisateur
        const voyagesSupprimés = await Voyage.deleteMany({ user: userId });

        // 4. Envoyer email de confirmation de suppression
        try {
            await transporter.sendMail({
                from: `"LibertIa" <${process.env.EMAIL_USER}>`,
                to: user.email, // Envoyer à l'ancien email avant anonymisation
                subject: 'Confirmation de suppression de compte — LibertIa',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto;">
                        <h2 style="color: #1B4F72;">LibertIa 🌍</h2>
                        <p>Bonjour,</p>
                        <p>Votre compte LibertIa a bien été supprimé conformément au RGPD.</p>
                        <p>Toutes vos données personnelles ont été anonymisées et vos voyages supprimés.</p>
                        <p style="color:#888; font-size:12px;">
                            Si vous n'avez pas demandé cette suppression, contactez-nous immédiatement.
                        </p>
                    </div>
                `
            });
        } catch {
            // Ne pas bloquer si l'email échoue
        }

        // SA4
        await auditLog({ userId, action: 'delete_account', req, success: true, details: { voyages_supprimes: voyagesSupprimés.deletedCount } });

        res.json({
            message: 'Compte supprimé avec succès. Vos données ont été anonymisées conformément au RGPD.',
            voyages_supprimes: voyagesSupprimés.deletedCount
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────
//  SA1 — @POST /api/auth/refresh-token
// ─────────────────────────────────────────────
const refreshTokenHandler = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token manquant.' });
        }

        // Vérifier la signature du refresh token
        let decoded;
        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET + '_refresh'
            );
        } catch {
            return res.status(401).json({ message: 'Refresh token invalide ou expiré.' });
        }

        // Vérifier que le refresh token correspond bien à celui stocké en base
        const user = await User.findById(decoded.id).select('refreshToken isActive');
        if (!user || !user.isActive) {
            return res.status(401).json({ message: 'Utilisateur non trouvé ou désactivé.' });
        }
        if (user.refreshToken !== refreshToken) {
            return res.status(401).json({ message: 'Refresh token révoqué.' });
        }

        // Émettre un nouvel access token (rotation : nouveau refresh token aussi)
        const newAccessToken  = genererTokenAcces(user._id);
        const newRefreshToken = genererTokenRafraichissement(user._id);
        user.refreshToken = newRefreshToken;
        await user.save({ validateModifiedOnly: true });

        // SA4
        await auditLog({ userId: user._id, action: 'refresh_token', req, success: true });

        res.json({ token: newAccessToken, refreshToken: newRefreshToken });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ─────────────────────────────────────────────
//  SA1 + SA5 — @POST /api/auth/logout
// ─────────────────────────────────────────────
const logout = async (req, res) => {
    try {
        // SA5 — blacklister l'access token courant (injecté par authMiddleware)
        if (req.token) {
            const BlacklistedToken = require('../models/BlacklistedToken');
            const decoded = jwt.decode(req.token);
            const expireAt = decoded?.exp
                ? new Date(decoded.exp * 1000)
                : new Date(Date.now() + 15 * 60 * 1000);
            await BlacklistedToken.create({ token: req.token, expireAt }).catch(() => {});
        }

        // Révoquer le refresh token en base
        await User.findByIdAndUpdate(req.user._id, { refreshToken: null });

        // SA4
        await auditLog({ userId: req.user._id, action: 'logout', req, success: true });

        res.json({ message: 'Déconnexion réussie.' });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateProfile,
    supprimerCompte,   // T16
    refreshTokenHandler, // SA1
    logout             // SA1 + SA5
};