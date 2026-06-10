-- ============================================================
--  EduNiger → SaaS Multi-École
--  Migration v1.0 — Ajout tenant_id + tables SaaS
--  Base de données : gestion_scolaire
--  Usage : mysql -u root -p gestion_scolaire < migration_saas_v1.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- ÉTAPE 1 — Nouvelles tables SaaS
-- ============================================================

-- Table centrale des écoles (chaque école = un tenant)
-- is_active = 0 par défaut → activé uniquement après paiement confirmé
CREATE TABLE IF NOT EXISTS schools (
  id            INT          PRIMARY KEY AUTO_INCREMENT,
  name          VARCHAR(255) NOT NULL,
  slug          VARCHAR(100) NOT NULL UNIQUE,  -- ex: "lycee-bosso" → lycee-bosso.eduniger.com
  email         VARCHAR(255),
  phone         VARCHAR(30),
  address       TEXT,
  city          VARCHAR(100),
  country       VARCHAR(100) DEFAULT 'Niger',
  logo_url      VARCHAR(500),
  primary_color VARCHAR(7)   DEFAULT '#3B82F6',
  is_active     TINYINT(1)   NOT NULL DEFAULT 0,
  config        JSON,
  created_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at    TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Tarification fixe (une seule ligne active)
-- Modifier les montants ici sans toucher au code
CREATE TABLE IF NOT EXISTS pricing (
  id                INT           PRIMARY KEY AUTO_INCREMENT,
  installation_fee  DECIMAL(10,2) NOT NULL DEFAULT 50000,  -- frais one-shot en FCFA
  annual_fee        DECIMAL(10,2) NOT NULL DEFAULT 75000,  -- abonnement annuel en FCFA
  currency          VARCHAR(10)   NOT NULL DEFAULT 'FCFA',
  is_current        TINYINT(1)    NOT NULL DEFAULT 1,
  note              VARCHAR(255),
  created_at        TIMESTAMP     NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Tarif exemple (à ajuster)
INSERT IGNORE INTO pricing (id, installation_fee, annual_fee, currency, is_current, note)
VALUES (1, 50000, 75000, 'FCFA', 1, 'Tarif lancement EduNiger');


-- Paiements enregistrés manuellement après dépôt NITA ou Amana
CREATE TABLE IF NOT EXISTS payments (
  id              INT          PRIMARY KEY AUTO_INCREMENT,
  school_id       INT          NOT NULL,
  type            ENUM('installation','renewal') NOT NULL,
  amount          DECIMAL(10,2) NOT NULL,
  currency        VARCHAR(10)   NOT NULL DEFAULT 'FCFA',
  payment_method  VARCHAR(50),   -- 'nita', 'amana', 'virement', 'especes'
  payment_ref     VARCHAR(150),  -- numéro de transaction reçu par SMS
  status          ENUM('pending','confirmed','failed') NOT NULL DEFAULT 'pending',
  paid_at         TIMESTAMP NULL,
  period_start    DATE NULL,     -- début période couverte (renewal)
  period_end      DATE NULL,     -- fin période couverte (renewal)
  notes           TEXT,
  confirmed_by    INT NULL,      -- id super_admin qui a validé
  created_at      TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (school_id) REFERENCES schools(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- Super administrateurs
CREATE TABLE IF NOT EXISTS super_admins (
  id          INT          PRIMARY KEY AUTO_INCREMENT,
  name        VARCHAR(255) NOT NULL,
  email       VARCHAR(255) NOT NULL UNIQUE,
  password    VARCHAR(255) NOT NULL,  -- bcrypt
  role        ENUM('superadmin','support') DEFAULT 'support',
  is_active   TINYINT(1) DEFAULT 1,
  last_login  TIMESTAMP NULL,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;


-- ============================================================
-- ÉTAPE 2 — Insérer ton école pilote existante
-- ============================================================
-- ⚠️  Mets à jour le nom et le slug avec ta vraie école de test

INSERT IGNORE INTO schools (id, name, slug, is_active)
VALUES (1, 'École Pilote EduNiger', 'pilote', 1);

-- Paiement installation de l'école pilote
INSERT IGNORE INTO payments (school_id, type, amount, currency, payment_method, status, paid_at, notes)
VALUES (1, 'installation', 50000, 'FCFA', 'nita', 'confirmed', NOW(), 'École pilote — paiement initial');

-- Abonnement annuel de l'école pilote
INSERT IGNORE INTO payments (school_id, type, amount, currency, payment_method, status, paid_at, period_start, period_end, notes)
VALUES (1, 'renewal', 75000, 'FCFA', 'nita', 'confirmed', NOW(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'École pilote — abonnement annuel initial');


-- ============================================================
-- ÉTAPE 3 — Ajouter tenant_id à toutes les tables existantes
-- DEFAULT 1 = toutes les données actuelles → école pilote
-- ============================================================

-- ---------- users ----------
ALTER TABLE users
  ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE users
  ADD INDEX IF NOT EXISTS idx_users_tenant (tenant_id);

-- ---------- eleves ----------
ALTER TABLE eleves
  ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE eleves
  ADD INDEX IF NOT EXISTS idx_eleves_tenant (tenant_id);

-- ---------- classes ----------
ALTER TABLE classes
  ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE classes
  ADD INDEX IF NOT EXISTS idx_classes_tenant (tenant_id);

-- ---------- matieres ----------
ALTER TABLE matieres
  ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE matieres
  ADD INDEX IF NOT EXISTS idx_matieres_tenant (tenant_id);

-- ---------- notes ----------
ALTER TABLE notes
  ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE notes
  ADD INDEX IF NOT EXISTS idx_notes_tenant (tenant_id);

-- ---------- presences ----------
ALTER TABLE presences
  ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE presences
  ADD INDEX IF NOT EXISTS idx_presences_tenant (tenant_id);

-- ---------- bulletins ----------
ALTER TABLE bulletins
  ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE bulletins
  ADD INDEX IF NOT EXISTS idx_bulletins_tenant (tenant_id);

-- ---------- conversations ----------
ALTER TABLE conversations
  ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE conversations
  ADD INDEX IF NOT EXISTS idx_conversations_tenant (tenant_id);

-- ---------- messages ----------
ALTER TABLE messages
  ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE messages
  ADD INDEX IF NOT EXISTS idx_messages_tenant (tenant_id);

-- ---------- emploi_du_temps ----------
ALTER TABLE emploi_du_temps
  ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE emploi_du_temps
  ADD INDEX IF NOT EXISTS idx_emploi_du_temps_tenant (tenant_id);

-- ---------- notifications ----------
ALTER TABLE notifications
  ADD COLUMN IF NOT EXISTS tenant_id INT NOT NULL DEFAULT 1 AFTER id;
ALTER TABLE notifications
  ADD INDEX IF NOT EXISTS idx_notifications_tenant (tenant_id);

-- Tables ignorées (pas de données métier par école) :
-- ecole               → remplacée par la table schools
-- password_reset_tokens
-- reset_password_tokens


-- ============================================================
-- ÉTAPE 4 — Foreign Keys vers schools
-- ============================================================

ALTER TABLE users
  ADD CONSTRAINT IF NOT EXISTS fk_users_school
  FOREIGN KEY (tenant_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE eleves
  ADD CONSTRAINT IF NOT EXISTS fk_eleves_school
  FOREIGN KEY (tenant_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE classes
  ADD CONSTRAINT IF NOT EXISTS fk_classes_school
  FOREIGN KEY (tenant_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE matieres
  ADD CONSTRAINT IF NOT EXISTS fk_matieres_school
  FOREIGN KEY (tenant_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE notes
  ADD CONSTRAINT IF NOT EXISTS fk_notes_school
  FOREIGN KEY (tenant_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE presences
  ADD CONSTRAINT IF NOT EXISTS fk_presences_school
  FOREIGN KEY (tenant_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE bulletins
  ADD CONSTRAINT IF NOT EXISTS fk_bulletins_school
  FOREIGN KEY (tenant_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE conversations
  ADD CONSTRAINT IF NOT EXISTS fk_conversations_school
  FOREIGN KEY (tenant_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE messages
  ADD CONSTRAINT IF NOT EXISTS fk_messages_school
  FOREIGN KEY (tenant_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE emploi_du_temps
  ADD CONSTRAINT IF NOT EXISTS fk_emploi_du_temps_school
  FOREIGN KEY (tenant_id) REFERENCES schools(id) ON DELETE CASCADE;

ALTER TABLE notifications
  ADD CONSTRAINT IF NOT EXISTS fk_notifications_school
  FOREIGN KEY (tenant_id) REFERENCES schools(id) ON DELETE CASCADE;


-- ============================================================
-- ÉTAPE 5 — Procédure : onboarder une nouvelle école
-- ============================================================

DROP PROCEDURE IF EXISTS onboard_school;

DELIMITER $$

CREATE PROCEDURE onboard_school(
  IN  p_name            VARCHAR(255),
  IN  p_slug            VARCHAR(100),
  IN  p_email           VARCHAR(255),
  IN  p_phone           VARCHAR(30),
  IN  p_city            VARCHAR(100),
  IN  p_payment_method  VARCHAR(50),   -- 'nita' ou 'amana'
  IN  p_install_ref     VARCHAR(150),  -- référence SMS installation
  IN  p_annual_ref      VARCHAR(150),  -- référence SMS abonnement annuel
  IN  p_confirmed_by    INT,
  OUT p_school_id       INT
)
BEGIN
  DECLARE v_install_fee DECIMAL(10,2);
  DECLARE v_annual_fee  DECIMAL(10,2);

  IF EXISTS (SELECT 1 FROM schools WHERE slug = p_slug) THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Ce slug est déjà utilisé par une autre école.';
  END IF;

  SELECT installation_fee, annual_fee
  INTO v_install_fee, v_annual_fee
  FROM pricing WHERE is_current = 1 LIMIT 1;

  -- Créer l'école et l'activer immédiatement
  INSERT INTO schools (name, slug, email, phone, city, is_active)
  VALUES (p_name, p_slug, p_email, p_phone, p_city, 1);

  SET p_school_id = LAST_INSERT_ID();

  -- Enregistrer le paiement d'installation
  INSERT INTO payments (school_id, type, amount, currency, payment_method, payment_ref, status, paid_at, confirmed_by)
  VALUES (p_school_id, 'installation', v_install_fee, 'FCFA', p_payment_method, p_install_ref, 'confirmed', NOW(), p_confirmed_by);

  -- Enregistrer l'abonnement annuel
  INSERT INTO payments (school_id, type, amount, currency, payment_method, payment_ref, status, paid_at, period_start, period_end, confirmed_by)
  VALUES (p_school_id, 'renewal', v_annual_fee, 'FCFA', p_payment_method, p_annual_ref, 'confirmed', NOW(),
          CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), p_confirmed_by);

END$$

DELIMITER ;

-- Exemple :
-- CALL onboard_school('Lycée Bosso', 'lycee-bosso', 'contact@bosso.ne',
--   '+227 90 00 00 00', 'Niamey', 'nita', 'NITA-001234', 'NITA-001235', 1, @id);
-- SELECT @id;


-- ============================================================
-- ÉTAPE 6 — Vue : suivi des abonnements
-- ============================================================

CREATE OR REPLACE VIEW v_schools_subscription AS
SELECT
  s.id,
  s.name,
  s.slug,
  s.city,
  s.is_active,
  p.period_start,
  p.period_end,
  DATEDIFF(p.period_end, CURDATE()) AS jours_restants,
  CASE
    WHEN p.period_end < CURDATE()                THEN 'Expiré'
    WHEN DATEDIFF(p.period_end, CURDATE()) <= 30 THEN 'Expire bientôt'
    ELSE 'Actif'
  END AS statut_abonnement
FROM schools s
LEFT JOIN payments p
  ON p.school_id = s.id
  AND p.type = 'renewal'
  AND p.status = 'confirmed'
  AND p.period_end = (
    SELECT MAX(period_end) FROM payments
    WHERE school_id = s.id AND type = 'renewal' AND status = 'confirmed'
  );

-- Utilisation : SELECT * FROM v_schools_subscription ORDER BY jours_restants ASC;


SET FOREIGN_KEY_CHECKS = 1;

-- ============================================================
-- ✅  Migration terminée
-- ============================================================
