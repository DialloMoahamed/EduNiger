const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/ecoleController');
const { auth, isAdmin } = require('../middleware/auth');

router.get('/',    auth, ctrl.getEcole);
router.put('/',    auth, isAdmin, ctrl.updateEcole);

module.exports = router;
