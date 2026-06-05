-- ============================================================
-- Migration : Présences multi-cours par jour
-- Permet d'enregistrer plusieurs présences par élève par jour
-- (une par matière / créneau horaire)
-- ============================================================

USE gestion_scolaire;

-- Ajouter les colonnes
ALTER TABLE presences
  ADD COLUMN matiere_id INT DEFAULT NULL AFTER motif,
  ADD COLUMN creneau_horaire VARCHAR(30) DEFAULT NULL AFTER matiere_id;

-- Supprimer l'ancien UNIQUE
ALTER TABLE presences
  DROP INDEX unique_presence;

-- Nouveau UNIQUE
ALTER TABLE presences
  ADD UNIQUE KEY unique_presence_cours (
    eleve_id,
    date,
    matiere_id,
    creneau_horaire
  );

-- Clé étrangère
ALTER TABLE presences
  ADD CONSTRAINT fk_presence_matiere
  FOREIGN KEY (matiere_id)
  REFERENCES matieres(id)
  ON DELETE SET NULL;
