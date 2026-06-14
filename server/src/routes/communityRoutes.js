const express = require('express');
const router = express.Router();
const {
    getFeed,
    getCommentaires,
    ajouterCommentaire,
    supprimerCommentaire
} = require('../controllers/communityController');
const { proteger } = require('../middlewares/authMiddleware');

router.get('/feed', proteger, getFeed);

router.get('/voyages/:id/commentaires', proteger, getCommentaires);
router.post('/voyages/:id/commentaires', proteger, ajouterCommentaire);
router.delete('/voyages/:id/commentaires/:commentId', proteger, supprimerCommentaire);

module.exports = router;
