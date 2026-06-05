const db = require('../config/database');

// Obtenir les présences
exports.getPresences = async (req, res) => {
  try {
    const { classe_id, date, eleve_id } = req.query;
    
    let query = `
      SELECT p.*, 
             e.nom as eleve_nom, 
             e.prenom as eleve_prenom,
             e.matricule,
             c.nom as classe_nom,
             u.nom as created_by_nom
      FROM presences p
      JOIN eleves e ON p.eleve_id = e.id
      JOIN classes c ON p.classe_id = c.id
      LEFT JOIN users u ON p.created_by = u.id
      WHERE 1=1
    `;
    
    const params = [];
    
    if (classe_id) {
      query += ' AND p.classe_id = ?';
      params.push(classe_id);
    }
    
    if (date) {
      query += ' AND p.date = ?';
      params.push(date);
    }
    
    if (eleve_id) {
      query += ' AND p.eleve_id = ?';
      params.push(eleve_id);
    }
    
    query += ' ORDER BY p.date DESC, e.nom';
    
    const [presences] = await db.query(query, params);
    
    res.json({
      success: true,
      count: presences.length,
      presences
    });
  } catch (error) {
    console.error('Erreur getPresences:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Enregistrer les présences d'une classe
exports.markPresences = async (req, res) => {
  try {
    const { classe_id, date, presences } = req.body;
    
    if (!classe_id || !date || !presences || !Array.isArray(presences)) {
      return res.status(400).json({ 
        success: false, 
        message: 'Données invalides' 
      });
    }
    
    // Supprimer les présences existantes pour cette date et classe
    await db.query(
      'DELETE FROM presences WHERE classe_id = ? AND date = ?',
      [classe_id, date]
    );
    
    // Insérer les nouvelles présences
    const values = presences.map(p => [
      p.eleve_id,
      classe_id,
      date,
      p.statut || 'present',
      p.motif || null,
      req.user.id
    ]);
    
    if (values.length > 0) {
      await db.query(
        `INSERT INTO presences 
         (eleve_id, classe_id, date, statut, motif, created_by)
         VALUES ?`,
        [values]
      );
    }
    
    // Envoyer SMS aux parents d'élèves absents
    const absents = presences.filter(p => p.statut === 'absent');
    
    for (const absent of absents) {
      const [eleves] = await db.query(
        'SELECT telephone_parent, nom, prenom FROM eleves WHERE id = ?',
        [absent.eleve_id]
      );
      
      if (eleves.length > 0 && eleves[0].telephone_parent) {
        const message = `Absence de ${eleves[0].prenom} ${eleves[0].nom} le ${date}`;
        
        await db.query(
          `INSERT INTO notifications 
           (telephone, message, type, eleve_id)
           VALUES (?, ?, 'absence', ?)`,
          [eleves[0].telephone_parent, message, absent.eleve_id]
        );
      }
    }
    
    res.json({
      success: true,
      message: 'Présences enregistrées avec succès',
      absents: absents.length
    });
  } catch (error) {
    console.error('Erreur markPresences:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Statistiques de présence d'un élève
exports.getElevePresenceStats = async (req, res) => {
  try {
    const [stats] = await db.query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'present' THEN 1 ELSE 0 END) as presents,
        SUM(CASE WHEN statut = 'absent' THEN 1 ELSE 0 END) as absents,
        SUM(CASE WHEN statut = 'retard' THEN 1 ELSE 0 END) as retards,
        SUM(CASE WHEN statut = 'absent_justifie' THEN 1 ELSE 0 END) as absents_justifies
      FROM presences
      WHERE eleve_id = ?
    `, [req.params.eleve_id]);
    
    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Erreur getElevePresenceStats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Statistiques de présence d'une classe
exports.getClassePresenceStats = async (req, res) => {
  try {
    const { date } = req.query;
    
    let query = `
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN statut = 'present' THEN 1 ELSE 0 END) as presents,
        SUM(CASE WHEN statut = 'absent' THEN 1 ELSE 0 END) as absents,
        SUM(CASE WHEN statut = 'retard' THEN 1 ELSE 0 END) as retards
      FROM presences
      WHERE classe_id = ?
    `;
    
    const params = [req.params.classe_id];
    
    if (date) {
      query += ' AND date = ?';
      params.push(date);
    }
    
    const [stats] = await db.query(query, params);
    
    res.json({
      success: true,
      stats: stats[0]
    });
  } catch (error) {
    console.error('Erreur getClassePresenceStats:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// ── Télécharger la liste simple des élèves d'une classe ──────
exports.downloadListeClasse = async (req, res) => {
  try {
    const { classe_id } = req.params;
    const { generateListeClassePDF } = require('../utils/generateListePDF');

    const [classes] = await db.query(
      `SELECT c.*, u.nom as enseignant_nom, u.prenom as enseignant_prenom,
              COUNT(e.id) as effectif
       FROM classes c
       LEFT JOIN users u ON c.enseignant_id = u.id
       LEFT JOIN eleves e ON c.id = e.classe_id
       WHERE c.id = ? GROUP BY c.id`,
      [classe_id]
    );
    if (classes.length === 0)
      return res.status(404).json({ success: false, message: 'Classe non trouvée' });

    const classe = classes[0];
    const [ecoles] = await db.query('SELECT * FROM ecole LIMIT 1');
    const ecole = ecoles[0] || {};

    const [eleves] = await db.query(
      `SELECT * FROM eleves WHERE classe_id = ? ORDER BY nom, prenom`,
      [classe_id]
    );

    const pdfBuffer = await generateListeClassePDF({ ecole, classe, eleves });

    const filename = `liste_${classe.nom.replace(/\s/g,'_')}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Erreur downloadListeClasse:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la génération' });
  }
};

// ── Télécharger la feuille d'appel avec statuts ──────────────
exports.downloadFeuilleAppel = async (req, res) => {
  try {
    const { classe_id, date } = req.params;
    const { generateFeuilleAppelPDF } = require('../utils/generateListePDF');

    const [classes] = await db.query(
      `SELECT c.*, u.nom as enseignant_nom, u.prenom as enseignant_prenom,
              COUNT(e.id) as effectif
       FROM classes c
       LEFT JOIN users u ON c.enseignant_id = u.id
       LEFT JOIN eleves e ON c.id = e.classe_id
       WHERE c.id = ? GROUP BY c.id`,
      [classe_id]
    );
    if (classes.length === 0)
      return res.status(404).json({ success: false, message: 'Classe non trouvée' });

    const classe = classes[0];
    const [ecoles] = await db.query('SELECT * FROM ecole LIMIT 1');
    const ecole = ecoles[0] || {};

    const [eleves] = await db.query(
      `SELECT * FROM eleves WHERE classe_id = ? ORDER BY nom, prenom`,
      [classe_id]
    );

    const [presencesRows] = await db.query(
      `SELECT eleve_id, statut FROM presences WHERE classe_id = ? AND date = ?`,
      [classe_id, date]
    );
    const presences = {};
    presencesRows.forEach(p => { presences[p.eleve_id] = p.statut; });

    const pdfBuffer = await generateFeuilleAppelPDF({ ecole, classe, eleves, presences, date });

    const filename = `appel_${classe.nom.replace(/\s/g,'_')}_${date}.pdf`;
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(pdfBuffer);
  } catch (error) {
    console.error('Erreur downloadFeuilleAppel:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de la génération' });
  }
};
