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
    recherche,
    followUser,
    unfollowUser,
    getFollowers,
    getFollowing,
    creerSignalement,
    getTimeline
} = require('../controllers/communityController');
const { proteger } = require('../middlewares/authMiddleware');

// T55 — Feed
router.get('/feed', proteger, getFeed);

// T59 — Commentaires
router.get('/voyages/:id/commentaires', proteger, getCommentaires);
router.post('/voyages/:id/commentaires', proteger, ajouterCommentaire);
router.delete('/voyages/:id/commentaires/:commentId', proteger, supprimerCommentaire);

// T64 — Groupes de voyageurs
router.post('/groupes', proteger, creerGroupe);
router.get('/groupes', proteger, getGroupes);
router.get('/groupes/:id', proteger, getGroupe);
router.post('/groupes/:id/rejoindre', proteger, rejoindreGroupe);
router.post('/groupes/:id/quitter', proteger, quitterGroupe);

// T66 — Follow / Unfollow
router.post('/users/:id/follow', proteger, followUser);
router.delete('/users/:id/unfollow', proteger, unfollowUser);
router.get('/users/:id/followers', proteger, getFollowers);
router.get('/users/:id/following', proteger, getFollowing);

// T68 — Recherche transversale
router.get('/recherche', proteger, recherche);

// T70 — Signalements
router.post('/signalements', proteger, creerSignalement);

// T88 — Timeline
router.get('/timeline', proteger, getTimeline);

module.exports = router;
