// ============================================================
//  create-super-admin.js
//  Crée le premier super administrateur EduNiger
//  Usage : node create-super-admin.js
// ============================================================
const bcrypt = require('bcryptjs');
const db     = require('./config/database');

const SUPER_ADMIN = {
  name:     'Super Admin EduNiger',
  email:    'admin@eduniger.ne',
  password: 'EduNiger2025!',  // ⚠️  Changer après la première connexion
  role:     'superadmin',
};

(async () => {
  try {
    // Vérifier s'il existe déjà
    const [existing] = await db.query(
      'SELECT id FROM super_admins WHERE email = ?',
      [SUPER_ADMIN.email]
    );

    if (existing.length > 0) {
      console.log(`ℹ️  Un super admin avec l'email ${SUPER_ADMIN.email} existe déjà.`);
      console.log('   Pour réinitialiser son mot de passe, supprimez-le d\'abord.');
      process.exit(0);
    }

    const hashed = await bcrypt.hash(SUPER_ADMIN.password, 12);

    await db.query(
      'INSERT INTO super_admins (name, email, password, role, is_active) VALUES (?, ?, ?, ?, 1)',
      [SUPER_ADMIN.name, SUPER_ADMIN.email, hashed, SUPER_ADMIN.role]
    );

    console.log('');
    console.log('✅ Super admin créé avec succès !');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`   Email    : ${SUPER_ADMIN.email}`);
    console.log(`   Mot de passe : ${SUPER_ADMIN.password}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('⚠️  Changez le mot de passe après la première connexion !');
    console.log('   Accès : http://localhost:5173/superadmin');
    console.log('');

    process.exit(0);
  } catch (err) {
    console.error('❌ Erreur :', err.message || err);
    process.exit(1);
  }
})();