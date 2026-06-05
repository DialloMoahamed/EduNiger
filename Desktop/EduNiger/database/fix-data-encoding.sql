-- Script pour corriger les données mal encodées déjà en base de données

USE gestion_scolaire;

-- 1. Corriger les noms de classes
UPDATE classes 
SET nom = CASE
    WHEN nom LIKE '%ème%' THEN REPLACE(nom, 'ème', 'ème')
    WHEN nom LIKE '%Ã¨me%' THEN REPLACE(nom, 'Ã¨me', 'ème')
    WHEN nom LIKE '%Ã©%' THEN REPLACE(nom, 'Ã©', 'é')
    ELSE nom
END;

UPDATE classes
SET niveau = CASE
    WHEN niveau LIKE '%CollÃ¨ge%' THEN REPLACE(niveau, 'CollÃ¨ge', 'Collège')
    WHEN niveau LIKE '%LycÃ©e%' THEN REPLACE(niveau, 'LycÃ©e', 'Lycée')
    WHEN niveau LIKE '%Ã‰cole%' THEN REPLACE(niveau, 'Ã‰cole', 'École')
    WHEN niveau LIKE '%Ã©%' THEN REPLACE(niveau, 'Ã©', 'é')
    WHEN niveau LIKE '%Ã¨%' THEN REPLACE(niveau, 'Ã¨', 'è')
    WHEN niveau LIKE '%Ã %' THEN REPLACE(niveau, 'Ã ', 'à')
    ELSE niveau
END;

-- 2. Corriger les noms d'élèves
UPDATE eleves
SET nom = CASE
    WHEN nom LIKE '%Ã©%' THEN REPLACE(nom, 'Ã©', 'é')
    WHEN nom LIKE '%Ã¨%' THEN REPLACE(nom, 'Ã¨', 'è')
    WHEN nom LIKE '%Ã %' THEN REPLACE(nom, 'Ã ', 'à')
    WHEN nom LIKE '%Ã´%' THEN REPLACE(nom, 'Ã´', 'ô')
    WHEN nom LIKE '%Ã§%' THEN REPLACE(nom, 'Ã§', 'ç')
    WHEN nom LIKE '%Ã»%' THEN REPLACE(nom, 'Ã»', 'û')
    ELSE nom
END;

UPDATE eleves
SET prenom = CASE
    WHEN prenom LIKE '%Ã©%' THEN REPLACE(prenom, 'Ã©', 'é')
    WHEN prenom LIKE '%Ã¨%' THEN REPLACE(prenom, 'Ã¨', 'è')
    WHEN prenom LIKE '%Ã %' THEN REPLACE(prenom, 'Ã ', 'à')
    WHEN prenom LIKE '%Ã´%' THEN REPLACE(prenom, 'Ã´', 'ô')
    WHEN prenom LIKE '%Ã§%' THEN REPLACE(prenom, 'Ã§', 'ç')
    WHEN prenom LIKE '%Ã»%' THEN REPLACE(prenom, 'Ã»', 'û')
    ELSE prenom
END;

-- 3. Corriger les noms de matières
UPDATE matieres
SET nom = CASE
    WHEN nom = 'MathÃ©matiques' THEN 'Mathématiques'
    WHEN nom = 'FranÃ§ais' THEN 'Français'
    WHEN nom = 'GÃ©ographie' THEN 'Géographie'
    WHEN nom = 'Histoire-GÃ©ographie' THEN 'Histoire-Géographie'
    WHEN nom = 'Ã‰ducation' THEN 'Éducation'
    WHEN nom LIKE '%Ã©%' THEN REPLACE(nom, 'Ã©', 'é')
    WHEN nom LIKE '%Ã¨%' THEN REPLACE(nom, 'Ã¨', 'è')
    WHEN nom LIKE '%Ã %' THEN REPLACE(nom, 'Ã ', 'à')
    ELSE nom
END;

-- 4. Corriger les lieux
UPDATE eleves
SET lieu_naissance = CASE
    WHEN lieu_naissance LIKE '%Ã©%' THEN REPLACE(lieu_naissance, 'Ã©', 'é')
    WHEN lieu_naissance LIKE '%Ã¨%' THEN REPLACE(lieu_naissance, 'Ã¨', 'è')
    WHEN lieu_naissance LIKE '%Ã %' THEN REPLACE(lieu_naissance, 'Ã ', 'à')
    ELSE lieu_naissance
END;

-- 5. Vérifier les résultats
SELECT 'Classes:' as Type, nom, niveau FROM classes;
SELECT 'Matières:' as Type, nom FROM matieres;
SELECT 'Élèves (échantillon):' as Type, nom, prenom FROM eleves LIMIT 10;

-- 6. Si tout est bon, afficher un message
SELECT '✅ Correction des accents terminée !' as Resultat;
