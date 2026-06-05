# 🎬 Tutoriel Pas à Pas - Personnalisation du Bulletin

## Exemple : Changer "Niger" en "Bénin" et ajouter "Informatique"

### 🎯 Objectif
Transformer le bulletin du Niger en bulletin du Bénin et ajouter la matière Informatique.

---

## 📍 Étape 1 : Localiser le fichier (30 secondes)

### Action :
1. Ouvrez votre explorateur de fichiers
2. Allez dans le dossier du projet : `school-management`
3. Ouvrez : `backend` → `utils` → `bulletinTemplate.js`

### Résultat attendu :
Vous voyez un fichier JavaScript avec beaucoup de texte.

---

## 📍 Étape 2 : Faire une sauvegarde (15 secondes)

### Action :
1. **Clic droit** sur `bulletinTemplate.js`
2. Cliquez sur **Copier**
3. **Clic droit** dans le même dossier
4. Cliquez sur **Coller**
5. Renommez en `bulletinTemplate.BACKUP.js`

### Résultat attendu :
Vous avez maintenant 2 fichiers :
- `bulletinTemplate.js` (celui qu'on va modifier)
- `bulletinTemplate.BACKUP.js` (la sauvegarde)

---

## 📍 Étape 3 : Ouvrir avec un éditeur (10 secondes)

### Action :
1. **Clic droit** sur `bulletinTemplate.js`
2. Cliquez sur **Ouvrir avec**
3. Choisissez **Bloc-notes** (ou VS Code, Notepad++, etc.)

### Résultat attendu :
Le fichier s'ouvre dans l'éditeur.

---

## 📍 Étape 4 : Changer "Niger" en "Bénin" (2 minutes)

### Action :

**Trouvez ces lignes (autour de la ligne 15) :**
```javascript
header: {
  title: "RÉPUBLIQUE DU NIGER",
  subtitle1: "MINISTÈRE DE L'ÉDUCATION NATIONALE",
  subtitle2: "RÉGION DE NIAMEY",
```

**Modifiez en :**
```javascript
header: {
  title: "RÉPUBLIQUE DU BÉNIN",
  subtitle1: "MINISTÈRE DES ENSEIGNEMENTS SECONDAIRE",
  subtitle2: "DÉPARTEMENT DU LITTORAL",
```

**Continuez plus bas :**
```javascript
  subtitle3: "DIRECTION RÉGIONALE DE L'ÉDUCATION NATIONALE/N",
```

**Modifiez en :**
```javascript
  subtitle3: "DIRECTION DÉPARTEMENTALE DE L'ENSEIGNEMENT",
```

**Plus bas encore :**
```javascript
  ecole: "COMPLEXE D'ENSEIGNEMENT SECONDAIRE...",
  contact: "CONTACT : 96 59 10 29",
```

**Modifiez en :**
```javascript
  ecole: "COLLÈGE D'ENSEIGNEMENT GÉNÉRAL CADJÈHOUN",
  contact: "CONTACT : +229 21 30 40 50",
```

### Résultat attendu :
L'en-tête mentionne maintenant le Bénin au lieu du Niger.

---

## 📍 Étape 5 : Ajouter "Informatique" (1 minute)

### Action :

**Trouvez la section des matières (autour de la ligne 35) :**
```javascript
matieres: [
  { nom: "Français", coef: 4 },
  { nom: "Anglais", coef: 2 },
  { nom: "Histoire-Géo", coef: 2 },
  { nom: "Mathématiques", coef: 3 },
  { nom: "Sciences Physiques", coef: 2 },
  { nom: "SVT", coef: 2 },
  { nom: "EF", coef: 1 },
  { nom: "EPS", coef: 1 },
  { nom: "Conduite", coef: 1 }
]
```

**Ajoutez "Informatique" AVANT la dernière ligne :**
```javascript
matieres: [
  { nom: "Français", coef: 4 },
  { nom: "Anglais", coef: 2 },
  { nom: "Histoire-Géo", coef: 2 },
  { nom: "Mathématiques", coef: 3 },
  { nom: "Sciences Physiques", coef: 2 },
  { nom: "SVT", coef: 2 },
  { nom: "Informatique", coef: 2 },        ← AJOUTÉ ICI
  { nom: "EF", coef: 1 },
  { nom: "EPS", coef: 1 },
  { nom: "Conduite", coef: 1 }
]
```

**⚠️ IMPORTANT :**
- Notez la **virgule** après `coef: 2 },`
- La dernière ligne (`Conduite`) **n'a PAS de virgule**

### Résultat attendu :
"Informatique" apparaît dans la liste avec un coefficient de 2.

---

## 📍 Étape 6 : Sauvegarder (5 secondes)

### Action :
1. Appuyez sur **Ctrl + S** (ou Cmd + S sur Mac)
2. Fermez l'éditeur

### Résultat attendu :
Le fichier est sauvegardé avec vos modifications.

---

## 📍 Étape 7 : Redémarrer le serveur (30 secondes)

### Action :

**Dans le terminal où le serveur tourne :**

1. Appuyez sur **Ctrl + C** pour arrêter le serveur
2. Tapez : `npm start`
3. Appuyez sur **Entrée**

### Résultat attendu :
Vous voyez :
```
✅ Connexion à la base de données réussie
🚀 Serveur démarré sur le port 3000
```

---

## 📍 Étape 8 : Tester (1 minute)

### Action :

1. Ouvrez l'application dans le navigateur
2. Connectez-vous
3. Allez dans **Notes**
4. Sélectionnez une classe et un élève
5. Cliquez sur **Bulletin**

### Résultat attendu :
Le PDF généré affiche :
- ✅ "RÉPUBLIQUE DU BÉNIN" au lieu de Niger
- ✅ "Informatique" dans la liste des matières
- ✅ Le nouveau numéro de contact

---

## ✅ Récapitulatif

**Ce que vous avez fait :**
1. ✅ Sauvegardé le fichier original
2. ✅ Modifié l'en-tête (Niger → Bénin)
3. ✅ Ajouté une nouvelle matière (Informatique)
4. ✅ Sauvegardé les modifications
5. ✅ Redémarré le serveur
6. ✅ Testé le résultat

**Temps total :** Environ 5 minutes

---

## 🎓 Vous avez maintenant appris à :

- [x] Localiser le bon fichier
- [x] Faire une sauvegarde
- [x] Modifier les textes
- [x] Ajouter une matière
- [x] Respecter la syntaxe (virgules, guillemets)
- [x] Redémarrer le serveur
- [x] Tester vos modifications

---

## 🚀 Pour aller plus loin

### Exercice 1 : Changer le titre
Trouvez :
```javascript
title: {
  text: "BULLETIN DE NOTES DU 2nd SEMESTRE",
```

Changez en :
```javascript
  text: "BULLETIN TRIMESTRIEL - 1er TRIMESTRE",
```

### Exercice 2 : Modifier un coefficient
Changez le coefficient de Mathématiques de 3 à 5 :
```javascript
{ nom: "Mathématiques", coef: 5 },  ← Changé
```

### Exercice 3 : Supprimer une matière
Commentez (ajoutez `//` devant) ou supprimez une ligne :
```javascript
// { nom: "EF", coef: 1 },  ← Désactivé
```

---

## 🐛 Dépannage

### Erreur après modification ?

**1. Vérifiez les virgules**
```javascript
// ❌ MAUVAIS
{ nom: "Français", coef: 4 }
{ nom: "Anglais", coef: 2 }

// ✅ BON
{ nom: "Français", coef: 4 },
{ nom: "Anglais", coef: 2 }
```

**2. Vérifiez les guillemets**
```javascript
// ❌ MAUVAIS
{ nom: "Français, coef: 4 }

// ✅ BON
{ nom: "Français", coef: 4 }
```

**3. Restaurez la sauvegarde**
Si rien ne fonctionne :
1. Supprimez `bulletinTemplate.js`
2. Renommez `bulletinTemplate.BACKUP.js` en `bulletinTemplate.js`
3. Recommencez

---

## 💡 Conseils de pro

1. **Modifiez une chose à la fois**
   - Changez l'en-tête → Testez
   - Ajoutez une matière → Testez
   - Etc.

2. **Utilisez Ctrl+F pour chercher**
   - Appuyez sur `Ctrl + F`
   - Tapez "Niger" pour tout trouver rapidement

3. **Gardez toujours une sauvegarde**
   - Avant chaque modification importante

4. **Testez sur un élève fictif**
   - Avant de générer tous les bulletins

---

## 📞 Besoin d'aide ?

1. **Guide complet :** `GUIDE-BULLETIN.md`
2. **Configurations prêtes :** `CONFIGS-BULLETIN.md`
3. **Référence rapide :** `REFERENCE-RAPIDE-BULLETIN.md`

---

## 🎉 Félicitations !

Vous savez maintenant personnaliser le bulletin scolaire selon vos besoins !

**Prochaine étape :**
Explorez les configurations prêtes à l'emploi dans `CONFIGS-BULLETIN.md`

---

**Durée totale du tutoriel : 5-10 minutes**
**Niveau de difficulté : Débutant ✅**
