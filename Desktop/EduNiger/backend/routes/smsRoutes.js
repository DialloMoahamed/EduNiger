const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/smsController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get   ('/',             ctrl.getNotifications);
router.get   ('/stats',        ctrl.getStats);
router.post  ('/bulletin',     ctrl.envoyerSmsBulletin);
router.post  ('/notes-classe', ctrl.envoyerSmsNotesClasse);
router.post  ('/retard',       ctrl.envoyerSmsRetard);
router.post  ('/:id/renvoyer', ctrl.renvoyerNotification);
router.delete('/:id',          ctrl.deleteNotification);

module.exports = router;