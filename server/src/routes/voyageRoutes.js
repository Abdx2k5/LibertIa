const express = require('express');
const router = express.Router();
const { genererVoyage, getMesVoyages, getVoyage , supprimerVoyage ,togglePartage , ajouterLike , retirerLike } = require('../controllers/voyageController');
const { proteger } = require('../middlewares/authMiddleware');

router.post('/generer', proteger, genererVoyage);
router.get('/mes-voyages', proteger, getMesVoyages);
router.get('/:id', proteger, getVoyage);
router.delete('/:id', proteger, supprimerVoyage);
router.patch('/:id/partage', proteger, togglePartage);
router.post('/:id/like', proteger, ajouterLike);
router.delete('/:id/like', proteger, retirerLike);

module.exports = router;