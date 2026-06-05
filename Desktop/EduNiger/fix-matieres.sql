-- Correction des accents dans les matières
USE gestion_scolaire;

-- Forcer l'encodage
SET NAMES 'utf8mb4';
SET CHARACTER SET utf8mb4;

-- Afficher avant correction
SELECT 'AVANT CORRECTION:' as Status;
SELECT id, nom, code FROM matieres ORDER BY id;

-- Corrections directes
UPDATE matieres SET nom = 'Français' WHERE nom LIKE '%Fran%ais%' OR nom = 'FranÃ§ais';
UPDATE matieres SET nom = 'Mathématiques' WHERE nom LIKE '%Math%matiques%' OR nom = 'MathÃ©matiques';
UPDATE matieres SET nom = 'Géographie' WHERE nom LIKE '%G%ographie%' OR nom = 'GÃ©ographie';
UPDATE matieres SET nom = 'Histoire-Géographie' WHERE nom LIKE '%Histoire-G%ographie%' OR nom = 'Histoire-GÃ©ographie';
UPDATE matieres SET nom = 'Éducation Familiale' WHERE nom LIKE '%ducation%' AND code = 'EF';
UPDATE matieres SET nom = 'Sciences Physiques' WHERE code = 'PC';
UPDATE matieres SET nom = 'Anglais' WHERE code = 'ANG';

-- Correction générale pour tout ce qui reste
UPDATE matieres SET nom = REPLACE(nom, 'Ã©', 'é');
UPDATE matieres SET nom = REPLACE(nom, 'Ã¨', 'è');
UPDATE matieres SET nom = REPLACE(nom, 'Ã ', 'à');
UPDATE matieres SET nom = REPLACE(nom, 'Ã´', 'ô');
UPDATE matieres SET nom = REPLACE(nom, 'Ã§', 'ç');
UPDATE matieres SET nom = REPLACE(nom, '�', 'é');

-- Afficher après correction
SELECT 'APRÈS CORRECTION:' as Status;
SELECT id, nom, code FROM matieres ORDER BY id;

SELECT '✅ Correction des matières terminée !' as Resultat;
