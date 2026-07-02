const express = require('express');
const router = express.Router();
const {
    register,
    login,
    googleAuth,
    facebookAuth,
    getMe,
    forgotPassword,
    resetPassword,
    updateProfile,
    getPublicProfile,
    supprimerCompte,
    refreshTokenHandler,
    logout
} = require('../controllers/authController');
const { proteger } = require('../middlewares/authMiddleware');

router.post('/register',              register);
router.post('/login',                 login);

// OAuth — connexion via Google / Facebook
router.post('/google',                googleAuth);
router.post('/facebook',              facebookAuth);

router.get('/me',                     proteger, getMe);

// T6 — Reset password envoi email
router.post('/forgot-password',       forgotPassword);

// T8 — Reset password validation token
router.post('/reset-password/:token', resetPassword);

// T12 — Modification profil
router.put('/update-profile',         proteger, updateProfile);

// Profil public — pas de `proteger`, consultable par n'importe qui (y compris déconnecté)
router.get('/users/:userId/public',   getPublicProfile);

// T16 — Suppression compte RGPD
router.delete('/supprimer-compte',    proteger, supprimerCompte);

// SA1 — Refresh token / Logout
router.post('/refresh-token',         refreshTokenHandler);
router.post('/logout',                proteger, logout);

module.exports = router;