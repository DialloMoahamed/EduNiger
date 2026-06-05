# 📄 Guide de Personnalisation du Bulletin Scolaire

## 🎯 Vue d'ensemble

Le bulletin scolaire est 100% personnalisable ! Tous les textes, matières, coefficients, et mise en page peuvent être modifiés facilement.

## 📁 Fichier à modifier

**Fichier principal :** `backend/utils/bulletinTemplate.js`

Ce fichier contient toute la configuration du bulletin dans l'objet `BULLETIN_CONFIG`.

---

## 🔧 Sections Modifiables

### 1️⃣ En-tête du bulletin

```javascript
header: {
  title: "RÉPUBLIQUE DU NIGER",                    // ← Changez ici
  subtitle1: "MINISTÈRE DE L'ÉDUCATION NATIONALE", // ← Changez ici
  subtitle2: "RÉGION DE NIAMEY",                   // ← Changez ici
  subtitle3: "DIRECTION RÉGIONALE...",             // ← Changez ici
  subtitle4: "DIRECTION DÉPARTEMENTALE...",        // ← Changez ici
  subtitle5: "INSPECTION DE L'ENSEIGNEMENT...",    // ← Changez ici
  ecole: "COMPLEXE D'ENSEIGNEMENT...",             // ← Nom de votre école
  contact: "CONTACT : 96 59 10 29",                // ← Votre contact
}
```

**Comment modifier :**
1. Ouvrez `backend/utils/bulletinTemplate.js`
2. Trouvez la section `header:`
3. Modifiez les textes entre guillemets `"..."`
4. Sauvegardez le fichier
5. Redémarrez le serveur

**Exemple de personnalisation :**
```javascript
header: {
  title: "RÉPUBLIQUE DU BÉNIN",
  subtitle1: "MINISTÈRE DES ENSEIGNEMENTS",
  subtitle2: "RÉGION DE COTONOU",
  ecole: "COLLÈGE D'ENSEIGNEMENT GÉNÉRAL DE CADJEHOUN",
  contact: "CONTACT : +229 21 30 40 50",
}
```

---

### 2️⃣ Titre du bulletin

```javascript
title: {
  text: "BULLETIN DE NOTES DU 2nd SEMESTRE", // ← Changez le titre
  fontSize: 14,                                // ← Taille de la police
  bold: true                                   // ← En gras (true/false)
}
```

**Exemples :**
```javascript
// Pour le 1er trimestre
text: "BULLETIN DE NOTES DU 1er TRIMESTRE"

// Pour l'année complète
text: "BULLETIN ANNUEL - ANNÉE SCOLAIRE 2025-2026"

// Avec une plus grande police
fontSize: 16
```

---

### 3️⃣ Matières et Coefficients

```javascript
matieres: [
  { nom: "Français", coef: 4 },           // ← Matière 1
  { nom: "Anglais", coef: 2 },            // ← Matière 2
  { nom: "Histoire-Géo", coef: 2 },       // ← Matière 3
  { nom: "Mathématiques", coef: 3 },      // ← Matière 4
  // ... ajoutez ou supprimez des matières
]
```

**🔴 IMPORTANT - Règles :**
- Chaque ligne est une matière
- Format : `{ nom: "NomMatière", coef: Nombre }`
- N'oubliez pas la virgule `,` à la fin de chaque ligne
- Sauf pour la dernière ligne (pas de virgule)

**Comment ajouter une matière :**
```javascript
matieres: [
  { nom: "Français", coef: 4 },
  { nom: "Anglais", coef: 2 },
  { nom: "Espagnol", coef: 2 },          // ← Nouvelle matière ajoutée
  { nom: "Mathématiques", coef: 3 }      // ← Pas de virgule sur la dernière
]
```

**Comment supprimer une matière :**
Supprimez simplement la ligne complète.

**Comment changer un coefficient :**
```javascript
{ nom: "Mathématiques", coef: 5 }  // ← Coef changé de 3 à 5
```

**Exemples de configurations :**

**Pour un collège :**
```javascript
matieres: [
  { nom: "Français", coef: 5 },
  { nom: "Mathématiques", coef: 4 },
  { nom: "Anglais", coef: 3 },
  { nom: "Histoire-Géographie", coef: 3 },
  { nom: "Sciences Physiques", coef: 3 },
  { nom: "SVT", coef: 3 },
  { nom: "Technologie", coef: 2 },
  { nom: "Arts Plastiques", coef: 1 },
  { nom: "Musique", coef: 1 },
  { nom: "EPS", coef: 2 }
]
```

