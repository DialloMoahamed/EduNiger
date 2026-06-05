const db = require('../config/database');

const JOURS_ORDRE = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];

// ── GET emploi du temps d'une classe ─────────────────────────
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
      WHERE e.classe_id = ?
      ORDER BY FIELD(e.jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'), e.heure_debut
    `, [classe_id]);

    res.json({ success: true, emploi_du_temps: rows });
  } catch (error) {
    console.error('Erreur getByClasse EDT:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── GET emploi du temps pour le parent (via eleve_id) ────────
exports.getForParent = async (req, res) => {
  try {
    const parent_id = req.user.id;
    const { eleve_id } = req.query;

    // Vérifier que l'élève appartient au parent
    const [check] = await db.query(
      'SELECT id, classe_id FROM eleves WHERE id = ? AND parent_id = ?',
      [eleve_id, parent_id]
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
      WHERE e.classe_id = ?
      ORDER BY FIELD(e.jour, 'Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi'), e.heure_debut
    `, [classe_id]);

    res.json({ success: true, emploi_du_temps: rows, classe_id });
  } catch (error) {
    console.error('Erreur getForParent EDT:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── POST créer un créneau ─────────────────────────────────────
exports.create = async (req, res) => {
  try {
    const { classe_id, matiere_id, enseignant_id, jour, heure_debut, heure_fin, salle } = req.body;

    if (!classe_id || !matiere_id || !jour || !heure_debut || !heure_fin)
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });

    // Vérifier chevauchement
    const [overlap] = await db.query(`
      SELECT id FROM emploi_du_temps
      WHERE classe_id = ? AND jour = ?
        AND NOT (heure_fin <= ? OR heure_debut >= ?)
    `, [classe_id, jour, heure_debut, heure_fin]);

    if (overlap.length > 0)
      return res.status(400).json({ success: false, message: 'Créneau en conflit avec un cours existant' });

    const [result] = await db.query(`
      INSERT INTO emploi_du_temps (classe_id, matiere_id, enseignant_id, jour, heure_debut, heure_fin, salle, created_by)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [classe_id, matiere_id, enseignant_id || null, jour, heure_debut, heure_fin, salle || null, req.user.id]);

    res.json({ success: true, message: 'Créneau ajouté', id: result.insertId });
  } catch (error) {
    console.error('Erreur create EDT:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── PUT modifier un créneau ───────────────────────────────────
exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { matiere_id, enseignant_id, jour, heure_debut, heure_fin, salle } = req.body;

    await db.query(`
      UPDATE emploi_du_temps
      SET matiere_id = ?, enseignant_id = ?, jour = ?, heure_debut = ?, heure_fin = ?, salle = ?
      WHERE id = ?
    `, [matiere_id, enseignant_id || null, jour, heure_debut, heure_fin, salle || null, id]);

    res.json({ success: true, message: 'Créneau mis à jour' });
  } catch (error) {
    console.error('Erreur update EDT:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── DELETE supprimer un créneau ───────────────────────────────
exports.remove = async (req, res) => {
  try {
    const { id } = req.params;
    await db.query('DELETE FROM emploi_du_temps WHERE id = ?', [id]);
    res.json({ success: true, message: 'Créneau supprimé' });
  } catch (error) {
    console.error('Erreur remove EDT:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
