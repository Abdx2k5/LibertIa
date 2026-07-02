const express = require('express');
const router = express.Router();
const {
    genererVoyage,
    genererVoyageStream,
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
    updatePrivacite,
    exportPDF
} = require('../controllers/voyageController');
const { proteger } = require('../middlewares/authMiddleware');

// Routes littérales déclarées AVANT "/:id"
router.post('/generer', proteger, genererVoyage);
// T24 — Génération streaming SSE
router.post('/generer/stream', proteger, genererVoyageStream);
router.get('/mes-voyages', proteger, getMesVoyages);
// T44 — route littérale "/carte" déclarée AVANT "/:id"
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

// T107 — Export PDF
router.get('/:id/export-pdf', proteger, exportPDF);

module.exports = router;