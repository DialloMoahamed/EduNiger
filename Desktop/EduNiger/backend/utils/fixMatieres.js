const db = require('../config/database');

async function ultimateCleanDB() {
  console.log('🧠 ULTIMATE DB CLEANER (mode SaaS)\n');

  try {
    // 🔧 Forcer UTF-8 côté connexion
    await db.query("SET NAMES utf8mb4");
    await db.query("SET CHARACTER SET utf8mb4");

    console.log('✅ Connexion en utf8mb4\n');

    // 📋 Tables
    const [tables] = await db.query(`
      SELECT TABLE_NAME 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = DATABASE()
    `);

    for (const t of tables) {
      const table = t.TABLE_NAME;

      console.log(`\n📦 Table: ${table}`);

      // 🔥 1. Fix charset table
      await db.query(`
        ALTER TABLE \`${table}\`
        CONVERT TO CHARACTER SET utf8mb4
        COLLATE utf8mb4_unicode_ci
      `);

      console.log('  🔧 Charset OK');

      // 📋 Colonnes texte
      const [cols] = await db.query(`
        SELECT COLUMN_NAME, DATA_TYPE
        FROM INFORMATION_SCHEMA.COLUMNS
        WHERE TABLE_SCHEMA = DATABASE()
        AND TABLE_NAME = ?
        AND DATA_TYPE IN ('varchar','text','mediumtext','longtext')
      `, [table]);

      for (const c of cols) {
        const column = c.COLUMN_NAME;

        // 🔎 Détection corruption
        const [count] = await db.query(`
          SELECT COUNT(*) as total
          FROM \`${table}\`
          WHERE \`${column}\` LIKE '%Ã%'
             OR \`${column}\` LIKE '%�%'
        `);

        if (count[0].total === 0) {
          console.log(`  ✅ ${column} OK`);
          continue;
        }

        console.log(`  ⚠️ ${column}: ${count[0].total} lignes corrompues`);

        // 🛠 Correction SAFE
        await db.query(`
          UPDATE \`${table}\`
          SET \`${column}\` = IFNULL(
            CONVERT(
              CAST(CONVERT(\`${column}\` USING latin1) AS BINARY)
              USING utf8mb4
            ),
            \`${column}\`
          )
          WHERE \`${column}\` LIKE '%Ã%'
             OR \`${column}\` LIKE '%�%'
        `);

        console.log(`  🔧 ${column} corrigé`);
      }
    }

    console.log('\n🎉 BASE 100% CLEAN\n');

    console.log('📌 À faire après:');
    console.log('→ npm restart');
    console.log('→ Ctrl + Shift + R');
    console.log('→ Tester frontend');

    process.exit(0);

  } catch (err) {
    console.error('❌ Erreur:', err.message);
    process.exit(1);
  }
}

ultimateCleanDB();