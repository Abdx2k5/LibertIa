const express = require('express');
const router = express.Router();
const {
    getFeed,
    getCommentaires,
    ajouterCommentaire,
    supprimerCommentaire,
    creerGroupe,
    getGroupes,
    getGroupe,
    rejoindreGroupe,
    quitterGroupe,
    recherche
} = require('../controllers/communityController');
const { proteger } = require('../middlewares/authMiddleware');

router.get('/feed', proteger, getFeed);

router.get('/voyages/:id/commentaires', proteger, getCommentaires);
router.post('/voyages/:id/commentaires', proteger, ajouterCommentaire);
router.delete('/voyages/:id/commentaires/:commentId', proteger, supprimerCommentaire);

// T64 — Groupes de voyageurs
router.post('/groupes', proteger, creerGroupe);
router.get('/groupes', proteger, getGroupes);
router.get('/groupes/:id', proteger, getGroupe);
router.post('/groupes/:id/rejoindre', proteger, rejoindreGroupe);
router.post('/groupes/:id/quitter', proteger, quitterGroupe);

// T68 — Recherche transversale
router.get('/recherche', proteger, recherche);

module.exports = router;
