const express = require('express');
const router = express.Router();
const eleveController = require('../controllers/eleveController');
const { auth, isAdmin } = require('../middleware/auth');

// Toutes les routes nécessitent l'authentification
router.use(auth);

router.get('/', eleveController.getAllEleves);
router.get('/stats', eleveController.getStats);
router.get('/:id', eleveController.getEleveById);
router.post('/', isAdmin, eleveController.createEleve);
router.put('/:id', isAdmin, eleveController.updateEleve);
router.delete('/:id', isAdmin, eleveController.deleteEleve);

module.exports = router;
