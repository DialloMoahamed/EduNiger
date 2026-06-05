const express = require('express');
const router = express.Router();
const presenceController = require('../controllers/presenceController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', presenceController.getPresences);
router.post('/mark', presenceController.markPresences);
router.get('/eleve/:eleve_id/stats', presenceController.getElevePresenceStats);
router.get('/classe/:classe_id/stats', presenceController.getClassePresenceStats);
router.get('/classe/:classe_id/liste-pdf', presenceController.downloadListeClasse);
router.get('/classe/:classe_id/appel-pdf/:date', presenceController.downloadFeuilleAppel);

module.exports = router;
