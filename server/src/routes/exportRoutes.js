const express = require('express');
const router = express.Router();
const {
    exporterUtilisateurs,
    exporterVoyages,
    exporterAgences
} = require('../controllers/exportController');
const { proteger, admin } = require('../middlewares/authMiddleware');

// T128 — Export CSV/Excel, réservé aux administrateurs
router.get('/utilisateurs', proteger, admin, exporterUtilisateurs);
router.get('/voyages', proteger, admin, exporterVoyages);
router.get('/agences', proteger, admin, exporterAgences);

module.exports = router;
