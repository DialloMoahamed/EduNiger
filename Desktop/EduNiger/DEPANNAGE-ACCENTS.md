# 🆘 DÉPANNAGE - Accents qui ne fonctionnent pas

## Étape 1 : DIAGNOSTIC (1 minute)

### Exécutez le script de diagnostic :

```bash
cd backend
node utils/fixEncodingDirect.js
```

**Ce script va :**
- ✅ Vérifier la connexion MySQL
- ✅ Afficher les paramètres d'encodage actuels
- ✅ Montrer les données avant correction
- ✅ Corriger automatiquement
- ✅ Montrer les données après correction

---

## Étape 2 : Si l'erreur est "Cannot find module" (30 sec)

```bash
cd backend
npm install
node utils/fixEncodingDirect.js
```

---

## Étape 3 : Si l'erreur est "Access denied" (1 min)

### Vérifiez votre fichier `.env` :

```bash
cd backend
cat .env
```

**Assurez-vous que :**
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe_mysql  ← IMPORTANT
DB_NAME=gestion_scolaire
DB_PORT=3306
```

**Modifiez le mot de passe si nécessaire :**
```bash
nano .env
# ou
notepad .env
```

Puis réessayez :
```bash
node utils/fixEncodingDirect.js
```

---

## Étape 4 : Correction MANUELLE via MySQL (2 min)

Si le script Node.js ne fonctionne pas, corrigez directement dans MySQL :

### 1. Connectez-vous à MySQL :
```bash
mysql -u root -p
```

### 2. Exécutez ces commandes UNE PAR UNE :

```sql
USE gestion_scolaire;

-- Forcer l'encodage
SET NAMES 'utf8mb4';
SET CHARACTER SET utf8mb4;

-- Corriger les classes
UPDATE classes 
SET nom = CONVERT(CAST(CONVERT(nom USING latin1) AS BINARY) USING utf8mb4)
WHERE nom LIKE '%Ã%';

UPDATE classes 
SET niveau = CONVERT(CAST(CONVERT(niveau USING latin1) AS BINARY) USING utf8mb4)
WHERE niveau LIKE '%Ã%';

-- Corriger les élèves
UPDATE eleves 
SET nom = CONVERT(CAST(CONVERT(nom USING latin1) AS BINARY) USING utf8mb4)
WHERE nom LIKE '%Ã%';

UPDATE eleves 
SET prenom = CONVERT(CAST(CONVERT(prenom USING latin1) AS BINARY) USING utf8mb4)
WHERE prenom LIKE '%Ã%';

-- Corriger les matières
UPDATE matieres 
SET nom = CONVERT(CAST(CONVERT(nom USING latin1) AS BINARY) USING utf8mb4)
WHERE nom LIKE '%Ã%';

-- Vérifier
SELECT nom, niveau FROM classes LIMIT 5;
SELECT nom, prenom FROM eleves LIMIT 5;
SELECT nom FROM matieres LIMIT 5;
```

### 3. Si vous voyez toujours des caractères bizarres :

```sql
-- Solution alternative : remplacement direct
UPDATE classes SET nom = REPLACE(nom, 'Ã¨me', 'ème');
UPDATE classes SET nom = REPLACE(nom, 'Ã©', 'é');
UPDATE classes SET niveau = REPLACE(niveau, 'CollÃ¨ge', 'Collège');
UPDATE classes SET niveau = REPLACE(niveau, 'LycÃ©e', 'Lycée');

UPDATE matieres SET nom = REPLACE(nom, 'MathÃ©matiques', 'Mathématiques');
UPDATE matieres SET nom = REPLACE(nom, 'FranÃ§ais', 'Français');
UPDATE matieres SET nom = REPLACE(nom, 'GÃ©ographie', 'Géographie');

