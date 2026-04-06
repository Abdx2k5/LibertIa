const User = require('../models/User');
const Voyage = require('../models/Voyage');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const nodemailer = require('nodemailer');

// ─────────────────────────────────────────────
//  HELPERS
// ─────────────────────────────────────────────
const genererToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
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
                bio:            '',
                profilePhoto:   'default-avatar.png',
                preferences:    [],
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

        res.json({
            message: 'Compte supprimé avec succès. Vos données ont été anonymisées conformément au RGPD.',
            voyages_supprimes: voyagesSupprimés.deletedCount
        });

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
    supprimerCompte  // T16
};