**Pour un lycée :**
```javascript
matieres: [
  { nom: "Philosophie", coef: 3 },
  { nom: "Français", coef: 4 },
  { nom: "Mathématiques", coef: 5 },
  { nom: "Physique-Chimie", coef: 4 },
  { nom: "SVT", coef: 3 },
  { nom: "Histoire-Géo", coef: 3 },
  { nom: "Anglais", coef: 3 },
  { nom: "Espagnol", coef: 2 },
  { nom: "EPS", coef: 2 }
]
```

---

### 4️⃣ Colonnes de notes

```javascript
columns: [
  { label: "MC/20", width: 50 },    // ← Moyenne Contrôle
  { label: "NC/20", width: 50 },    // ← Note Composition
  { label: "MS/20", width: 50 },    // ← Moyenne Semestre
  { label: "MS/Coef", width: 60 }   // ← Moyenne × Coefficient
]
```

**Comment modifier les noms :**
```javascript
columns: [
  { label: "Devoir", width: 50 },
  { label: "Examen", width: 50 },
  { label: "Moyenne", width: 50 },
  { label: "Total", width: 60 }
]
```

---

### 5️⃣ Tableau d'honneur et Conduite

```javascript
tableauHonneur: {
  conduite: ["BIEN", "ASSEZ BIEN", "PASSABLE", "AVERTISSEMENT", "BLÂME"],
  travail: ["BIEN", "ASSEZ BIEN", "PASSABLE", "AVERTISSEMENT", "BLÂME"],
  options: ["Non Inscrit", "Inscrit", "Félicitations", "Encouragements"]
}
```

**Comment personnaliser :**
```javascript
tableauHonneur: {
  conduite: ["EXCELLENT", "BIEN", "MOYEN", "MÉDIOCRE"],
  travail: ["EXCELLENT", "BIEN", "MOYEN", "INSUFFISANT"],
  options: ["Tableau d'honneur", "Félicitations", "Encouragements", "Mise en garde"]
}
```

---

### 6️⃣ Appréciations automatiques

```javascript
appreciations: {
  excellent:    { min: 16, text: "Excellent travail" },
  tresBien:     { min: 14, text: "Très bon travail" },
  bien:         { min: 12, text: "Bon travail" },
  assezBien:    { min: 10, text: "Travail satisfaisant" },
  passable:     { min: 8,  text: "Peut mieux faire" },
  insuffisant:  { min: 0,  text: "Travail insuffisant" }
}
```

**Comment modifier :**
```javascript
appreciations: {
  excellent:    { min: 18, text: "Félicitations ! Résultats exceptionnels" },
  tresBien:     { min: 16, text: "Très bon élève, continuez ainsi" },
  bien:         { min: 14, text: "Bon travail, persévérez" },
  assezBien:    { min: 12, text: "Résultats corrects" },
  passable:     { min: 10, text: "Travail moyen, doit progresser" },
  insuffisant:  { min: 0,  text: "Résultats insuffisants, redoublement d'efforts nécessaire" }
}
```

---

### 7️⃣ Couleurs et Polices

```javascript
// Couleurs (format hexadécimal)
colors: {
  header: '#000000',    // Noir
  border: '#000000',    // Noir
  text: '#000000'       // Noir
}

// Polices
fonts: {
  header: { size: 10, bold: true },
  title: { size: 14, bold: true },
  normal: { size: 9 },
  small: { size: 8 }
}
```

**Exemples de couleurs :**
```javascript
colors: {
  header: '#0000FF',    // Bleu
  border: '#333333',    // Gris foncé
  text: '#000000'       // Noir
}
```

**Agrandir les polices :**
```javascript
fonts: {
  header: { size: 12, bold: true },  // Plus grand
  title: { size: 16, bold: true },   // Plus grand
  normal: { size: 10 },              // Plus grand
  small: { size: 9 }                 // Plus grand
}
```

---

## 🎨 Personnalisations Courantes

### ✅ Changer le nom de l'école

```javascript
header: {
  ecole: "VOTRE NOUVEAU NOM D'ÉCOLE ICI",
}
```

### ✅ Modifier l'année scolaire

Dans la fonction `drawHeader`, trouvez :
```javascript
doc.text('ANNÉE SCOLAIRE : 2025-2026', ...)
```

Changez en :
```javascript
doc.text('ANNÉE SCOLAIRE : 2026-2027', ...)
```

### ✅ Ajouter une matière

```javascript
matieres: [
  // ... matières existantes
  { nom: "Informatique", coef: 2 }  // ← Ajoutez ici
]
```

### ✅ Supprimer une matière

Supprimez la ligne complète :
```javascript
// { nom: "EF", coef: 1 },  ← Commentez ou supprimez
```

### ✅ Modifier les périodes

Changez "2nd SEMESTRE" en :
- `"1er SEMESTRE"`
- `"1er TRIMESTRE"`
- `"2ème TRIMESTRE"`
- `"3ème TRIMESTRE"`

