const mysql = require('mysql2/promise');
require('dotenv').config();

async function diagnosticAndFix() {
  console.log('🔍 DIAGNOSTIC ET CORRECTION DES ACCENTS\n');
  console.log('=====================================\n');

  let connection;

  try {
    // Connexion avec charset forcé
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || '',
      database: process.env.DB_NAME || 'gestion_scolaire',
      port: process.env.DB_PORT || 3306,
      charset: 'utf8mb4',
      connectTimeout: 10000
    });

    console.log('✅ Connexion établie\n');

    // 1. DIAGNOSTIC
    console.log('📊 DIAGNOSTIC:');
    console.log('==============\n');

    const [vars] = await connection.query("SHOW VARIABLES LIKE 'character_set%'");
    console.log('Variables MySQL:');
    vars.forEach(v => console.log(`  ${v.Variable_name}: ${v.Value}`));
    console.log();

    // Vérifier les données actuelles
    console.log('📋 Données actuelles (avant correction):\n');
    
    const [classes] = await connection.query('SELECT id, nom, niveau FROM classes LIMIT 3');
    console.log('Classes:');
    classes.forEach(c => console.log(`  ${c.id}: ${c.nom} - ${c.niveau}`));
    console.log();

    const [eleves] = await connection.query('SELECT id, nom, prenom FROM eleves LIMIT 3');
    console.log('Élèves:');
    eleves.forEach(e => console.log(`  ${e.id}: ${e.nom} ${e.prenom}`));
    console.log();

    // 2. CORRECTION
    console.log('\n🔧 CORRECTION EN COURS...\n');

    // Forcer l'encodage de la connexion
    await connection.query("SET NAMES 'utf8mb4'");
    await connection.query("SET CHARACTER SET utf8mb4");

    // Corriger les classes - nom
    console.log('1️⃣ Correction des noms de classes...');
    await connection.query(`
      UPDATE classes 
      SET nom = CONVERT(CAST(CONVERT(nom USING latin1) AS BINARY) USING utf8mb4)
      WHERE nom LIKE '%Ã%' OR nom LIKE '%ème%' OR nom LIKE '%eme%'
    `);

    // Corriger les classes - niveau
    await connection.query(`
      UPDATE classes 
      SET niveau = CONVERT(CAST(CONVERT(niveau USING latin1) AS BINARY) USING utf8mb4)
      WHERE niveau LIKE '%Ã%' OR niveau LIKE '%ège%' OR niveau LIKE '%ege%'
    `);
    console.log('   ✅ Classes corrigées\n');

    // Corriger les élèves - nom
    console.log('2️⃣ Correction des noms d\'élèves...');
    await connection.query(`
      UPDATE eleves 
      SET nom = CONVERT(CAST(CONVERT(nom USING latin1) AS BINARY) USING utf8mb4)
      WHERE nom LIKE '%Ã%'
    `);

    // Corriger les élèves - prénom
    await connection.query(`
      UPDATE eleves 
      SET prenom = CONVERT(CAST(CONVERT(prenom USING latin1) AS BINARY) USING utf8mb4)
      WHERE prenom LIKE '%Ã%'
    `);
    console.log('   ✅ Élèves corrigés\n');

    // Corriger les matières
    console.log('3️⃣ Correction des matières...');
    await connection.query(`
      UPDATE matieres 
      SET nom = CONVERT(CAST(CONVERT(nom USING latin1) AS BINARY) USING utf8mb4)
      WHERE nom LIKE '%Ã%'
    `);
    console.log('   ✅ Matières corrigées\n');

    // 3. VÉRIFICATION
    console.log('\n✅ VÉRIFICATION (après correction):\n');

    const [classesNew] = await connection.query('SELECT id, nom, niveau FROM classes LIMIT 5');
    console.log('Classes:');
    classesNew.forEach(c => console.log(`  ${c.id}: ${c.nom} - ${c.niveau}`));
    console.log();

    const [elevesNew] = await connection.query('SELECT id, nom, prenom FROM eleves LIMIT 5');
    console.log('Élèves:');
    elevesNew.forEach(e => console.log(`  ${e.id}: ${e.nom} ${e.prenom}`));
    console.log();

    const [matieresNew] = await connection.query('SELECT id, nom FROM matieres LIMIT 5');
    console.log('Matières:');
    matieresNew.forEach(m => console.log(`  ${m.id}: ${m.nom}`));
    console.log();

    console.log('=====================================');
    console.log('✅ CORRECTION TERMINÉE AVEC SUCCÈS !');
    console.log('=====================================\n');

    console.log('📝 PROCHAINES ÉTAPES:\n');
    console.log('1. Redémarrez le serveur backend (Ctrl+C puis npm start)');
    console.log('2. Videz le cache navigateur (Ctrl + Shift + R)');
    console.log('3. Rechargez la page\n');

    await connection.end();
    process.exit(0);

  } catch (error) {
    console.error('\n❌ ERREUR:', error.message);
    console.error('\n💡 SOLUTIONS POSSIBLES:');
    console.error('1. Vérifiez que MySQL est démarré');
    console.error('2. Vérifiez le fichier .env (mot de passe, etc.)');
    console.error('3. Vérifiez que la base "gestion_scolaire" existe\n');
    
    if (connection) await connection.end();
    process.exit(1);
  }
}

diagnosticAndFix();
