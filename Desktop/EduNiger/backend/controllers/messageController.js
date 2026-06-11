const db = require('../config/database');

// Liste des utilisateurs contactables
exports.getContacts = async (req, res) => {
  try {
    const moi  = req.user.id;
    const role = req.user.role;

    let whereRole = '';
    if (role === 'parent') whereRole = "AND u.role IN ('admin','enseignant')";

    const [users] = await db.query(
      `SELECT u.id, u.nom, u.prenom, u.role, u.email,
              (SELECT COUNT(*) FROM messages m
               JOIN conversations c ON m.conversation_id = c.id
               WHERE m.sender_id = u.id AND m.lu = 0
               AND (c.participant1 = ? OR c.participant2 = ?)
               AND (c.participant1 = u.id OR c.participant2 = u.id)) AS non_lus
       FROM users u
       WHERE u.id != ? AND u.tenant_id = ? ${whereRole}
       ORDER BY u.role, u.nom`,
      [moi, moi, moi, req.tenantId]
    );

    res.json({ success: true, contacts: users });
  } catch (error) {
    console.error('Erreur getContacts:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Obtenir ou créer une conversation
exports.getOrCreateConversation = async (req, res) => {
  try {
    const moi   = req.user.id;
    const autre = parseInt(req.params.user_id);

    if (moi === autre)
      return res.status(400).json({ success: false, message: 'Impossible de vous écrire à vous-même' });

    const [convs] = await db.query(
      `SELECT * FROM conversations
       WHERE tenant_id = ?
         AND ((participant1 = ? AND participant2 = ?) OR (participant1 = ? AND participant2 = ?))
       LIMIT 1`,
      [req.tenantId, moi, autre, autre, moi]
    );

    let conv;
    if (convs.length > 0) {
      conv = convs[0];
    } else {
      const [result] = await db.query(
        'INSERT INTO conversations (tenant_id, participant1, participant2) VALUES (?, ?, ?)',
        [req.tenantId, moi, autre]
      );
      conv = { id: result.insertId, participant1: moi, participant2: autre };
    }

    const [msgs] = await db.query(
      `SELECT m.*, u.nom, u.prenom, u.role
       FROM messages m JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ? AND m.tenant_id = ?
       ORDER BY m.created_at ASC`,
      [conv.id, req.tenantId]
    );

    await db.query(
      `UPDATE messages SET lu = 1
       WHERE conversation_id = ? AND tenant_id = ? AND sender_id != ? AND lu = 0`,
      [conv.id, req.tenantId, moi]
    );

    const [autres] = await db.query(
      'SELECT id, nom, prenom, role FROM users WHERE id = ? AND tenant_id = ?',
      [autre, req.tenantId]
    );

    res.json({ success: true, conversation: { ...conv, autre: autres[0] }, messages: msgs });
  } catch (error) {
    console.error('Erreur getOrCreateConversation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Envoyer un message
exports.sendMessage = async (req, res) => {
  try {
    const moi = req.user.id;
    const { conversation_id, contenu } = req.body;

    if (!contenu?.trim())
      return res.status(400).json({ success: false, message: 'Message vide' });

    const [convs] = await db.query(
      'SELECT * FROM conversations WHERE id = ? AND tenant_id = ? AND (participant1 = ? OR participant2 = ?)',
      [conversation_id, req.tenantId, moi, moi]
    );
    if (convs.length === 0)
      return res.status(403).json({ success: false, message: 'Accès refusé' });

    const [result] = await db.query(
      'INSERT INTO messages (tenant_id, conversation_id, sender_id, contenu) VALUES (?, ?, ?, ?)',
      [req.tenantId, conversation_id, moi, contenu.trim()]
    );

    const [msgs] = await db.query(
      `SELECT m.*, u.nom, u.prenom, u.role
       FROM messages m JOIN users u ON m.sender_id = u.id
       WHERE m.id = ?`,
      [result.insertId]
    );

    res.json({ success: true, message: msgs[0] });
  } catch (error) {
    console.error('Erreur sendMessage:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Nombre total de messages non lus
exports.getNonLus = async (req, res) => {
  try {
    const moi = req.user.id;
    const [result] = await db.query(
      `SELECT COUNT(*) AS total FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE m.sender_id != ? AND m.lu = 0 AND m.tenant_id = ?
       AND (c.participant1 = ? OR c.participant2 = ?)`,
      [moi, req.tenantId, moi, moi]
    );
    res.json({ success: true, non_lus: result[0].total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Liste des conversations avec dernier message
exports.getConversations = async (req, res) => {
  try {
    const moi = req.user.id;
    const [convs] = await db.query(
      `SELECT c.*,
        CASE WHEN c.participant1 = ? THEN c.participant2 ELSE c.participant1 END AS autre_id,
        u.nom AS autre_nom, u.prenom AS autre_prenom, u.role AS autre_role,
        (SELECT contenu FROM messages WHERE conversation_id = c.id AND tenant_id = ? ORDER BY created_at DESC LIMIT 1) AS dernier_msg,
        (SELECT created_at FROM messages WHERE conversation_id = c.id AND tenant_id = ? ORDER BY created_at DESC LIMIT 1) AS dernier_msg_at,
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND tenant_id = ? AND sender_id != ? AND lu = 0) AS non_lus
       FROM conversations c
       JOIN users u ON u.id = CASE WHEN c.participant1 = ? THEN c.participant2 ELSE c.participant1 END
       WHERE c.tenant_id = ? AND (c.participant1 = ? OR c.participant2 = ?)
       HAVING dernier_msg IS NOT NULL
       ORDER BY dernier_msg_at DESC`,
      [moi, req.tenantId, req.tenantId, req.tenantId, moi, moi, req.tenantId, moi, moi]
    );
    res.json({ success: true, conversations: convs });
  } catch (error) {
    console.error('Erreur getConversations:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};