const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/emploiDuTempsController');
const { auth, isAdmin, isEnseignant } = require('../middleware/auth');
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

// Enseignant — emploi du temps de TOUTES ses classes assignées (lecture seule)
router.get('/enseignant/mes-classes', auth, isEnseignant, ctrl.getForEnseignant);

// Enseignant — liste de tous les enseignants (lecture seule)
router.get('/enseignant/liste-enseignants', auth, isEnseignant, ctrl.getListeEnseignants);

// Admin/Enseignant — lecture par classe
router.get('/classe/:classe_id', auth, ctrl.getByClasse);

// Admin — CRUD
router.post('/',      auth, isAdmin, ctrl.create);
router.put('/:id',   auth, isAdmin, ctrl.update);
router.delete('/:id', auth, isAdmin, ctrl.remove);

module.exports = router;
