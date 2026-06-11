const db = require('../config/database');

// Obtenir le profil de l'école (depuis la table schools SaaS)
exports.getEcole = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM schools WHERE id = ? LIMIT 1',
      [req.tenantId]
    );
    if (rows.length === 0)
      return res.status(404).json({ success: false, message: 'Profil école non trouvé' });

    res.json({ success: true, ecole: rows[0] });
  } catch (error) {
    console.error('Erreur getEcole:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Mettre à jour le profil de l'école (dans la table schools)
exports.updateEcole = async (req, res) => {
  try {
    const {
      nom, type_ecole, region, departement, inspection,
      adresse, telephone, email, boite_postale,
      devise, annee_scolaire, couleur_primaire
    } = req.body;

    await db.query(
      `UPDATE schools SET
        name = ?,
        config = JSON_SET(
          COALESCE(config, '{}'),
          '$.type_ecole',    ?,
          '$.region',        ?,
          '$.departement',   ?,
          '$.inspection',    ?,
          '$.boite_postale', ?,
          '$.devise',        ?,
          '$.annee_scolaire',?
        ),
        address       = ?,
        phone         = ?,
        email         = ?,
        primary_color = ?
       WHERE id = ?`,
      [
        nom,
        type_ecole, region, departement, inspection, boite_postale, devise, annee_scolaire,
        adresse, telephone, email, couleur_primaire || '#3B82F6',
        req.tenantId
      ]
    );

    const [updated] = await db.query('SELECT * FROM schools WHERE id = ?', [req.tenantId]);
    res.json({ success: true, message: 'Profil école mis à jour', ecole: updated[0] });
  } catch (error) {
    console.error('Erreur updateEcole:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};