const express = require('express');
const router = express.Router();
const {
    genererVoyage,
    getMesVoyages,
    getVoyage,
    supprimerVoyage,
    togglePartage,
    ajouterLike,
    retirerLike,
    getBudget,
    updateBudget,
    recalculerBudget,
    getConseils,
    regenererConseils
} = require('../controllers/voyageController');
const { proteger } = require('../middlewares/authMiddleware');

router.post('/generer', proteger, genererVoyage);
router.get('/mes-voyages', proteger, getMesVoyages);
router.get('/:id', proteger, getVoyage);
router.delete('/:id', proteger, supprimerVoyage);
router.patch('/:id/partage', proteger, togglePartage);
router.post('/:id/like', proteger, ajouterLike);
router.delete('/:id/like', proteger, retirerLike);

router.get('/:id/budget', proteger, getBudget);
router.patch('/:id/budget', proteger, updateBudget);
router.post('/:id/budget/recalculer', proteger, recalculerBudget);

router.get('/:id/conseils', proteger, getConseils);
router.post('/:id/conseils/regenerer', proteger, regenererConseils);

module.exports = router;