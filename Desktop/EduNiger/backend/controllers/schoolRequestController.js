const db = require('../config/database');

// ── Soumettre une demande d'inscription (public, sans auth) ──
exports.submitRequest = async (req, res) => {
  try {
    const { name, slug_souhaite, contact_nom, contact_prenom, email, phone, city, type_ecole, nb_eleves, message } = req.body;

    if (!name || !contact_nom || !email)
      return res.status(400).json({ success: false, message: 'Nom de l\'école, responsable et email sont obligatoires.' });

    // Vérifier doublon email
    const [exist] = await db.query(
      'SELECT id FROM school_requests WHERE email = ? AND status IN (\'pending\',\'contacted\') LIMIT 1',
      [email]
    );
    if (exist.length)
      return res.status(409).json({ success: false, message: 'Une demande avec cet email est déjà en cours de traitement.' });

    const [result] = await db.query(
      `INSERT INTO school_requests (name, slug_souhaite, contact_nom, contact_prenom, email, phone, city, type_ecole, nb_eleves, message)
       VALUES (?,?,?,?,?,?,?,?,?,?)`,
      [name, slug_souhaite || null, contact_nom, contact_prenom || null, email,
       phone || null, city || null, type_ecole || null, nb_eleves || null, message || null]
    );

    res.status(201).json({ success: true, message: 'Demande envoyée avec succès ! Nous vous contacterons sous 48h.', id: result.insertId });
  } catch (err) {
    console.error('Erreur submitRequest:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Lister toutes les demandes (super admin) ─────────────────
exports.listRequests = async (req, res) => {
  try {
    const { status } = req.query;
    let query = 'SELECT * FROM school_requests';
    const params = [];
    if (status) { query += ' WHERE status = ?'; params.push(status); }
    query += ' ORDER BY created_at DESC';
    const [rows] = await db.query(query, params);
    res.json({ success: true, requests: rows });
  } catch (err) {
    console.error('Erreur listRequests:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Compter les demandes en attente (pour badge superadmin) ──
exports.countPending = async (req, res) => {
  try {
    const [[{ count }]] = await db.query(
      'SELECT COUNT(*) AS count FROM school_requests WHERE status = \'pending\''
    );
    res.json({ success: true, count });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Mettre à jour le statut d'une demande ────────────────────
exports.updateRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, notes_admin } = req.body;

    const allowed = ['pending', 'contacted', 'approved', 'rejected'];
    if (!allowed.includes(status))
      return res.status(400).json({ success: false, message: 'Statut invalide' });

    await db.query(
      `UPDATE school_requests
       SET status = ?, notes_admin = ?, processed_by = ?, processed_at = NOW()
       WHERE id = ?`,
      [status, notes_admin || null, req.admin.id, id]
    );

    res.json({ success: true, message: 'Demande mise à jour' });
  } catch (err) {
    console.error('Erreur updateRequest:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Approuver et onboarder directement depuis une demande ────
exports.approveAndOnboard = async (req, res) => {
  try {
    const { id } = req.params;
    const { slug, payment_method, install_ref, annual_ref } = req.body;

    if (!slug || !install_ref || !annual_ref)
      return res.status(400).json({ success: false, message: 'Slug et références de paiement requis' });

    // Récupérer la demande
    const [[demand]] = await db.query('SELECT * FROM school_requests WHERE id = ?', [id]);
    if (!demand)
      return res.status(404).json({ success: false, message: 'Demande introuvable' });

    // Créer l'école via la procédure onboard_school
    await db.query(
      'CALL onboard_school(?, ?, ?, ?, ?, ?, ?, ?, ?, @school_id)',
      [demand.name, slug, demand.email, demand.phone, demand.city,
       payment_method || 'nita', install_ref, annual_ref, req.admin.id]
    );
    const [[{ school_id }]] = await db.query('SELECT @school_id AS school_id');

    // Lier la demande à l'école créée
    await db.query(
      `UPDATE school_requests SET status='approved', processed_by=?, processed_at=NOW(), school_id=? WHERE id=?`,
      [req.admin.id, school_id, id]
    );

    res.json({ success: true, message: 'École créée et activée depuis la demande', school_id });
  } catch (err) {
    console.error('Erreur approveAndOnboard:', err);
    const msg = err.sqlMessage || err.message || 'Erreur serveur';
    res.status(400).json({ success: false, message: msg });
  }
};
