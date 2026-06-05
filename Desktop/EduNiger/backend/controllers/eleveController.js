const db = require('../config/database');

// Obtenir tous les élèves
exports.getAllEleves = async (req, res) => {
  try {
    const { classe_id, search } = req.query;
    
    let query = `
      SELECT e.*, c.nom as classe_nom, c.niveau 
      FROM eleves e 
      LEFT JOIN classes c ON e.classe_id = c.id 
      WHERE 1=1
    `;
    
    const params = [];
    
    if (classe_id) {
      query += ' AND e.classe_id = ?';
      params.push(classe_id);
    }
    
    if (search) {
      query += ' AND (e.nom LIKE ? OR e.prenom LIKE ? OR e.matricule LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }
    
    query += ' ORDER BY e.nom, e.prenom';
    
    const [eleves] = await db.query(query, params);
    
    res.json({
      success: true,
      count: eleves.length,
      eleves
    });
  } catch (error) {
    console.error('Erreur getAllEleves:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Obtenir un élève par ID
exports.getEleveById = async (req, res) => {
  try {
    const [eleves] = await db.query(
      `SELECT e.*, c.nom as classe_nom, c.niveau 
       FROM eleves e 
       LEFT JOIN classes c ON e.classe_id = c.id 
       WHERE e.id = ?`,
      [req.params.id]
    );
    
    if (eleves.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Élève non trouvé' 
      });
    }
    
    res.json({
      success: true,
      eleve: eleves[0]
    });
  } catch (error) {
    console.error('Erreur getEleveById:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Créer un élève
exports.createEleve = async (req, res) => {
  try {
    const {
      matricule, nom, prenom, date_naissance, lieu_naissance,
      sexe, classe_id, nom_parent, telephone_parent, adresse
    } = req.body;
    
    if (!matricule || !nom || !prenom || !date_naissance || !sexe) {
      return res.status(400).json({ 
        success: false, 
        message: 'Champs obligatoires manquants' 
      });
    }
    
    const [result] = await db.query(
      `INSERT INTO eleves 
       (matricule, nom, prenom, date_naissance, lieu_naissance, sexe, 
        classe_id, nom_parent, telephone_parent, adresse)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [matricule, nom, prenom, date_naissance, lieu_naissance, sexe, 
       classe_id, nom_parent, telephone_parent, adresse]
    );
    
    const [newEleve] = await db.query(
      'SELECT * FROM eleves WHERE id = ?',
      [result.insertId]
    );
    
    res.status(201).json({
      success: true,
      message: 'Élève créé avec succès',
      eleve: newEleve[0]
    });
  } catch (error) {
    console.error('Erreur createEleve:', error);
    if (error.code === 'ER_DUP_ENTRY') {
      return res.status(400).json({ 
        success: false, 
        message: 'Ce matricule existe déjà' 
      });
    }
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Modifier un élève
exports.updateEleve = async (req, res) => {
  try {
    const {
      matricule, nom, prenom, date_naissance, lieu_naissance,
      sexe, classe_id, nom_parent, telephone_parent, adresse
    } = req.body;
    
    const [result] = await db.query(
      `UPDATE eleves SET 
       matricule = ?, nom = ?, prenom = ?, date_naissance = ?,
       lieu_naissance = ?, sexe = ?, classe_id = ?,
       nom_parent = ?, telephone_parent = ?, adresse = ?
       WHERE id = ?`,
      [matricule, nom, prenom, date_naissance, lieu_naissance, sexe,
       classe_id, nom_parent, telephone_parent, adresse, req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Élève non trouvé' 
      });
    }
    
    const [updatedEleve] = await db.query(
      'SELECT * FROM eleves WHERE id = ?',
      [req.params.id]
    );
    
    res.json({
      success: true,
      message: 'Élève modifié avec succès',
      eleve: updatedEleve[0]
    });
  } catch (error) {
    console.error('Erreur updateEleve:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Supprimer un élève
exports.deleteEleve = async (req, res) => {
  try {
    const [result] = await db.query(
      'DELETE FROM eleves WHERE id = ?',
      [req.params.id]
    );
    
    if (result.affectedRows === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Élève non trouvé' 
      });
    }
    
    res.json({
      success: true,
      message: 'Élève supprimé avec succès'
    });
  } catch (error) {
    console.error('Erreur deleteEleve:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Statistiques des élèves
exports.getStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN sexe = 'M' THEN 1 ELSE 0 END) as garcons,
        SUM(CASE WHEN sexe = 'F' THEN 1 ELSE 0 END) as filles,
        COUNT(DISTINCT classe_id) as classes
      FROM eleves
    `);
    
    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Erreur getStats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};
