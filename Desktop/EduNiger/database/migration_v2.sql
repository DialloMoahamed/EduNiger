-- ============================================================
-- EduNiger — Migration v2
-- mysql -u root -p gestion_scolaire < database/migration_v2.sql
-- ============================================================

-- 1. Ajouter 'parent' au rôle
ALTER TABLE users 
  MODIFY COLUMN role ENUM('admin','enseignant','parent') NOT NULL DEFAULT 'enseignant';

-- 2. Ajouter parent_id dans eleves (compatible MySQL 5.x et 8.x)
SET @col_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'eleves' 
  AND COLUMN_NAME = 'parent_id'
);

SET @sql = IF(@col_exists = 0,
  'ALTER TABLE eleves ADD COLUMN parent_id INT, ADD CONSTRAINT fk_eleve_parent FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL',
  'SELECT "Colonne parent_id déjà existante" AS info'
);

PREPARE stmt FROM @sql;
EXECUTE stmt;
DEALLOCATE PREPARE stmt;

-- 3. Ajouter mention dans bulletins
SET @col2_exists = (
  SELECT COUNT(*) FROM information_schema.COLUMNS 
  WHERE TABLE_SCHEMA = DATABASE() 
  AND TABLE_NAME = 'bulletins' 
  AND COLUMN_NAME = 'mention'
);

SET @sql2 = IF(@col2_exists = 0,
  'ALTER TABLE bulletins ADD COLUMN mention VARCHAR(50)',
  'SELECT "Colonne mention déjà existante" AS info'
);

PREPARE stmt2 FROM @sql2;
EXECUTE stmt2;
DEALLOCATE PREPARE stmt2;

-- 4. Table reset_password_tokens
CREATE TABLE IF NOT EXISTS reset_password_tokens (
  id         INT PRIMARY KEY AUTO_INCREMENT,
  user_id    INT NOT NULL,
  token      VARCHAR(64) UNIQUE NOT NULL,
  expires_at DATETIME NOT NULL,
  used       TINYINT(1) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- 5. Compte parent de démonstration (mot de passe: Prof123!)
INSERT IGNORE INTO users (nom, prenom, email, password, role, telephone)
VALUES ('DIALLO', 'Ibrahim', 'parent@ecole.com', 
  '$2a$10$83JsmZqZv9.dixaWMCoKZeaAxmPck7xnL8Z0hMxnWaaQKDq2VHMQ.', 
  'parent', '+227 90 12 34 56');

SELECT 'Migration v2 terminée ✓' AS statut;