-- Vérifier à nouveau
SELECT * FROM classes;
SELECT * FROM matieres;
```

---

## Étape 5 : VIDER LE CACHE (CRUCIAL !)

**Le navigateur garde en cache les anciennes données !**

### Méthode 1 : Rechargement forcé
```
Ctrl + Shift + R  (Windows/Linux)
Cmd + Shift + R   (Mac)
```

### Méthode 2 : Vider complètement le cache
1. F12 (Outils développeur)
2. Cliquez sur l'onglet "Application" ou "Stockage"
3. "Effacer les données du site"

### Méthode 3 : Mode navigation privée
1. Ouvrez une fenêtre privée (Ctrl + Shift + N)
2. Allez sur localhost:5173
3. Testez

### Méthode 4 : Fermer et rouvrir le navigateur
1. Fermez COMPLÈTEMENT Chrome/Firefox
2. Rouvrez
3. Rechargez l'application

---

## Étape 6 : Redémarrer les serveurs (30 sec)

### Backend :
```bash
cd backend
# Appuyez sur Ctrl+C pour arrêter
npm start
```

### Frontend :
```bash
cd frontend
# Appuyez sur Ctrl+C pour arrêter
npm run dev
```

---

## Étape 7 : Vérification finale

### Dans le navigateur :

1. Rechargez la page (Ctrl + Shift + R)
2. Vérifiez la NAVIGATION :
   - "Élèves" ✅
   - "Présences" ✅
   - "Tableau de bord" ✅

3. Vérifiez les CLASSES :
   - "6ème A" ✅
   - "Collège" ✅

4. Vérifiez les ÉLÈVES :
   - Noms avec accents corrects ✅

---

## 🆘 Si RIEN ne marche

### Solution NUCLÉAIRE : Recréer les données de test

```sql
-- Se connecter à MySQL
mysql -u root -p

-- Supprimer les données
USE gestion_scolaire;
DELETE FROM notes;
DELETE FROM presences;
DELETE FROM eleves;
DELETE FROM classes;
DELETE FROM matieres;

-- Réinsérer avec le bon encodage
SET NAMES 'utf8mb4';

-- Classes
INSERT INTO classes (nom, niveau, annee_scolaire, enseignant_id) VALUES
('6ème A', 'Collège', '2025-2026', 2),
('5ème B', 'Collège', '2025-2026', 3),
('CM2 A', 'Primaire', '2025-2026', 2);

-- Matières
INSERT INTO matieres (nom, code, coefficient) VALUES
('Mathématiques', 'MATH', 4),
('Français', 'FR', 3),
('Histoire-Géographie', 'HG', 2);

-- Élèves
INSERT INTO eleves (matricule, nom, prenom, date_naissance, sexe, classe_id) VALUES
('2025001', 'DIALLO', 'Aïcha', '2012-05-15', 'F', 1),
('2025002', 'TOURÉ', 'Mamadou', '2012-08-22', 'M', 1);

-- Vérifier
SELECT * FROM classes;
SELECT * FROM matieres;
SELECT * FROM eleves;
```

---

## 📋 Checklist de dépannage

- [ ] Script `fixEncodingDirect.js` exécuté
- [ ] Mot de passe MySQL correct dans `.env`
- [ ] Correction manuelle SQL exécutée
- [ ] Cache navigateur vidé (Ctrl + Shift + R)
- [ ] Navigateur fermé et rouvert
- [ ] Backend redémarré
- [ ] Frontend redémarré
- [ ] Testé en navigation privée

---

## 💬 Pour obtenir de l'aide

**Si rien ne fonctionne, envoyez :**

1. Le résultat de cette commande :
```bash
cd backend
node utils/fixEncodingDirect.js
```

2. Une capture d'écran du problème

3. Le résultat de :
```bash
cd backend
cat .env
```

4. Le résultat dans MySQL :
```sql
USE gestion_scolaire;
SELECT nom, niveau FROM classes LIMIT 3;
```

---

**Dernière mise à jour : Avril 2026**
