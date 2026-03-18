const express = require('express');
const router = express.Router();
const {
    register,
    login,
    getMe,
    forgotPassword,
    resetPassword,
    updateProfile
} = require('../controllers/authController');
const { proteger } = require('../middlewares/authMiddleware');

router.post('/register',        register);
router.post('/login',           login);
router.get('/me',               proteger, getMe);

// T6 — Demande de reset password (envoi email)
router.post('/forgot-password', forgotPassword);

// T8 — Reset password avec token
router.post('/reset-password/:token', resetPassword);

// T12 — Modification profil
router.put('/update-profile',   proteger, updateProfile);

module.exports = router;