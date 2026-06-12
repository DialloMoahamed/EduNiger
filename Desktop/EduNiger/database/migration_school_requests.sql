-- ============================================================
--  EduNiger SaaS — Demandes d'inscription en ligne
--  Table : school_requests
--  Usage : mysql -u root -p gestion_scolaire < migration_school_requests.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS school_requests (
  id              INT          PRIMARY KEY AUTO_INCREMENT,
  name            VARCHAR(255) NOT NULL,
  slug_souhaite   VARCHAR(100),
  contact_nom     VARCHAR(255) NOT NULL,
  contact_prenom  VARCHAR(255),
  email           VARCHAR(255) NOT NULL,
  phone           VARCHAR(30),
  city            VARCHAR(100),
  type_ecole      VARCHAR(100),
  nb_eleves       INT,
  message         TEXT,
  status          ENUM('pending','contacted','approved','rejected') NOT NULL DEFAULT 'pending',
  notes_admin     TEXT,
  processed_by    INT NULL,
  processed_at    TIMESTAMP NULL,
  school_id       INT NULL,
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Index conditionnels (compatibilité MySQL 8)
DROP PROCEDURE IF EXISTS add_index_if_missing;
DELIMITER $$
CREATE PROCEDURE add_index_if_missing()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'school_requests' AND INDEX_NAME = 'idx_requests_status'
  ) THEN
    CREATE INDEX idx_requests_status ON school_requests(status);
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'school_requests' AND INDEX_NAME = 'idx_requests_created'
  ) THEN
    CREATE INDEX idx_requests_created ON school_requests(created_at);
  END IF;
END$$
DELIMITER ;
CALL add_index_if_missing();
DROP PROCEDURE IF EXISTS add_index_if_missing;