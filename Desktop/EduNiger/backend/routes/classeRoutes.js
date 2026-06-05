const express = require('express');
const router = express.Router();
const classeController = require('../controllers/classeController');
const { auth, isAdmin } = require('../middleware/auth');

router.use(auth);

router.get('/', classeController.getAllClasses);
router.get('/:id', classeController.getClasseById);
router.post('/', isAdmin, classeController.createClasse);
router.put('/:id', isAdmin, classeController.updateClasse);
router.delete('/:id', isAdmin, classeController.deleteClasse);

module.exports = router;
