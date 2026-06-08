const db         = require('../config/database');
const smsService = require('../utils/smsService');

exports.getNotifications = async (req, res) => {
  try {
    const { type, statut, eleve_id, limit = 50, offset = 0 } = req.query;
    let query = `
      SELECT n.*, e.nom AS eleve_nom, e.prenom AS eleve_prenom, e.matricule
      FROM notifications n
      LEFT JOIN eleves e ON n.eleve_id = e.id
      WHERE 1=1
    `;
    const params = [];
    if (type)     { query += ' AND n.type = ?';     params.push(type); }
    if (statut)   { query += ' AND n.statut = ?';   params.push(statut); }
    if (eleve_id) { query += ' AND n.eleve_id = ?'; params.push(eleve_id); }
    query += ' ORDER BY n.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));
    const [notifications] = await db.query(query, params);

    let countQuery = 'SELECT COUNT(*) AS total FROM notifications WHERE 1=1';
    const countParams = [];
    if (type)     { countQuery += ' AND type = ?';     countParams.push(type); }
    if (statut)   { countQuery += ' AND statut = ?';   countParams.push(statut); }
    if (eleve_id) { countQuery += ' AND eleve_id = ?'; countParams.push(eleve_id); }
    const [[{ total }]] = await db.query(countQuery, countParams);

    res.json({ success: true, notifications, total });
  } catch (err) {
    console.error('getNotifications:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const [[stats]] = await db.query(`
      SELECT
        COUNT(*)                     AS total,
        SUM(statut = 'envoye')       AS envoyes,
        SUM(statut = 'en_attente')   AS en_attente,
        SUM(statut = 'echec')        AS echecs,
        SUM(type = 'bulletin')       AS bulletins,
        SUM(type = 'notes_saisies')  AS notes_saisies,
        SUM(type = 'retard')         AS retards,
        SUM(type = 'absence')        AS absences
      FROM notifications
    `);
    res.json({ success: true, stats });
  } catch (err) {
    console.error('getStats:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.envoyerSmsBulletin = async (req, res) => {
  try {
    const { eleve_id, periode } = req.body;
    if (!eleve_id || !periode)
      return res.status(400).json({ success: false, message: 'eleve_id et periode requis' });

    const [eleves] = await db.query(
      `SELECT e.*, c.nom AS classe_nom FROM eleves e
       JOIN classes c ON e.classe_id = c.id WHERE e.id = ?`, [eleve_id]
    );
    if (!eleves.length)
      return res.status(404).json({ success: false, message: 'Élève non trouvé' });
    const eleve = eleves[0];
    if (!eleve.telephone_parent)
      return res.status(400).json({ success: false, message: 'Cet élève n\'a pas de numéro parent enregistré' });

    const [notes] = await db.query(
      `SELECT n.note, n.note_sur, m.coefficient
       FROM notes n JOIN matieres m ON n.matiere_id = m.id
       WHERE n.eleve_id = ? AND n.periode = ?`, [eleve_id, periode]
    );
    if (!notes.length)
      return res.status(400).json({ success: false, message: 'Aucune note trouvée pour cette période' });

    let totalPts = 0, totalCoef = 0;
    notes.forEach(n => {
      const v = (n.note / n.note_sur) * 20;
      totalPts  += v * n.coefficient;
      totalCoef += n.coefficient;
    });
    const moyenne_generale = totalCoef > 0 ? (totalPts / totalCoef).toFixed(2) : '0.00';

    const result = await smsService.smsBulletinDisponible({ eleve, moyenne_generale, periode });
    res.json({ success: true, message: 'SMS bulletin envoyé', result });
  } catch (err) {
    console.error('envoyerSmsBulletin:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.envoyerSmsNotesClasse = async (req, res) => {
  try {
    const { classe_id, periode } = req.body;
    if (!classe_id || !periode)
      return res.status(400).json({ success: false, message: 'classe_id et periode requis' });

    const [eleves] = await db.query('SELECT * FROM eleves WHERE classe_id = ?', [classe_id]);
    if (!eleves.length)
      return res.status(404).json({ success: false, message: 'Aucun élève dans cette classe' });

    let envoyes = 0, ignores = 0;
    for (const eleve of eleves) {
      if (!eleve.telephone_parent) { ignores++; continue; }
      const [[{ nb }]] = await db.query(
        `SELECT COUNT(DISTINCT matiere_id) AS nb FROM notes WHERE eleve_id = ? AND periode = ?`,
        [eleve.id, periode]
      );
      if (nb === 0) { ignores++; continue; }
      await smsService.smsNotesSaisies({ eleve, periode, nb_matieres: nb });
      envoyes++;
    }
    res.json({ success: true, message: `SMS envoyés : ${envoyes} parent(s) notifié(s), ${ignores} ignoré(s)`, envoyes, ignores });
  } catch (err) {
    console.error('envoyerSmsNotesClasse:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.envoyerSmsRetard = async (req, res) => {
  try {
    const { eleve_id, date, matiere, creneau } = req.body;
    if (!eleve_id || !date)
      return res.status(400).json({ success: false, message: 'eleve_id et date requis' });

    const [eleves] = await db.query('SELECT * FROM eleves WHERE id = ?', [eleve_id]);
    if (!eleves.length)
      return res.status(404).json({ success: false, message: 'Élève non trouvé' });
    const eleve = eleves[0];
    if (!eleve.telephone_parent)
      return res.status(400).json({ success: false, message: 'Pas de numéro parent enregistré' });

    const result = await smsService.smsRetard({ eleve, date, matiere, creneau });
    res.json({ success: true, message: 'SMS retard envoyé', result });
  } catch (err) {
    console.error('envoyerSmsRetard:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.renvoyerNotification = async (req, res) => {
  try {
    const [rows] = await db.query('SELECT * FROM notifications WHERE id = ?', [req.params.id]);
    if (!rows.length)
      return res.status(404).json({ success: false, message: 'Notification non trouvée' });
    const notif = rows[0];
    const envoye = await smsService.envoyerSMS({
      telephone: notif.telephone, message: notif.message, type: notif.type, eleve_id: notif.eleve_id,
    });
    res.json({ success: true, message: 'Notification renvoyée', envoye });
  } catch (err) {
    console.error('renvoyerNotification:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

exports.deleteNotification = async (req, res) => {
  try {
    await db.query('DELETE FROM notifications WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Notification supprimée' });
  } catch (err) {
    console.error('deleteNotification:', err);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};