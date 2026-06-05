# ⚡ CORRECTION FINALE - Noms de Matières

## 🎯 Problème visible sur votre capture
- ❌ "Fran**�**ais" au lieu de "Français"
- ❌ "Histoire-G**�**ographie" au lieu de "Histoire-Géographie"  
- ❌ "Math**�**matiques" au lieu de "Mathématiques"

---

## ✅ SOLUTION 1 : Script Node.js (Recommandé - 30 secondes)

```bash
cd backend
node utils/fixMatieres.js
```

**Ce script va :**
- Afficher les matières avant correction
- Corriger tous les accents
- Afficher les matières après correction

---

## ✅ SOLUTION 2 : Script SQL Direct (1 minute)

```bash
mysql -u root -p < database/fix-matieres.sql
```

**Ou manuellement dans MySQL :**

```bash
mysql -u root -p
```

Puis copiez-collez :

```sql
USE gestion_scolaire;
SET NAMES 'utf8mb4';

UPDATE matieres SET nom = 'Français' WHERE code = 'FR';
UPDATE matieres SET nom = 'Mathématiques' WHERE code = 'MATH';
UPDATE matieres SET nom = 'Histoire-Géographie' WHERE code = 'HG';
UPDATE matieres SET nom = 'Sciences Physiques' WHERE code = 'PC';

-- Vérifier
SELECT id, nom, code FROM matieres;
```

---

## ✅ SOLUTION 3 : Copier-Coller Direct (15 secondes)

Si vous avez déjà MySQL ouvert :

```sql
USE gestion_scolaire;

UPDATE matieres SET nom = 'Mathématiques' WHERE id = 1;
UPDATE matieres SET nom = 'Français' WHERE id = 2;
UPDATE matieres SET nom = 'Sciences Physiques' WHERE id = 3;
UPDATE matieres SET nom = 'SVT' WHERE id = 4;
UPDATE matieres SET nom = 'Histoire-Géographie' WHERE id = 5;
UPDATE matieres SET nom = 'Anglais' WHERE id = 6;
UPDATE matieres SET nom = 'EPS' WHERE id = 7;
UPDATE matieres SET nom = 'Arts Plastiques' WHERE id = 8;

SELECT * FROM matieres;
```

---

## 🔄 ENSUITE : Vider le cache (CRUCIAL !)

### Étape 1 : Fermez COMPLÈTEMENT le navigateur
- Fermez toutes les fenêtres Chrome/Firefox
- Attendez 3 secondes

### Étape 2 : Rouvrez et rechargez
- Rouvrez le navigateur
- Allez sur localhost:5173
- Appuyez sur **Ctrl + Shift + R**

---

## 🎯 Résultat Attendu

Après correction, vous devriez voir dans le tableau des notes :

- ✅ **Français** (au lieu de Fran�ais)
- ✅ **Mathématiques** (au lieu de Math�matiques)
- ✅ **Histoire-Géographie** (au lieu de Histoire-G�ographie)
- ✅ **Sciences Physiques**
- ✅ **Anglais**
- ✅ **SVT**
- ✅ **EPS**

---

## 🆘 Si ça ne marche TOUJOURS pas

### Test en navigation privée :
1. Ouvrez une fenêtre de navigation privée (Ctrl + Shift + N)
2. Allez sur localhost:5173
3. Connectez-vous
4. Vérifiez les matières

**Si ça marche en navigation privée**, c'est le cache !
→ Videz complètement le cache de votre navigateur normal

**Si ça ne marche pas en navigation privée**, c'est la base de données.
→ Exécutez la solution 3 (copier-coller direct)

---

## ✅ Checklist

- [ ] Script `fixMatieres.js` exécuté OU SQL exécuté
- [ ] Navigateur fermé complètement
- [ ] Navigateur rouvert
- [ ] Cache vidé (Ctrl + Shift + R)
- [ ] Page rechargée
- [ ] Matières vérifiées

---

**Temps total : 2 minutes maximum**

Une fois corrigé, les accents s'afficheront correctement partout ! ✨
