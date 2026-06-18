const express = require('express');
const router = express.Router();
const { estAdmin, getStats, getUsers, suspendreUser, getAgences, validerAgence } = require('../controllers/adminController');
const { proteger } = require('../middlewares/authMiddleware');

// Toutes les routes admin : auth + vérification rôle admin
router.use(proteger, estAdmin);

// T119 — Stats globales
router.get('/stats', getStats);

// T122 — Gestion utilisateurs
router.get('/users', getUsers);
router.patch('/users/:id/suspendre', suspendreUser);

// T126 — Gestion agences
router.get('/agences', getAgences);
router.patch('/agences/:id/valider', validerAgence);

module.exports = router;
