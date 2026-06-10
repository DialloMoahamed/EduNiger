const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/parentController');
const { auth, isAdmin } = require('../middleware/auth');

// Public
router.post('/login', ctrl.loginParent);

// Parent authentifié
router.get('/dashboard',              auth, ctrl.getDashboard);
router.get('/notes',                  auth, ctrl.getNotes);
router.get('/presences',              auth, ctrl.getPresences);
router.get('/bulletins',              auth, ctrl.getBulletins);
router.get('/bulletin-acces',         auth, ctrl.checkBulletinAcces);
router.get('/bulletin/:eleve_id/:periode', auth, ctrl.downloadBulletin);

// Admin — créer compte parent
router.post('/create-account', auth, isAdmin, ctrl.createParentAccount);

module.exports = router;