---

## 🔄 Appliquer les modifications

### Méthode 1 : Redémarrage du serveur

1. Arrêtez le serveur backend (Ctrl + C)
2. Modifiez le fichier `bulletinTemplate.js`
3. Sauvegardez
4. Redémarrez : `npm start`

### Méthode 2 : Avec Nodemon (développement)

Si vous utilisez `npm run dev` :
- Le serveur redémarre automatiquement
- Sauvegardez simplement le fichier

---

## 🧪 Tester vos modifications

1. Connectez-vous à l'application
2. Allez dans **Notes**
3. Sélectionnez un élève
4. Cliquez sur **Bulletin**
5. Le PDF généré reflétera vos modifications

---

## ⚠️ Erreurs Courantes

### Erreur : "Cannot read property..."

**Cause :** Virgule manquante ou en trop

**Solution :**
```javascript
// ❌ MAUVAIS
{ nom: "Français", coef: 4 }
{ nom: "Anglais", coef: 2 }

// ✅ BON
{ nom: "Français", coef: 4 },
{ nom: "Anglais", coef: 2 }
```

### Erreur : "Unexpected token"

**Cause :** Guillemets mal fermés

**Solution :**
```javascript
// ❌ MAUVAIS
{ nom: "Français, coef: 4 }

// ✅ BON
{ nom: "Français", coef: 4 }
```

### Le bulletin est vide

**Cause :** Nom de matière ne correspond pas

**Solution :** Assurez-vous que les noms dans `BULLETIN_CONFIG.matieres` correspondent exactement aux noms dans la base de données.

---

## 💡 Astuces

### Sauvegarder une copie

Avant de modifier, faites une copie :
```bash
cp backend/utils/bulletinTemplate.js backend/utils/bulletinTemplate.backup.js
```

### Utiliser des commentaires

```javascript
matieres: [
  { nom: "Français", coef: 4 },        // Matière principale
  // { nom: "Latin", coef: 1 },       // Désactivé temporairement
  { nom: "Mathématiques", coef: 3 }
]
```

### Tester progressivement

1. Modifiez une section
2. Testez
3. Modifiez la suivante
4. Testez à nouveau

---

## 📊 Exemples Complets

### Configuration pour un lycée français

```javascript
const BULLETIN_CONFIG = {
  header: {
    title: "RÉPUBLIQUE FRANÇAISE",
    subtitle1: "MINISTÈRE DE L'ÉDUCATION NATIONALE",
    subtitle2: "ACADÉMIE DE PARIS",
    ecole: "LYCÉE HENRI IV",
    contact: "TEL : 01 23 45 67 89"
  },
  
  matieres: [
    { nom: "Philosophie", coef: 3 },
    { nom: "Français", coef: 4 },
    { nom: "Mathématiques", coef: 5 },
    { nom: "Physique-Chimie", coef: 4 },
    { nom: "SVT", coef: 3 },
    { nom: "Histoire-Géo", coef: 3 },
    { nom: "LV1 Anglais", coef: 3 },
    { nom: "LV2 Espagnol", coef: 2 },
    { nom: "EPS", coef: 2 }
  ]
}
```

### Configuration pour un collège

```javascript
const BULLETIN_CONFIG = {
  header: {
    title: "COLLÈGE MODERNE",
    subtitle1: "ENSEIGNEMENT SECONDAIRE",
    ecole: "COLLÈGE DE L'EXCELLENCE",
    contact: "TEL : 90 00 00 00"
  },
  
  title: {
    text: "BULLETIN TRIMESTRIEL",
    fontSize: 15
  },
  
  matieres: [
    { nom: "Français", coef: 5 },
    { nom: "Mathématiques", coef: 4 },
    { nom: "Anglais", coef: 3 },
    { nom: "Sciences Physiques", coef: 3 },
    { nom: "SVT", coef: 3 },
    { nom: "Histoire-Géo", coef: 3 },
    { nom: "Arts", coef: 2 },
    { nom: "Sport", coef: 2 }
  ]
}
```

---

## 🆘 Besoin d'aide ?

### Documentation complète
Consultez `PRESENTATION.md` pour plus de détails sur l'architecture.

### Support
1. Vérifiez les logs du serveur
2. Consultez ce guide
3. Testez avec la configuration par défaut

---

## ✅ Checklist de modification

- [ ] Fichier sauvegardé
- [ ] Virgules vérifiées
- [ ] Guillemets fermés
- [ ] Serveur redémarré
- [ ] Bulletin testé
- [ ] Résultat conforme

---

**🎉 Votre bulletin est maintenant personnalisé !**

Consultez régulièrement ce guide pour adapter le bulletin aux besoins de votre établissement.
