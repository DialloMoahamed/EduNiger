const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Connexion
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false, 
        message: 'Email et mot de passe requis' 
      });
    }

    const [users] = await db.query(
      'SELECT * FROM users WHERE email = ?', 
      [email]
    );

    if (users.length === 0) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants incorrects' 
      });
    }

    const user = users[0];
    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Identifiants incorrects' 
      });
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    delete user.password;

    res.json({
      success: true,
      message: 'Connexion réussie',
      token,
      user
    });
  } catch (error) {
    console.error('Erreur login:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Profil utilisateur
exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, nom, prenom, email, role, telephone, bio, photo, created_at FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    res.json({
      success: true,
      user: users[0]
    });
  } catch (error) {
    console.error('Erreur getProfile:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Changer le mot de passe
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword, currentPassword } = req.body;
    const oldPass = oldPassword || currentPassword;

    if (!oldPass || !newPassword) {
      return res.status(400).json({ 
        success: false, 
        message: 'Ancien et nouveau mot de passe requis' 
      });
    }

    const [users] = await db.query(
      'SELECT password FROM users WHERE id = ?',
      [req.user.id]
    );

    if (users.length === 0) {
      return res.status(404).json({ 
        success: false, 
        message: 'Utilisateur non trouvé' 
      });
    }

    const validPassword = await bcrypt.compare(oldPass, users[0].password);

    if (!validPassword) {
      return res.status(401).json({ 
        success: false, 
        message: 'Mot de passe actuel incorrect' 
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await db.query(
      'UPDATE users SET password = ? WHERE id = ?',
      [hashedPassword, req.user.id]
    );

    res.json({
      success: true,
      message: 'Mot de passe modifié avec succès'
    });
  } catch (error) {
    console.error('Erreur changePassword:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Erreur serveur' 
    });
  }
};

// Lister tous les utilisateurs (admin)
exports.getUsers = async (req, res) => {
  try {
    const [users] = await db.query(
      'SELECT id, nom, prenom, email, role, telephone, created_at FROM users ORDER BY nom, prenom'
    );
    res.json({ success: true, users });
  } catch (error) {
    console.error('Erreur getUsers:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Créer un utilisateur (admin)
exports.register = async (req, res) => {
  try {
    const { nom, prenom, email, password, role, telephone } = req.body;
    if (!nom || !prenom || !email || !password) {
      return res.status(400).json({ success: false, message: 'Champs obligatoires manquants' });
    }
    const [existing] = await db.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ success: false, message: 'Email déjà utilisé' });
    }
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await db.query(
      'INSERT INTO users (nom, prenom, email, password, role, telephone) VALUES (?, ?, ?, ?, ?, ?)',
      [nom, prenom, email, hashed, role || 'enseignant', telephone || null]
    );
    res.status(201).json({ success: true, message: 'Utilisateur créé', id: result.insertId });
  } catch (error) {
    console.error('Erreur register:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Modifier un utilisateur (admin)
exports.updateUser = async (req, res) => {
  try {
    const { nom, prenom, email, role, telephone, password } = req.body;
    const { id } = req.params;
    let query = 'UPDATE users SET nom=?, prenom=?, email=?, role=?, telephone=?';
    const params = [nom, prenom, email, role, telephone || null];
    if (password) {
      const hashed = await bcrypt.hash(password, 10);
      query += ', password=?';
      params.push(hashed);
    }
    query += ' WHERE id=?';
    params.push(id);
    await db.query(query, params);
    res.json({ success: true, message: 'Utilisateur modifié' });
  } catch (error) {
    console.error('Erreur updateUser:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Supprimer un utilisateur (admin)
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id == req.user.id) {
      return res.status(400).json({ success: false, message: 'Vous ne pouvez pas supprimer votre propre compte' });
    }
    await db.query('DELETE FROM users WHERE id = ?', [req.params.id]);
    res.json({ success: true, message: 'Utilisateur supprimé' });
  } catch (error) {
    console.error('Erreur deleteUser:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Mettre à jour son propre profil
exports.updateProfile = async (req, res) => {
  try {
    const { nom, prenom, telephone, bio } = req.body;
    await db.query(
      'UPDATE users SET nom=?, prenom=?, telephone=?, bio=? WHERE id=?',
      [nom, prenom, telephone || null, bio || null, req.user.id]
    );
    const [updated] = await db.query(
      'SELECT id, nom, prenom, email, role, telephone, bio, photo, created_at FROM users WHERE id=?',
      [req.user.id]
    );
    res.json({ success: true, message: 'Profil mis à jour', user: updated[0] });
  } catch (error) {
    console.error('Erreur updateProfile:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// Upload photo de profil (base64)
exports.uploadPhoto = async (req, res) => {
  try {
    const { photo } = req.body; // base64 string
    if (!photo) return res.status(400).json({ success: false, message: 'Photo manquante' });

    // Sauvegarder en base64 dans la DB (simple, pas besoin de stockage fichier)
    await db.query('UPDATE users SET photo=? WHERE id=?', [photo, req.user.id]);
    res.json({ success: true, message: 'Photo mise à jour', photo });
  } catch (error) {
    console.error('Erreur uploadPhoto:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ════════════════════════════════════════════════════════════
// MOT DE PASSE OUBLIÉ
// ════════════════════════════════════════════════════════════

// ── Étape 1 : demande de réinitialisation ──────────────────
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email) {
      return res.status(400).json({ success: false, message: 'Email requis' });
    }

    // Chercher l'utilisateur (réponse générique pour ne pas révéler si l'email existe)
    const [users] = await db.query('SELECT id, nom, prenom, email FROM users WHERE email = ?', [email]);
    if (users.length === 0) {
      return res.json({ success: true, message: 'Si cet email existe, un lien vous a été envoyé.' });
    }

    const user = users[0];

    // Générer un token sécurisé (64 octets = 128 chars hex)
    const crypto = require('crypto');
    const token = crypto.randomBytes(64).toString('hex');

    // Expiration dans 1 heure
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    // Supprimer les anciens tokens non utilisés pour cet utilisateur
    await db.query('DELETE FROM password_reset_tokens WHERE user_id = ? AND used = 0', [user.id]);

    // Sauvegarder le token
    await db.query(
      'INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
      [user.id, token, expiresAt]
    );

    // Construire le lien de réinitialisation
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;

    // Envoyer l'email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host:   process.env.MAIL_HOST,
      port:   parseInt(process.env.MAIL_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });

    await transporter.sendMail({
      from:    process.env.MAIL_FROM || 'EduNiger <noreply@eduniger.ne>',
      to:      user.email,
      subject: 'Réinitialisation de votre mot de passe — EduNiger',
      html: `
        <div style="font-family:sans-serif;max-width:520px;margin:auto;padding:32px;background:#f7f9fc;border-radius:12px">
          <div style="text-align:center;margin-bottom:24px">
            <span style="font-size:32px">📚</span>
            <h2 style="margin:8px 0;color:#0A5C36">EduNiger</h2>
          </div>
          <div style="background:#fff;border-radius:8px;padding:24px;border:1px solid #e2e8f0">
            <p style="margin:0 0 12px;color:#334155">Bonjour <strong>${user.prenom} ${user.nom}</strong>,</p>
            <p style="color:#64748b;line-height:1.6">Vous avez demandé la réinitialisation de votre mot de passe.<br>Cliquez sur le bouton ci-dessous — ce lien est valable <strong>1 heure</strong>.</p>
            <div style="text-align:center;margin:28px 0">
              <a href="${resetLink}" style="background:#0A5C36;color:#fff;padding:13px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:15px;display:inline-block">
                Réinitialiser mon mot de passe
              </a>
            </div>
            <p style="color:#94a3b8;font-size:12px;margin:0">Si vous n'avez pas fait cette demande, ignorez cet email. Votre mot de passe ne sera pas modifié.</p>
          </div>
          <p style="text-align:center;color:#94a3b8;font-size:11px;margin-top:16px">EduNiger — Système de Gestion Scolaire</p>
        </div>
      `,
    });

    res.json({ success: true, message: 'Si cet email existe, un lien vous a été envoyé.' });

  } catch (error) {
    console.error('Erreur forgotPassword:', error);
    res.status(500).json({ success: false, message: 'Erreur lors de l\'envoi de l\'email' });
  }
};

// ── Étape 2 : vérifier que le token est valide ─────────────
exports.verifyResetToken = async (req, res) => {
  try {
    const { token } = req.params;
    const [rows] = await db.query(
      `SELECT t.*, u.nom, u.prenom, u.email
       FROM password_reset_tokens t
       JOIN users u ON t.user_id = u.id
       WHERE t.token = ? AND t.used = 0 AND t.expires_at > NOW()`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Lien invalide ou expiré' });
    }

    res.json({ success: true, email: rows[0].email });
  } catch (error) {
    console.error('Erreur verifyResetToken:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Étape 3 : réinitialiser le mot de passe ────────────────
exports.resetPassword = async (req, res) => {
  try {
    const { token, password } = req.body;

    if (!token || !password) {
      return res.status(400).json({ success: false, message: 'Token et nouveau mot de passe requis' });
    }
    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Le mot de passe doit faire au moins 6 caractères' });
    }

    // Vérifier le token
    const [rows] = await db.query(
      `SELECT * FROM password_reset_tokens
       WHERE token = ? AND used = 0 AND expires_at > NOW()`,
      [token]
    );

    if (rows.length === 0) {
      return res.status(400).json({ success: false, message: 'Lien invalide ou expiré. Refaites la demande.' });
    }

    const resetRow = rows[0];

    // Hacher le nouveau mot de passe
    const hashedPassword = await bcrypt.hash(password, 10);

    // Mettre à jour le mot de passe
    await db.query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, resetRow.user_id]);

    // Marquer le token comme utilisé
    await db.query('UPDATE password_reset_tokens SET used = 1 WHERE id = ?', [resetRow.id]);

    res.json({ success: true, message: 'Mot de passe réinitialisé avec succès. Vous pouvez vous connecter.' });

  } catch (error) {
    console.error('Erreur resetPassword:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};
