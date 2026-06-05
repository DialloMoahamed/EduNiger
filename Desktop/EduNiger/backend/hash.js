const bcrypt = require('bcryptjs');
const db = require('./config/database'); // adapte le chemin si nécessaire

(async () => {
  try {
    // Mots de passe à définir
    const usersToUpdate = [
      { email: 'admin@ecole.com', password: 'Admin123!' },
      { email: 'prof@ecole.com', password: 'Prof123!' }
    ];

    for (const user of usersToUpdate) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await db.query(
        'UPDATE users SET password = ? WHERE email = ?',
        [hashedPassword, user.email]
      );
      console.log(`Mot de passe réinitialisé pour ${user.email}`);
    }

    console.log('✅ Tous les mots de passe ont été réinitialisés avec succès !');
    process.exit(0);
  } catch (err) {
    console.error('Erreur:', err);
    process.exit(1);
  }
})();