-- ============================================================
-- EduNiger — Migration : Messagerie Interne
-- À exécuter dans MySQL Workbench sur gestion_scolaire
-- ============================================================

-- 1. Conversations (fil de discussion entre 2 utilisateurs)
CREATE TABLE IF NOT EXISTS conversations (
  id           INT PRIMARY KEY AUTO_INCREMENT,
  participant1 INT NOT NULL,
  participant2 INT NOT NULL,
  created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (participant1) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (participant2) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY uniq_conv (participant1, participant2)
) ENGINE=InnoDB;

-- 2. Messages
CREATE TABLE IF NOT EXISTS messages (
  id              INT PRIMARY KEY AUTO_INCREMENT,
  conversation_id INT NOT NULL,
  sender_id       INT NOT NULL,
  contenu         TEXT NOT NULL,
  lu              TINYINT(1) DEFAULT 0,
  created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (conversation_id) REFERENCES conversations(id) ON DELETE CASCADE,
  FOREIGN KEY (sender_id)       REFERENCES users(id)         ON DELETE CASCADE
) ENGINE=InnoDB;

-- Index pour les performances
CREATE INDEX idx_messages_conv ON messages(conversation_id);
CREATE INDEX idx_messages_lu   ON messages(lu, sender_id);

SELECT 'Migration messagerie terminée !' AS statut;
