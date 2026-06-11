const db     = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// ── Login super admin ─────────────────────────────────────────
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });

    const [rows] = await db.query(
      'SELECT * FROM super_admins WHERE email = ? AND is_active = 1',
      [email]
    );
    if (!rows.length)
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    const admin = rows[0];
    const valid = await bcrypt.compare(password, admin.password);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Identifiants incorrects' });

    await db.query('UPDATE super_admins SET last_login = NOW() WHERE id = ?', [admin.id]);

    const token = jwt.sign(
      { id: admin.id, email: admin.email, role: 'superadmin' },
      process.env.JWT_SECRET,
      { expiresIn: '12h' }
    );

    delete admin.password;
    res.json({ success: true, token, admin });
  } catch (err) {
    console.error('Erreur login superadmin:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Stats globales ────────────────────────────────────────────
exports.getStats = async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT
        COUNT(*)                                                    AS total,
        SUM(s.is_active = 1)                                        AS actives,
        SUM(DATEDIFF(p.period_end, CURDATE()) BETWEEN 0 AND 30)     AS expirent_bientot,
        SUM(p.period_end < CURDATE())                               AS expires
      FROM schools s
      LEFT JOIN payments p
        ON p.school_id = s.id AND p.type = 'renewal' AND p.status = 'confirmed'
        AND p.period_end = (
          SELECT MAX(period_end) FROM payments
          WHERE school_id = s.id AND type = 'renewal' AND status = 'confirmed'
        )
    `);
    res.json({ success: true, stats });
  } catch (err) {
    console.error('Erreur getStats superadmin:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Liste des écoles avec statut abonnement ───────────────────
exports.getSchools = async (req, res) => {
  try {
    const [schools] = await db.query('SELECT * FROM v_schools_subscription ORDER BY jours_restants ASC');
    res.json({ success: true, schools });
  } catch (err) {
    console.error('Erreur getSchools superadmin:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Onboarder une nouvelle école ─────────────────────────────
exports.onboardSchool = async (req, res) => {
  try {
    const { name, slug, email, phone, city, payment_method, install_ref, annual_ref } = req.body;

    if (!name || !slug || !install_ref || !annual_ref)
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });

    // Appeler la procédure stockée onboard_school
    await db.query(
      'CALL onboard_school(?, ?, ?, ?, ?, ?, ?, ?, ?, @school_id)',
      [name, slug, email || null, phone || null, city || null,
       payment_method || 'nita', install_ref, annual_ref, req.admin.id]
    );

    const [[{ school_id }]] = await db.query('SELECT @school_id AS school_id');

    res.json({ success: true, message: 'École créée et activée avec succès', school_id });
  } catch (err) {
    console.error('Erreur onboardSchool:', err);
    const msg = err.sqlMessage || err.message || 'Erreur serveur';
    res.status(400).json({ success: false, message: msg });
  }
};

// ── Renouveler un abonnement ──────────────────────────────────
exports.renewSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_method, payment_ref } = req.body;

    if (!payment_ref)
      return res.status(400).json({ success: false, message: 'Référence de paiement requise' });

    const [[pricing]] = await db.query(
      'SELECT annual_fee, currency FROM pricing WHERE is_current = 1 LIMIT 1'
    );

    // Trouver la dernière date de fin pour calculer la nouvelle période
    const [[last]] = await db.query(
      `SELECT MAX(period_end) AS last_end FROM payments
       WHERE school_id = ? AND type = 'renewal' AND status = 'confirmed'`,
      [id]
    );

    // Si déjà expiré → repartir d'aujourd'hui, sinon prolonger depuis la fin actuelle
    const startDate = last.last_end && new Date(last.last_end) > new Date()
      ? last.last_end
      : new Date().toISOString().split('T')[0];

    await db.query(
      `INSERT INTO payments (school_id, type, amount, currency, payment_method, payment_ref, status, paid_at, period_start, period_end, confirmed_by)
       VALUES (?, 'renewal', ?, ?, ?, ?, 'confirmed', NOW(), ?, DATE_ADD(?, INTERVAL 1 YEAR), ?)`,
      [id, pricing.annual_fee, pricing.currency, payment_method || 'nita', payment_ref, startDate, startDate, req.admin.id]
    );

    // Réactiver l'école si elle était suspendue
    await db.query('UPDATE schools SET is_active = 1 WHERE id = ?', [id]);

    res.json({ success: true, message: 'Abonnement renouvelé avec succès' });
  } catch (err) {
    console.error('Erreur renewSchool:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Activer / Suspendre une école ─────────────────────────────
exports.toggleSchool = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    await db.query('UPDATE schools SET is_active = ? WHERE id = ?', [is_active, id]);
    res.json({ success: true, message: is_active ? 'École activée' : 'École suspendue' });
  } catch (err) {
    console.error('Erreur toggleSchool:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Tarification en vigueur ───────────────────────────────────
exports.getPricing = async (req, res) => {
  try {
    const [[pricing]] = await db.query('SELECT * FROM pricing WHERE is_current = 1 LIMIT 1');
    res.json({ success: true, pricing });
  } catch (err) {
    console.error('Erreur getPricing:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Modifier la tarification ──────────────────────────────────
exports.updatePricing = async (req, res) => {
  try {
    const { installation_fee, annual_fee, note } = req.body;

    // Désactiver l'ancien tarif
    await db.query('UPDATE pricing SET is_current = 0');

    // Insérer le nouveau
    await db.query(
      'INSERT INTO pricing (installation_fee, annual_fee, currency, is_current, note) VALUES (?, ?, ?, 1, ?)',
      [installation_fee, annual_fee, 'FCFA', note || null]
    );

    res.json({ success: true, message: 'Tarification mise à jour' });
  } catch (err) {
    console.error('Erreur updatePricing:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};