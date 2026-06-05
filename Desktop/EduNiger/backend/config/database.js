const mysql = require('mysql2/promise');
require('dotenv').config();

const pool = mysql.createPool({
  host:     process.env.DB_HOST     || 'localhost',
  user:     process.env.DB_USER     || 'root',
  password: process.env.DB_PASS     || process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME     || 'gestion_scolaire',
  port:     process.env.DB_PORT     || 3306,
  charset:  'utf8mb4',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
});

pool.getConnection()
  .then(conn => {
    console.log('✅ Connexion à la base de données réussie');
    conn.release();
  })
  .catch(err => {
    console.error('❌ Erreur de connexion à la base de données:', err.message);
  });

module.exports = pool;