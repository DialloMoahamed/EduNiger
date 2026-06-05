-- ============================================================
-- Migration : Emploi du temps
-- Exécuter : mysql -u root -p gestion_scolaire < database/migration_emploi_du_temps.sql
-- ============================================================

CREATE TABLE IF NOT EXISTS emploi_du_temps (
  id          INT PRIMARY KEY AUTO_INCREMENT,
  classe_id   INT NOT NULL,
  matiere_id  INT NOT NULL,
  enseignant_id INT,
  jour        ENUM('Lundi','Mardi','Mercredi','Jeudi','Vendredi','Samedi') NOT NULL,
  heure_debut TIME NOT NULL,
  heure_fin   TIME NOT NULL,
  salle       VARCHAR(50) DEFAULT NULL,
  created_by  INT,
  created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (classe_id)    REFERENCES classes(id)  ON DELETE CASCADE,
  FOREIGN KEY (matiere_id)   REFERENCES matieres(id) ON DELETE CASCADE,
  FOREIGN KEY (enseignant_id) REFERENCES users(id)   ON DELETE SET NULL,
  FOREIGN KEY (created_by)   REFERENCES users(id)    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Exemples de données (optionnel — à adapter à vos classes/matières réelles)
-- INSERT INTO emploi_du_temps (classe_id, matiere_id, jour, heure_debut, heure_fin, salle) VALUES
-- (1, 1, 'Lundi',    '08:00:00', '09:00:00', 'Salle 1'),
-- (1, 2, 'Lundi',    '09:00:00', '10:00:00', 'Salle 1'),
-- (1, 1, 'Mardi',    '08:00:00', '09:00:00', 'Salle 1');
