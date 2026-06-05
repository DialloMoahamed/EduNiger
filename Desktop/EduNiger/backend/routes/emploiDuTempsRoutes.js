const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/emploiDuTempsController');
const { auth, isAdmin } = require('../middleware/auth');
const db = require('../config/database');

// Matieres (nécessaire pour le formulaire admin)
router.get('/matieres', auth, async (req, res) => {
  try {
    const [matieres] = await db.query('SELECT * FROM matieres ORDER BY nom');
    res.json({ success: true, matieres });
  } catch (e) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

// Parent — lecture seule (via eleve_id)
router.get('/parent', auth, ctrl.getForParent);

// Admin/Enseignant — lecture par classe
router.get('/classe/:classe_id', auth, ctrl.getByClasse);

// Admin — CRUD
router.post('/',      auth, isAdmin, ctrl.create);
router.put('/:id',   auth, isAdmin, ctrl.update);
router.delete('/:id', auth, isAdmin, ctrl.remove);

module.exports = router;
