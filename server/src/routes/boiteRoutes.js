const express = require('express');
const router = express.Router();
const {
    creerBoite,
    getMesBoites,
    getBoite,
    inviterMembre,
    retirerMembre,
    supprimerBoite,
    getMessages
} = require('../controllers/boiteController');
const { proteger } = require('../middlewares/authMiddleware');

// T82 — Boîtes collaboratives
router.post('/', proteger, creerBoite);
router.get('/', proteger, getMesBoites);
router.get('/:id', proteger, getBoite);
router.post('/:id/inviter', proteger, inviterMembre);
router.delete('/:id/membres/:userId', proteger, retirerMembre);
router.delete('/:id', proteger, supprimerBoite);

// T84 — Historique des messages
router.get('/:id/messages', proteger, getMessages);

module.exports = router;
