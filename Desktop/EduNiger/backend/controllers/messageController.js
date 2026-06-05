const db = require('../config/database');

// ── Liste des utilisateurs contactables ─────────────────────
exports.getContacts = async (req, res) => {
  try {
    const moi = req.user.id;
    const role = req.user.role;

    // Un parent ne peut contacter que les enseignants et admins
    // Un enseignant peut contacter admins, autres enseignants et parents
    // Un admin peut contacter tout le monde
    let whereRole = '';
    if (role === 'parent') {
      whereRole = "AND u.role IN ('admin','enseignant')";
    }

    const [users] = await db.query(
      `SELECT u.id, u.nom, u.prenom, u.role, u.email,
              -- Nombre de messages non lus de cet utilisateur vers moi
              (SELECT COUNT(*) FROM messages m
               JOIN conversations c ON m.conversation_id = c.id
               WHERE m.sender_id = u.id AND m.lu = 0
               AND (c.participant1 = ? OR c.participant2 = ?)
               AND (c.participant1 = u.id OR c.participant2 = u.id)) AS non_lus
       FROM users u
       WHERE u.id != ? ${whereRole}
       ORDER BY u.role, u.nom`,
      [moi, moi, moi]
    );

    res.json({ success: true, contacts: users });
  } catch (error) {
    console.error('Erreur getContacts:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Obtenir ou créer une conversation ────────────────────────
exports.getOrCreateConversation = async (req, res) => {
  try {
    const moi  = req.user.id;
    const autre = parseInt(req.params.user_id);

    if (moi === autre)
      return res.status(400).json({ success: false, message: 'Impossible de vous écrire à vous-même' });

    // Chercher la conversation existante (dans les 2 sens)
    const [convs] = await db.query(
      `SELECT * FROM conversations
       WHERE (participant1 = ? AND participant2 = ?)
          OR (participant1 = ? AND participant2 = ?)
       LIMIT 1`,
      [moi, autre, autre, moi]
    );

    let conv;
    if (convs.length > 0) {
      conv = convs[0];
    } else {
      // Créer la conversation
      const [result] = await db.query(
        'INSERT INTO conversations (participant1, participant2) VALUES (?, ?)',
        [moi, autre]
      );
      conv = { id: result.insertId, participant1: moi, participant2: autre };
    }

    // Charger les messages
    const [msgs] = await db.query(
      `SELECT m.*, u.nom, u.prenom, u.role
       FROM messages m
       JOIN users u ON m.sender_id = u.id
       WHERE m.conversation_id = ?
       ORDER BY m.created_at ASC`,
      [conv.id]
    );

    // Marquer les messages reçus comme lus
    await db.query(
      `UPDATE messages SET lu = 1
       WHERE conversation_id = ? AND sender_id != ? AND lu = 0`,
      [conv.id, moi]
    );

    // Infos de l'autre participant
    const [autres] = await db.query(
      'SELECT id, nom, prenom, role FROM users WHERE id = ?',
      [autre]
    );

    res.json({
      success: true,
      conversation: { ...conv, autre: autres[0] },
      messages: msgs,
    });
  } catch (error) {
    console.error('Erreur getOrCreateConversation:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Envoyer un message ───────────────────────────────────────
exports.sendMessage = async (req, res) => {
  try {
    const moi     = req.user.id;
    const { conversation_id, contenu } = req.body;

    if (!contenu?.trim())
      return res.status(400).json({ success: false, message: 'Message vide' });

    // Vérifier que l'utilisateur est bien participant
    const [convs] = await db.query(
      'SELECT * FROM conversations WHERE id = ? AND (participant1 = ? OR participant2 = ?)',
      [conversation_id, moi, moi]
    );
    if (convs.length === 0)
      return res.status(403).json({ success: false, message: 'Accès refusé' });

    const [result] = await db.query(
      'INSERT INTO messages (conversation_id, sender_id, contenu) VALUES (?, ?, ?)',
      [conversation_id, moi, contenu.trim()]
    );

    // Récupérer le message avec infos sender
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

// ── Nombre total de messages non lus ─────────────────────────
exports.getNonLus = async (req, res) => {
  try {
    const moi = req.user.id;
    const [result] = await db.query(
      `SELECT COUNT(*) AS total FROM messages m
       JOIN conversations c ON m.conversation_id = c.id
       WHERE m.sender_id != ? AND m.lu = 0
       AND (c.participant1 = ? OR c.participant2 = ?)`,
      [moi, moi, moi]
    );
    res.json({ success: true, non_lus: result[0].total });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Liste des conversations avec dernier message ──────────────
exports.getConversations = async (req, res) => {
  try {
    const moi = req.user.id;
    const [convs] = await db.query(
      `SELECT c.*,
        -- Autre participant
        CASE WHEN c.participant1 = ? THEN c.participant2 ELSE c.participant1 END AS autre_id,
        u.nom AS autre_nom, u.prenom AS autre_prenom, u.role AS autre_role,
        -- Dernier message
        (SELECT contenu FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS dernier_msg,
        (SELECT created_at FROM messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) AS dernier_msg_at,
        -- Non lus
        (SELECT COUNT(*) FROM messages WHERE conversation_id = c.id AND sender_id != ? AND lu = 0) AS non_lus
       FROM conversations c
       JOIN users u ON u.id = CASE WHEN c.participant1 = ? THEN c.participant2 ELSE c.participant1 END
       WHERE c.participant1 = ? OR c.participant2 = ?
       HAVING dernier_msg IS NOT NULL
       ORDER BY dernier_msg_at DESC`,
      [moi, moi, moi, moi, moi]
    );
    res.json({ success: true, conversations: convs });
  } catch (error) {
    console.error('Erreur getConversations:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
