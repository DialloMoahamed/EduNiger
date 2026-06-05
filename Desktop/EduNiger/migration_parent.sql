-- ============================================================
-- EduNiger — Migration : Espace Parent
-- À exécuter dans MySQL Workbench sur la base gestion_scolaire
-- ============================================================

-- 1. Ajouter le rôle 'parent' dans la table users
ALTER TABLE users 
  MODIFY COLUMN role ENUM('admin','enseignant','parent') NOT NULL DEFAULT 'enseignant';

-- 2. Ajouter la colonne parent_id dans eleves
ALTER TABLE eleves
  ADD COLUMN parent_id INT NULL AFTER classe_id,
  ADD CONSTRAINT fk_eleve_parent
    FOREIGN KEY (parent_id) REFERENCES users(id) ON DELETE SET NULL;

-- Vérification
SELECT 'Migration terminée avec succès !' AS statut;
