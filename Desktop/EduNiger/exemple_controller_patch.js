// ============================================================
//  Exemple : comment adapter un controller existant
//  pour le multi-tenant
//
//  La seule modification : ajouter "AND tenant_id = ?"
//  dans chaque requête SQL, avec req.tenantId comme valeur.
// ============================================================


// ─────────────────────────────────────────
//  AVANT (mono-école)
// ─────────────────────────────────────────

// Lister tous les élèves
exports.getEleves = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM eleves');
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Créer un élève
exports.createEleve = async (req, res) => {
  const { nom, prenom, matricule, classe_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO eleves (nom, prenom, matricule, classe_id) VALUES (?, ?, ?, ?)',
      [nom, prenom, matricule, classe_id]
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};


// ─────────────────────────────────────────
//  APRÈS (multi-tenant) — 2 petits changements
// ─────────────────────────────────────────

// Lister les élèves DE CETTE ÉCOLE UNIQUEMENT
exports.getEleves = async (req, res) => {
  try {
    const [rows] = await db.query(
      'SELECT * FROM eleves WHERE tenant_id = ?',  // ✅ ajout
      [req.tenantId]                               // ✅ ajout
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// Créer un élève rattaché à CETTE ÉCOLE
exports.createEleve = async (req, res) => {
  const { nom, prenom, matricule, classe_id } = req.body;
  try {
    const [result] = await db.query(
      'INSERT INTO eleves (tenant_id, nom, prenom, matricule, classe_id) VALUES (?, ?, ?, ?, ?)', // ✅
      [req.tenantId, nom, prenom, matricule, classe_id]                                           // ✅
    );
    res.json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// ─────────────────────────────────────────
//  Règle générale à appliquer sur TOUS les controllers :
//
//  SELECT → ajouter  WHERE tenant_id = ?  +  [req.tenantId]
//  INSERT → ajouter  tenant_id  dans les colonnes  +  req.tenantId dans les valeurs
//  UPDATE → ajouter  AND tenant_id = ?  dans le WHERE
//  DELETE → ajouter  AND tenant_id = ?  dans le WHERE
// ─────────────────────────────────────────
