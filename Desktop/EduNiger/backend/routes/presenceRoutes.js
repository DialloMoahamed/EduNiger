const express    = require('express');
const router     = express.Router();
const presenceController = require('../controllers/presenceController');
const { auth }   = require('../middleware/auth');

router.use(auth);

// ── Lecture ────────────────────────────────────────────────────
router.get('/',                                     presenceController.getPresences);
router.get('/historique',                           presenceController.getHistoriqueJour);
router.get('/eleve/:eleve_id/stats',                presenceController.getElevePresenceStats);
router.get('/classe/:classe_id/stats',              presenceController.getClassePresenceStats);
router.get('/classe/:classe_id/liste-pdf',          presenceController.downloadListeClasse);
router.get('/classe/:classe_id/appel-pdf/:date',    presenceController.downloadAppelPDF);

// ── Écriture ───────────────────────────────────────────────────
// Nouveau : enregistrement multi-cours par matière + créneau horaire
router.post('/multi',                               presenceController.markPresencesMulti);
// Ancien (compatibilité)
router.post('/mark',                                presenceController.markPresences);

module.exports = router;
