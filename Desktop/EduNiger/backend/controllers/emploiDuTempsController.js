const db = require('../config/database');

// GET emploi du temps d'une classe
exports.getByClasse = async (req, res) => {
  try {
    const { classe_id } = req.params;

    const [rows] = await db.query(`
      SELECT e.*,
             m.nom   AS matiere_nom,
             m.code  AS matiere_code,
             u.nom   AS enseignant_nom,
             u.prenom AS enseignant_prenom
      FROM emploi_du_temps e
      JOIN matieres m ON e.matiere_id = m.id
      LEFT JOIN users u ON e.enseignant_id = u.id
      WHERE e.classe_id = ? AND e.tenant_id = ?
      ORDER BY FIELD(e.jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'), e.heure_debut
    `, [classe_id, req.tenantId]);

    res.json({ success: true, emploi_du_temps: rows });
  } catch (error) {
    console.error('Erreur getByClasse EDT:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET emploi du temps pour le parent (via eleve_id)
exports.getForParent = async (req, res) => {
  try {
    const parent_id = req.user.id;
    const { eleve_id } = req.query;

    const [check] = await db.query(
      'SELECT id, classe_id FROM eleves WHERE id = ? AND parent_id = ? AND tenant_id = ?',
      [eleve_id, parent_id, req.tenantId]
    );
    if (check.length === 0)
      return res.status(403).json({ success: false, message: 'Accès refusé' });

    const classe_id = check[0].classe_id;

    const [rows] = await db.query(`
      SELECT e.*,
             m.nom    AS matiere_nom,
             m.code   AS matiere_code,
             u.nom    AS enseignant_nom,
             u.prenom AS enseignant_prenom
      FROM emploi_du_temps e
      JOIN matieres m ON e.matiere_id = m.id
      LEFT JOIN users u ON e.enseignant_id = u.id
      WHERE e.classe_id = ? AND e.tenant_id = ?
      ORDER BY FIELD(e.jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'), e.heure_debut
    `, [classe_id, req.tenantId]);

    res.json({ success: true, emploi_du_temps: rows, classe_id });
  } catch (error) {
    console.error('Erreur getForParent EDT:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// POST créer un créneau
exports.create = async (req, res) => {
  try {
    const { classe_id, matiere_id, enseignant_id, jour, heure_debut, heure_fin, salle } = req.body;

    if (!classe_id || !matiere_id || !jour || !heure_debut || !heure_fin)
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });

    const [overlap] = await db.query(`
      SELECT id FROM emploi_du_temps
      WHERE classe_id = ? AND jour = ? AND tenant_id = ?
        AND NOT (heure_fin <= ? OR heure_debut >= ?)
    `, [classe_id, jour, req.tenantId, heure_debut, heure_fin]);

    if (overlap.length > 0)
      return res.status(400).json({ success: false, message: 'Créneau en conflit avec un cours existant' });

    const [result] = await db.query(`
      INSERT INTO emploi_du_temps (tenant_id, classe_id, matiere_id, enseignant_id, jour, heure_debut, heure_fin, salle, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `, [req.tenantId, classe_id, matiere_id, enseignant_id || null, jour, heure_debut, heure_fin, salle || null, req.user.id]);

    res.json({ success: true, message: 'Créneau ajouté', id: result.insertId });
  } catch (error) {
    console.error('Erreur create EDT:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// PUT modifier un créneau
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { matiere_id, enseignant_id, jour, heure_debut, heure_fin, salle } = req.body;

    await db.query(`
      UPDATE emploi_du_temps
      SET matiere_id = ?, enseignant_id = ?, jour = ?, heure_debut = ?, heure_fin = ?, salle = ?
      WHERE id = ? AND tenant_id = ?
    `, [matiere_id, enseignant_id || null, jour, heure_debut, heure_fin, salle || null, id, req.tenantId]);

    res.json({ success: true, message: 'Créneau mis à jour' });
  } catch (error) {
    console.error('Erreur update EDT:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// DELETE supprimer un créneau
exports.remove = async (req, res) => {
  try {
    await db.query(
      'DELETE FROM emploi_du_temps WHERE id = ? AND tenant_id = ?',
      [req.params.id, req.tenantId]
    );
    res.json({ success: true, message: 'Créneau supprimé' });
  } catch (error) {
    console.error('Erreur remove EDT:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET emploi du temps de l'enseignant connecté
exports.getForEnseignant = async (req, res) => {
  try {
    const enseignant_id = req.user.id;

    const [rows] = await db.query(`
      SELECT e.*,
             m.nom    AS matiere_nom,
             m.code   AS matiere_code,
             c.nom    AS classe_nom,
             c.niveau AS classe_niveau,
             u.nom    AS enseignant_nom,
             u.prenom AS enseignant_prenom
      FROM emploi_du_temps e
      JOIN matieres m ON e.matiere_id  = m.id
      JOIN classes  c ON e.classe_id   = c.id
      LEFT JOIN users u ON e.enseignant_id = u.id
      WHERE e.enseignant_id = ? AND e.tenant_id = ?
      ORDER BY FIELD(e.jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'), e.heure_debut
    `, [enseignant_id, req.tenantId]);

    const classesMap = {};
    rows.forEach(r => {
      if (!classesMap[r.classe_id])
        classesMap[r.classe_id] = { id: r.classe_id, nom: r.classe_nom, niveau: r.classe_niveau };
    });

    res.json({ success: true, emploi_du_temps: rows, classes: Object.values(classesMap) });
  } catch (error) {
    console.error('Erreur getForEnseignant EDT:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// GET liste de tous les enseignants
exports.getListeEnseignants = async (req, res) => {
  try {
    const [rows] = await db.query(`
      SELECT
        u.id, u.nom, u.prenom, u.email, u.telephone, u.photo, u.role,
        GROUP_CONCAT(DISTINCT m.nom ORDER BY m.nom SEPARATOR ', ') AS matieres,
        GROUP_CONCAT(DISTINCT c.nom ORDER BY c.nom SEPARATOR ', ') AS classes
      FROM users u
      LEFT JOIN emploi_du_temps e ON e.enseignant_id = u.id AND e.tenant_id = ?
      LEFT JOIN matieres m ON e.matiere_id = m.id
      LEFT JOIN classes  c ON e.classe_id  = c.id
      WHERE u.role = 'enseignant' AND u.tenant_id = ?
      GROUP BY u.id
      ORDER BY u.nom, u.prenom
    `, [req.tenantId, req.tenantId]);

    res.json({ success: true, enseignants: rows });
  } catch (error) {
    console.error('Erreur getListeEnseignants:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};