const User = require('../models/User');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────

const genererToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

// Transporter Gmail
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
            return res.status(400).json({ message: 'Email déjà utilisé' });
        }

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

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: 'Email ou mot de passe incorrect' });
        }

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

// ─────────────────────────────────────────────
//  T6 — @POST /api/auth/forgot-password
//  Génère un token de reset et envoie l'email
// ─────────────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        const user = await User.findOne({ email });
        if (!user) {
            // Sécurité : ne pas révéler si l'email existe ou non
            return res.json({ message: 'Si cet email existe, un lien de réinitialisation a été envoyé.' });
        }

        // Générer un token aléatoire
        const resetToken = crypto.randomBytes(32).toString('hex');

        // Hasher le token avant de le stocker en base
        const resetTokenHashe = crypto
            .createHash('sha256')
            .update(resetToken)
            .digest('hex');

        // Stocker dans le user (expire dans 15 minutes)
        user.resetPasswordToken = resetTokenHashe;
        user.resetPasswordExpire = Date.now() + 15 * 60 * 1000; // 15 min
        await user.save();

        // Construire le lien de reset
        const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

        // Envoyer l'email
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
//  Valide le token et met à jour le mot de passe
// ─────────────────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        const { token } = req.params;
        const { motDePasse } = req.body;

        // Hasher le token reçu pour comparer avec celui en base
        const resetTokenHashe = crypto
            .createHash('sha256')
            .update(token)
            .digest('hex');

        // Trouver l'utilisateur avec ce token non expiré
        const user = await User.findOne({
            resetPasswordToken: resetTokenHashe,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: 'Token invalide ou expiré.' });
        }

        // Mettre à jour le mot de passe
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
//  Modification du profil utilisateur
// ─────────────────────────────────────────────
const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { nom, age, preferences, bio } = req.body;

        // Champs modifiables
        const champsAutorises = {};
        if (nom)         champsAutorises.nom         = nom;
        if (age)         champsAutorises.age         = age;
        if (preferences) champsAutorises.preferences = preferences;
        if (bio)         champsAutorises.bio         = bio;

        const user = await User.findByIdAndUpdate(
            userId,
            { $set: champsAutorises },
            { new: true, runValidators: true }
        ).select('-motDePasse -resetPasswordToken -resetPasswordExpire');

        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        res.json({
            message: 'Profil mis à jour avec succès.',
            user
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

module.exports = { register, login, getMe, forgotPassword, resetPassword, updateProfile };