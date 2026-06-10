-- ============================================================
--  EduNiger SaaS — ROLLBACK migration v1
--  ⚠️  À utiliser UNIQUEMENT en cas de problème
--  Usage : mysql -u root -p gestion_scolaire < rollback_saas_v1.sql
-- ============================================================

SET FOREIGN_KEY_CHECKS = 0;

-- Supprimer les FK
ALTER TABLE users          DROP FOREIGN KEY IF EXISTS fk_users_school;
ALTER TABLE eleves         DROP FOREIGN KEY IF EXISTS fk_eleves_school;
ALTER TABLE classes        DROP FOREIGN KEY IF EXISTS fk_classes_school;
ALTER TABLE matieres       DROP FOREIGN KEY IF EXISTS fk_matieres_school;
ALTER TABLE notes          DROP FOREIGN KEY IF EXISTS fk_notes_school;
ALTER TABLE presences      DROP FOREIGN KEY IF EXISTS fk_presences_school;
ALTER TABLE bulletins      DROP FOREIGN KEY IF EXISTS fk_bulletins_school;
ALTER TABLE conversations  DROP FOREIGN KEY IF EXISTS fk_conversations_school;
ALTER TABLE messages       DROP FOREIGN KEY IF EXISTS fk_messages_school;
ALTER TABLE emploi_du_temps DROP FOREIGN KEY IF EXISTS fk_emploi_du_temps_school;
ALTER TABLE notifications  DROP FOREIGN KEY IF EXISTS fk_notifications_school;

-- Supprimer les colonnes tenant_id
ALTER TABLE users          DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE eleves         DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE classes        DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE matieres       DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE notes          DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE presences      DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE bulletins      DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE conversations  DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE messages       DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE emploi_du_temps DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE notifications  DROP COLUMN IF EXISTS tenant_id;

-- Supprimer les nouvelles tables et procédures SaaS
DROP PROCEDURE IF EXISTS onboard_school;
DROP VIEW IF EXISTS v_schools_subscription;
DROP TABLE IF EXISTS payments;
DROP TABLE IF EXISTS pricing;
DROP TABLE IF EXISTS super_admins;
DROP TABLE IF EXISTS schools;

SET FOREIGN_KEY_CHECKS = 1;

SELECT 'Rollback terminé — base restaurée à l\'état initial.' AS info;
