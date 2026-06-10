-- ============================================================
--  EduNiger SaaS — Migration v2 : tenant_id uniquement
--  Les tables SaaS (schools, payments, pricing, super_admins)
--  sont déjà créées. Ce script ajoute uniquement tenant_id
--  aux tables métier existantes.
--  Usage : mysql -u root -p gestion_scolaire < migration_saas_v2_tenant_only.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- ============================================================
-- Procédure utilitaire : ajoute tenant_id si absent
-- Contourne le problème ALTER TABLE ... IF NOT EXISTS sur MySQL 9.x
-- ============================================================

DROP PROCEDURE IF EXISTS add_tenant_id;

DELIMITER $$
CREATE PROCEDURE add_tenant_id(IN tbl VARCHAR(100))
BEGIN
  -- Vérifie si tenant_id existe déjà dans la table
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME   = tbl
      AND COLUMN_NAME  = 'tenant_id'
  ) THEN
    SET @sql = CONCAT(
      'ALTER TABLE `', tbl, '` ',
      'ADD COLUMN tenant_id INT NOT NULL DEFAULT 1 AFTER id, ',
      'ADD INDEX idx_', tbl, '_tenant (tenant_id), ',
      'ADD CONSTRAINT fk_', tbl, '_school ',
        'FOREIGN KEY (tenant_id) REFERENCES schools(id) ON DELETE CASCADE'
    );
    PREPARE stmt FROM @sql;
    EXECUTE stmt;
    DEALLOCATE PREPARE stmt;
    SELECT CONCAT('✅ tenant_id ajouté à : ', tbl) AS résultat;
  ELSE
    SELECT CONCAT('⏭️  tenant_id déjà présent dans : ', tbl) AS résultat;
  END IF;
END$$
DELIMITER ;

-- ============================================================
-- Appliquer sur chaque table métier
-- ============================================================

CALL add_tenant_id('users');
CALL add_tenant_id('eleves');
CALL add_tenant_id('classes');
CALL add_tenant_id('matieres');
CALL add_tenant_id('notes');
CALL add_tenant_id('presences');
CALL add_tenant_id('bulletins');
CALL add_tenant_id('conversations');
CALL add_tenant_id('messages');
CALL add_tenant_id('emploi_du_temps');
CALL add_tenant_id('notifications');

-- Nettoyage
DROP PROCEDURE IF EXISTS add_tenant_id;

-- ============================================================
-- École pilote + paiements (si pas encore insérés)
-- ============================================================

INSERT IGNORE INTO schools (id, name, slug, is_active)
VALUES (1, 'École Pilote EduNiger', 'pilote', 1);

INSERT IGNORE INTO payments (school_id, type, amount, currency, payment_method, status, paid_at, notes)
VALUES (1, 'installation', 50000, 'FCFA', 'nita', 'confirmed', NOW(), 'École pilote — paiement initial');

INSERT IGNORE INTO payments (school_id, type, amount, currency, payment_method, status, paid_at, period_start, period_end, notes)
VALUES (1, 'renewal', 75000, 'FCFA', 'nita', 'confirmed', NOW(), CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), 'École pilote — abonnement annuel');

-- ============================================================
-- Procédure onboard_school (si pas encore créée)
-- ============================================================

DROP PROCEDURE IF EXISTS onboard_school;

DELIMITER $$
CREATE PROCEDURE onboard_school(
  IN  p_name            VARCHAR(255),
  IN  p_slug            VARCHAR(100),
  IN  p_email           VARCHAR(255),
  IN  p_phone           VARCHAR(30),
  IN  p_city            VARCHAR(100),
  IN  p_payment_method  VARCHAR(50),
  IN  p_install_ref     VARCHAR(150),
  IN  p_annual_ref      VARCHAR(150),
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

  INSERT INTO schools (name, slug, email, phone, city, is_active)
  VALUES (p_name, p_slug, p_email, p_phone, p_city, 1);

  SET p_school_id = LAST_INSERT_ID();

  INSERT INTO payments (school_id, type, amount, currency, payment_method, payment_ref, status, paid_at, confirmed_by)
  VALUES (p_school_id, 'installation', v_install_fee, 'FCFA', p_payment_method, p_install_ref, 'confirmed', NOW(), p_confirmed_by);

  INSERT INTO payments (school_id, type, amount, currency, payment_method, payment_ref, status, paid_at, period_start, period_end, confirmed_by)
  VALUES (p_school_id, 'renewal', v_annual_fee, 'FCFA', p_payment_method, p_annual_ref, 'confirmed', NOW(),
          CURDATE(), DATE_ADD(CURDATE(), INTERVAL 1 YEAR), p_confirmed_by);
END$$
DELIMITER ;

-- ============================================================
-- Vue suivi abonnements (si pas encore créée)
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

SET FOREIGN_KEY_CHECKS = 1;

SELECT '✅ Migration SaaS terminée avec succès !' AS info;
