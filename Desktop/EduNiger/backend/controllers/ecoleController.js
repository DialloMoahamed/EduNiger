const db = require('../config/database');

// Obtenir le profil de l'école
exports.getEcole = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM ecole LIMIT 1');
    if (rows.length === 0) {
      return res.status(404).json({ success: false, message: 'Profil école non trouvé' });
    }
    res.json({ success: true, ecole: rows[0] });
  } catch (error) {
    console.error('Erreur getEcole:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Mettre à jour le profil de l'école
exports.updateEcole = async (req, res) => {
  try {
    const {
      nom, type_ecole, region, departement, inspection,
      adresse, telephone, email, boite_postale,
      devise, annee_scolaire, couleur_primaire
    } = req.body;

    const [existing] = await db.query('SELECT id FROM ecole LIMIT 1');

    if (existing.length === 0) {
      await db.query(
        `INSERT INTO ecole (nom, type_ecole, region, departement, inspection,
          adresse, telephone, email, boite_postale, devise, annee_scolaire, couleur_primaire)
         VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
        [nom, type_ecole, region, departement, inspection,
         adresse, telephone, email, boite_postale, devise, annee_scolaire, couleur_primaire]
      );
    } else {
      await db.query(
        `UPDATE ecole SET
          nom=?, type_ecole=?, region=?, departement=?, inspection=?,
          adresse=?, telephone=?, email=?, boite_postale=?,
          devise=?, annee_scolaire=?, couleur_primaire=?
         WHERE id=?`,
        [nom, type_ecole, region, departement, inspection,
         adresse, telephone, email, boite_postale,
         devise, annee_scolaire, couleur_primaire, existing[0].id]
      );
    }

    const [updated] = await db.query('SELECT * FROM ecole LIMIT 1');
    res.json({ success: true, message: 'Profil école mis à jour', ecole: updated[0] });
  } catch (error) {
    console.error('Erreur updateEcole:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
