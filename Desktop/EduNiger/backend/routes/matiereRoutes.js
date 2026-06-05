const express = require('express');
const router  = express.Router();
const db      = require('../config/database');
const { auth } = require('../middleware/auth');

router.use(auth);

// GET /api/matieres — liste toutes les matières
router.get('/', async (req, res) => {
  try {
    const [matieres] = await db.query('SELECT * FROM matieres ORDER BY nom');
    res.json({ success: true, matieres });
  } catch (error) {
    console.error('Erreur getMatieres:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
});

module.exports = router;
