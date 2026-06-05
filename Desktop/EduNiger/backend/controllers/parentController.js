const db     = require('../config/database');
const bcrypt = require('bcryptjs');
const jwt    = require('jsonwebtoken');

// ── Connexion parent ──────────────────────────────────────────
exports.loginParent = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ success: false, message: 'Email et mot de passe requis' });

    const [users] = await db.query(
      "SELECT * FROM users WHERE email = ? AND role = 'parent'", [email]
    );
    if (users.length === 0)
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });

    const user = users[0];
    const valid = await bcrypt.compare(password, user.password);
    if (!valid)
      return res.status(401).json({ success: false, message: 'Email ou mot de passe incorrect' });

    // Récupérer les enfants liés à ce parent
    const [enfants] = await db.query(
      `SELECT e.id, e.nom, e.prenom, e.matricule, e.sexe,
              c.nom as classe_nom, c.niveau
       FROM eleves e
       LEFT JOIN classes c ON e.classe_id = c.id
       WHERE e.parent_id = ?`,
      [user.id]
    );

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, nom: user.nom, prenom: user.prenom },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || '7d' }
    );

    const { password: _, ...userSafe } = user;
    res.json({ success: true, token, user: userSafe, enfants });
  } catch (error) {
    console.error('Erreur loginParent:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Créer un compte parent ────────────────────────────────────
exports.createParentAccount = async (req, res) => {
  try {
    const { nom, prenom, email, telephone, eleve_id } = req.body;

    console.log('📝 Création compte parent:', { nom, prenom, email, eleve_id });

    if (!nom || !prenom || !email || !eleve_id)
      return res.status(400).json({ success: false, message: 'Champs obligatoires : nom, prenom, email, eleve_id' });

    // Vérifier si email déjà utilisé
    const [existing] = await db.query('SELECT id, role FROM users WHERE email = ?', [email]);
    let parent_id;
    let tempPassword = null;

    if (existing.length > 0) {
      if (existing[0].role !== 'parent')
        return res.status(400).json({ success: false, message: 'Cet email est déjà utilisé par un autre rôle' });
      parent_id = existing[0].id;
      // Régénérer un nouveau mot de passe même pour un compte existant
      tempPassword = Math.random().toString(36).slice(-8);
      const hashed2 = await bcrypt.hash(tempPassword, 10);
      await db.query('UPDATE users SET password = ? WHERE id = ?', [hashed2, parent_id]);
      console.log('ℹ Compte existant — nouveau mdp:', tempPassword);
    } else {
      // Créer le compte
      tempPassword = Math.random().toString(36).slice(-8);
      const hashed = await bcrypt.hash(tempPassword, 10);
      const [result] = await db.query(
        "INSERT INTO users (nom, prenom, email, password, role, telephone) VALUES (?,?,?,?,'parent',?)",
        [nom, prenom, email, hashed, telephone || null]
      );
      parent_id = result.insertId;
      console.log('✓ Nouveau compte parent créé, id:', parent_id, '| mdp:', tempPassword);
    }

    // ── Envoyer l'email dans les 2 cas ──
      const MAIL_USER = process.env.MAIL_USER;
      const MAIL_PASS = process.env.MAIL_PASS;

      if (MAIL_USER && MAIL_PASS) {
        try {
          const nodemailer  = require('nodemailer');
          const loginUrl    = (process.env.FRONTEND_URL || 'http://localhost:5173') + '/parent/login';
          const transporter = nodemailer.createTransport({
            host:   process.env.MAIL_HOST || 'smtp.gmail.com',
            port:   parseInt(process.env.MAIL_PORT) || 587,
            secure: false,
            auth:   { user: MAIL_USER, pass: MAIL_PASS },
          });

          await transporter.sendMail({
            from:    process.env.MAIL_FROM || `EduNiger <${MAIL_USER}>`,
            to:      email,
            subject: 'EduNiger — Votre espace parent',
            html: `
              <!DOCTYPE html><html lang="fr">
              <body style="font-family:Arial,sans-serif;background:#f7f8fa;margin:0;padding:30px 0;">
                <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
                  <table width="540" cellpadding="0" cellspacing="0" style="background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.08);">
                    <tr>
                      <td style="background:linear-gradient(135deg,#073D24,#0A5C36);padding:28px 36px;text-align:center;">
                        <div style="font-size:32px;">📚</div>
                        <div style="color:#F5A623;font-size:20px;font-weight:700;margin-top:8px;">EduNiger</div>
                        <div style="color:rgba(255,255,255,0.5);font-size:12px;margin-top:4px;">Espace Parents</div>
                      </td>
                    </tr>
                    <tr>
                      <td style="padding:32px 36px;">
                        <h2 style="margin:0 0 12px;color:#1A202C;">Bienvenue sur EduNiger !</h2>
                        <p style="color:#4A5568;font-size:14px;line-height:1.7;margin:0 0 20px;">
                          Bonjour <strong>${prenom} ${nom}</strong>,<br>
                          Un compte parent a été créé pour vous.
                        </p>
                        <div style="background:#F7F8FA;border-radius:10px;padding:20px 24px;margin-bottom:20px;">
                          <p style="margin:0 0 8px;font-size:12px;color:#718096;font-weight:600;text-transform:uppercase;">Email</p>
                          <p style="margin:0 0 16px;font-size:15px;color:#1A202C;font-weight:600;">${email}</p>
                          <p style="margin:0 0 8px;font-size:12px;color:#718096;font-weight:600;text-transform:uppercase;">Mot de passe temporaire</p>
                          <p style="margin:0;font-size:22px;font-weight:700;color:#0A5C36;font-family:monospace;letter-spacing:3px;">${tempPassword}</p>
                        </div>
                        <div style="text-align:center;margin-bottom:20px;">
                          <a href="${loginUrl}" style="display:inline-block;background:#0A5C36;color:#fff;text-decoration:none;padding:13px 32px;border-radius:8px;font-size:14px;font-weight:700;">
                            → Se connecter à l'espace parent
                          </a>
                        </div>
                        <div style="background:#FFFBEB;border:1px solid #FDE68A;border-radius:8px;padding:12px 16px;">
                          <p style="margin:0;color:#92400E;font-size:13px;">
                            ⚠️ <strong>Changez votre mot de passe</strong> lors de votre première connexion.
                          </p>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <td style="background:#0A5C36;padding:14px;text-align:center;">
                        <p style="margin:0;color:rgba(255,255,255,0.6);font-size:11px;">EduNiger © ${new Date().getFullYear()}</p>
                      </td>
                    </tr>
                  </table>
                </td></tr></table>
              </body></html>
            `,
            text: `Bonjour ${prenom} ${nom},\n\nCompte EduNiger créé.\nEmail : ${email}\nMot de passe : ${tempPassword}\nConnexion : ${loginUrl}`,
          });

          console.log('✉ Email envoyé à', email);
        } catch (mailErr) {
          console.error('⚠ Erreur envoi email:', mailErr.message);
          // Le compte est créé même si l'email échoue
        }
      } else {
        console.warn('⚠ MAIL_USER ou MAIL_PASS manquant dans .env — email non envoyé');
        console.log('   Mot de passe temporaire (à transmettre manuellement):', tempPassword);
      }

    // Lier l'élève au parent (vérifier que la colonne parent_id existe)
    try {
      await db.query('UPDATE eleves SET parent_id = ? WHERE id = ?', [parent_id, eleve_id]);
      console.log('✓ Élève', eleve_id, 'lié au parent', parent_id);
    } catch (linkErr) {
      console.error('⚠ Erreur liaison élève-parent:', linkErr.message);
      console.error('  → Exécutez la migration : mysql -u root -p gestion_scolaire < database/migration_v2.sql');
    }

    res.json({
      success: true,
      message: existing.length > 0
        ? 'Compte parent existant lié à l\'élève'
        : `Compte parent créé${tempPassword ? ` (mot de passe : ${tempPassword})` : ''}`,
      parent_id,
      tempPassword: tempPassword || null,
    });

  } catch (error) {
    console.error('Erreur createParentAccount:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur : ' + error.message });
  }
};

// ── Dashboard parent ──────────────────────────────────────────
exports.getDashboard = async (req, res) => {
  try {
    const parent_id = req.user.id;
    const { eleve_id } = req.query;

    let eleveQuery = `
      SELECT e.*, c.nom as classe_nom, c.niveau,
             u_prof.prenom as enseignant_prenom, u_prof.nom as enseignant_nom
      FROM eleves e
      LEFT JOIN classes c ON e.classe_id = c.id
      LEFT JOIN users u_prof ON c.enseignant_id = u_prof.id
      WHERE e.parent_id = ?
    `;
    const params = [parent_id];
    if (eleve_id) { eleveQuery += ' AND e.id = ?'; params.push(eleve_id); }
    eleveQuery += ' LIMIT 1';

    const [eleves] = await db.query(eleveQuery, params);
    if (eleves.length === 0)
      return res.status(404).json({ success: false, message: 'Aucun enfant trouvé' });

    const eleve = eleves[0];

    // Stats présences
    const [presStats] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(statut = 'present') as presents,
        SUM(statut = 'absent') as absents,
        SUM(statut = 'retard') as retards,
        SUM(statut = 'absent_justifie') as absents_justifies
      FROM presences WHERE eleve_id = ?
    `, [eleve.id]);

    // Dernières notes
    const [dernieres_notes] = await db.query(`
      SELECT n.note, n.note_sur, n.periode, m.nom as matiere
      FROM notes n JOIN matieres m ON n.matiere_id = m.id
      WHERE n.eleve_id = ?
      ORDER BY n.created_at DESC LIMIT 5
    `, [eleve.id]);

    res.json({ success: true, eleve, stats: presStats[0], dernieres_notes });
  } catch (error) {
    console.error('Erreur getDashboard:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Notes parent ──────────────────────────────────────────────
exports.getNotes = async (req, res) => {
  try {
    const parent_id = req.user.id;
    const { eleve_id, periode } = req.query;

    // Vérifier que l'élève appartient au parent
    const [check] = await db.query('SELECT id FROM eleves WHERE id = ? AND parent_id = ?', [eleve_id, parent_id]);
    if (check.length === 0)
      return res.status(403).json({ success: false, message: 'Accès refusé' });

    const [notes] = await db.query(`
      SELECT n.*, m.nom as matiere, m.coefficient
      FROM notes n JOIN matieres m ON n.matiere_id = m.id
      WHERE n.eleve_id = ? AND n.periode = ?
      ORDER BY m.nom, n.date_evaluation, n.created_at
    `, [eleve_id, periode]);

    // Calcul moyennes par matière
    const byMatiere = {};
    notes.forEach(n => {
      if (!byMatiere[n.matiere]) byMatiere[n.matiere] = { notes: [], coef: n.coefficient };
      byMatiere[n.matiere].notes.push((n.note / n.note_sur) * 20);
    });

    let totalPts = 0, totalCoef = 0;
    const matieres = Object.entries(byMatiere).map(([matiere, d]) => {
      const moy = d.notes.reduce((a,b)=>a+b,0) / d.notes.length;
      totalPts  += moy * d.coef;
      totalCoef += d.coef;
      return { matiere, moyenne: moy.toFixed(2), coefficient: d.coef };
    });

    const moyenne_generale = totalCoef > 0 ? (totalPts / totalCoef).toFixed(2) : null;

    res.json({ success: true, notes, matieres, moyenne_generale });
  } catch (error) {
    console.error('Erreur getNotes:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Présences parent ──────────────────────────────────────────
exports.getPresences = async (req, res) => {
  try {
    const parent_id = req.user.id;
    const { eleve_id } = req.query;

    const [check] = await db.query('SELECT id FROM eleves WHERE id = ? AND parent_id = ?', [eleve_id, parent_id]);
    if (check.length === 0)
      return res.status(403).json({ success: false, message: 'Accès refusé' });

    const [presences] = await db.query(`
      SELECT p.*, c.nom as classe_nom,
             m.nom as matiere_nom
      FROM presences p
      LEFT JOIN classes c ON p.classe_id = c.id
      LEFT JOIN matieres m ON p.matiere_id = m.id
      WHERE p.eleve_id = ?
      ORDER BY p.date DESC, p.creneau_horaire LIMIT 120
    `, [eleve_id]);

    const [stats] = await db.query(`
      SELECT
        COUNT(*) as total,
        SUM(statut='present') as presents,
        SUM(statut='absent') as absents,
        SUM(statut='retard') as retards,
        SUM(statut='absent_justifie') as absents_justifies
      FROM presences WHERE eleve_id = ?
    `, [eleve_id]);

    res.json({ success: true, presences, stats: stats[0] });
  } catch (error) {
    console.error('Erreur getPresences:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Bulletins parent ──────────────────────────────────────────
exports.getBulletins = async (req, res) => {
  try {
    const parent_id = req.user.id;
    const { eleve_id } = req.query;

    const [check] = await db.query('SELECT id FROM eleves WHERE id = ? AND parent_id = ?', [eleve_id, parent_id]);
    if (check.length === 0)
      return res.status(403).json({ success: false, message: 'Accès refusé' });

    const [bulletins] = await db.query(
      'SELECT * FROM bulletins WHERE eleve_id = ? ORDER BY created_at DESC',
      [eleve_id]
    );

    res.json({ success: true, bulletins });
  } catch (error) {
    console.error('Erreur getBulletins:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};

// ── Télécharger un bulletin PDF ───────────────────────────────
exports.downloadBulletin = async (req, res) => {
  try {
    const parent_id = req.user.id;
    const { eleve_id, periode } = req.params;

    const [check] = await db.query('SELECT id FROM eleves WHERE id = ? AND parent_id = ?', [eleve_id, parent_id]);
    if (check.length === 0)
      return res.status(403).json({ success: false, message: 'Accès refusé' });

    // Réutiliser le générateur du module notes
    const noteCtrl = require('./noteController');
    req.params.eleve_id = eleve_id;
    req.params.periode  = periode;
    return noteCtrl.generateBulletin(req, res);
  } catch (error) {
    console.error('Erreur downloadBulletin:', error);
    res.status(500).json({ success: false, message: 'Erreur serveur' });
  }
};