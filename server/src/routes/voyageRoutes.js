const express = require('express');
const router = express.Router();
const {
    genererVoyage,
    getMesVoyages,
    getVoyage,
    getCarteVoyages,
    supprimerVoyage,
    togglePartage,
    ajouterLike,
    retirerLike,
    getBudget,
    updateBudget,
    recalculerBudget,
    getConseils,
    regenererConseils,
    getPrivacite,
    updatePrivacite
} = require('../controllers/voyageController');
const { proteger } = require('../middlewares/authMiddleware');

router.post('/generer', proteger, genererVoyage);
router.get('/mes-voyages', proteger, getMesVoyages);
// T44 — route littérale "/carte" déclarée AVANT "/:id" pour éviter
// qu'elle ne soit interceptée comme un paramètre :id
router.get('/carte', proteger, getCarteVoyages);
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

router.get('/:id/privacite', proteger, getPrivacite);
router.patch('/:id/privacite', proteger, updatePrivacite);

module.exports = router;