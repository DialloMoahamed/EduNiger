const express = require('express');
const router = express.Router();
const noteController = require('../controllers/noteController');
const { auth } = require('../middleware/auth');

router.use(auth);

router.get('/', noteController.getNotes);
router.post('/', noteController.createNote);
router.put('/:id', noteController.updateNote);
router.delete('/:id', noteController.deleteNote);
router.get('/eleve/:eleve_id/moyenne', noteController.getEleveMoyenne);
router.get('/bulletin/:eleve_id/:periode', noteController.generateBulletin);

module.exports = router;
