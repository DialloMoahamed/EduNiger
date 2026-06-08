-- EduNiger — Migration : index de performance pour notifications SMS
-- mysql -u root -p gestion_scolaire < database/migration_sms.sql
ALTER TABLE notifications
  ADD INDEX idx_notif_type   (type),
  ADD INDEX idx_notif_statut (statut),
  ADD INDEX idx_notif_eleve  (eleve_id);