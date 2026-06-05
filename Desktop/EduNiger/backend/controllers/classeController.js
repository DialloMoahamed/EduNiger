const db = require('../config/database');

// Obtenir toutes les classes
exports.getAllClasses = async (req, res) => {
  try {
    const [classes] = await db.query(`
      SELECT c.*, 
             u.nom as enseignant_nom, 
             u.prenom as enseignant_prenom,
             COUNT(e.id) as nombre_eleves
      FROM classes c
      LEFT JOIN users u ON c.enseignant_id = u.id
      LEFT JOIN eleves e ON c.id = e.classe_id
      GROUP BY c.id
      ORDER BY c.niveau, c.nom
    `);
    
    res.json({
      success: true,
      count: classes.length,
      classes
    });
  } catch (error) {
    console.error('Erreur getAllClasses:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Obtenir une classe par ID
exports.getClasseById = async (req, res) => {
  try {
    const [classes] = await db.query(`
      SELECT c.*, 
             u.nom as enseignant_nom, 
             u.prenom as enseignant_prenom,
             u.email as enseignant_email,
             COUNT(e.id) as nombre_eleves
      FROM classes c
      LEFT JOIN users u ON c.enseignant_id = u.id
      LEFT JOIN eleves e ON c.id = e.classe_id
      WHERE c.id = ?
      GROUP BY c.id
    `, [req.params.id]);
    
    if (classes.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Classe non trouvée' 
      });
    }
    
    const [eleves] = await db.query(`
      SELECT * FROM eleves WHERE classe_id = ? ORDER BY nom, prenom
    `, [req.params.id]);
    
    res.json({
      success: true,
      classe: {
        ...classes[0],
        eleves
      }
    });
  } catch (error) {
    console.error('Erreur getClasseById:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Créer une classe
exports.createClasse = async (req, res) => {
  try {
    const { nom, niveau, annee_scolaire, enseignant_id } = req.body;
    
    if (!nom || !niveau || !annee_scolaire) {
      return res.status(400).json({ 
        success: false, 
        message: 'Champs obligatoires manquants' 
      });
    }
    
    const [result] = await db.query(
      `INSERT INTO classes (nom, niveau, annee_scolaire, enseignant_id)
       VALUES (?, ?, ?, ?)`,
      [nom, niveau, annee_scolaire, enseignant_id]
    );
    
    const [newClasse] = await db.query(
      'SELECT * FROM classes WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Classe créée avec succès',
      classe: newClasse[0]
    });
  } catch (error) {
    console.error('Erreur createClasse:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Modifier une classe
exports.updateClasse = async (req, res) => {
  try {
    const { nom, niveau, annee_scolaire, enseignant_id } = req.body;
    
    const [result] = await db.query(
      `UPDATE classes SET 
       nom = ?, niveau = ?, annee_scolaire = ?, enseignant_id = ?
       WHERE id = ?`,
      [nom, niveau, annee_scolaire, enseignant_id, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Classe non trouvée' 
      });
    }
    
    const [updatedClasse] = await db.query(
      'SELECT * FROM classes WHERE id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Classe modifiée avec succès',
      classe: updatedClasse[0]
    });
  } catch (error) {
    console.error('Erreur updateClasse:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Supprimer une classe
exports.deleteClasse = async (req, res) => {
  try {
    // Vérifier s'il y a des élèves dans cette classe
    const [eleves] = await db.query(
      'SELECT COUNT(*) as count FROM eleves WHERE classe_id = ?',
      [req.params.id]
    );
    
    if (eleves[0].count > 0) {
      return res.status(400).json({ 
        success: false, 
        message: 'Impossible de supprimer une classe contenant des élèves' 
      });
    }
    
    const [result] = await db.query(
      'DELETE FROM classes WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Classe non trouvée' 
      });
    }
    
    res.json({
      success: true,
      message: 'Classe supprimée avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteClasse:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};
