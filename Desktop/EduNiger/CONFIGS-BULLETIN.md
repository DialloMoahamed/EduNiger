# 🎨 Configurations Prêtes à l'Emploi

Copiez-collez ces configurations dans `backend/utils/bulletinTemplate.js`

---

## 📋 Configuration 1 : Niger - Collège

```javascript
const BULLETIN_CONFIG = {
  header: {
    title: "RÉPUBLIQUE DU NIGER",
    subtitle1: "MINISTÈRE DE L'ÉDUCATION NATIONALE",
    subtitle2: "RÉGION DE NIAMEY",
    subtitle3: "DIRECTION RÉGIONALE DE L'ÉDUCATION NATIONALE",
    subtitle4: "DIRECTION DÉPARTEMENTALE DE L'ÉDUCATION NATIONALE DE NIAMEY",
    subtitle5: "INSPECTION DE L'ENSEIGNEMENT SECONDAIRE CYCLE 1",
    ecole: "COLLÈGE D'ENSEIGNEMENT GÉNÉRAL",
    contact: "CONTACT : +227 96 59 10 29",
  },
  
  title: {
    text: "BULLETIN DE NOTES DU 1er SEMESTRE",
    fontSize: 14,
    bold: true
  },
  
  matieres: [
    { nom: "Français", coef: 4 },
    { nom: "Anglais", coef: 2 },
    { nom: "Histoire-Géographie", coef: 2 },
    { nom: "Mathématiques", coef: 3 },
    { nom: "Sciences Physiques", coef: 2 },
    { nom: "SVT", coef: 2 },
    { nom: "Éducation Familiale", coef: 1 },
    { nom: "EPS", coef: 1 },
    { nom: "Conduite", coef: 1 }
  ],
  
  tableauHonneur: {
    conduite: ["BIEN", "ASSEZ BIEN", "PASSABLE", "AVERTISSEMENT", "BLÂME"],
    travail: ["BIEN", "ASSEZ BIEN", "PASSABLE", "AVERTISSEMENT", "BLÂME"],
    options: ["Non Inscrit", "Inscrit", "Félicitations", "Encouragements"]
  }
};
```

---

## 📋 Configuration 2 : Bénin - Collège

```javascript
const BULLETIN_CONFIG = {
  header: {
    title: "RÉPUBLIQUE DU BÉNIN",
    subtitle1: "MINISTÈRE DES ENSEIGNEMENTS SECONDAIRE",
    subtitle2: "DÉPARTEMENT DU LITTORAL",
    subtitle3: "DIRECTION DÉPARTEMENTALE DE L'ENSEIGNEMENT",
    subtitle4: "CIRCONSCRIPTION SCOLAIRE DE COTONOU",
    ecole: "COLLÈGE D'ENSEIGNEMENT GÉNÉRAL CADJÈHOUN",
    contact: "CONTACT : +229 21 30 40 50",
  },
  
  title: {
    text: "BULLETIN TRIMESTRIEL",
    fontSize: 14,
    bold: true
  },
  
  matieres: [
    { nom: "Français", coef: 5 },
    { nom: "Mathématiques", coef: 4 },
    { nom: "Anglais", coef: 3 },
    { nom: "Histoire-Géo", coef: 3 },
    { nom: "Physique-Chimie", coef: 3 },
    { nom: "SVT", coef: 3 },
    { nom: "Technologie", coef: 2 },
    { nom: "EPS", coef: 2 },
    { nom: "Arts", coef: 1 }
  ]
};
```

---

## 📋 Configuration 3 : Côte d'Ivoire - Lycée

```javascript
const BULLETIN_CONFIG = {
  header: {
    title: "RÉPUBLIQUE DE CÔTE D'IVOIRE",
    subtitle1: "MINISTÈRE DE L'ÉDUCATION NATIONALE",
    subtitle2: "DIRECTION RÉGIONALE D'ABIDJAN",
    subtitle3: "INSPECTION DE L'ENSEIGNEMENT SECONDAIRE",
    ecole: "LYCÉE MODERNE D'ABIDJAN",
    contact: "CONTACT : +225 27 20 00 00 00",
  },
  
  title: {
    text: "BULLETIN SEMESTRIEL - SÉRIE D",
    fontSize: 14,
    bold: true
  },
  
  matieres: [
    { nom: "Philosophie", coef: 2 },
    { nom: "Français", coef: 3 },
    { nom: "Mathématiques", coef: 5 },
    { nom: "Sciences Physiques", coef: 5 },
    { nom: "SVT", coef: 4 },
    { nom: "Histoire-Géo", coef: 2 },
    { nom: "Anglais", coef: 2 },
    { nom: "Allemand", coef: 2 },
    { nom: "EPS", coef: 1 }
  ]
};
```

---

## 📋 Configuration 4 : Sénégal - Collège

```javascript
const BULLETIN_CONFIG = {
  header: {
    title: "RÉPUBLIQUE DU SÉNÉGAL",
    subtitle1: "MINISTÈRE DE L'ÉDUCATION NATIONALE",
    subtitle2: "ACADÉMIE DE DAKAR",
    subtitle3: "INSPECTION DE L'ÉDUCATION ET DE LA FORMATION",
    ecole: "COLLÈGE D'ENSEIGNEMENT MOYEN",
    contact: "CONTACT : +221 33 800 00 00",
  },
  
  title: {
    text: "BULLETIN DE NOTES - 1er SEMESTRE",
    fontSize: 14,
    bold: true
  },
  
  matieres: [
    { nom: "Français", coef: 5 },
    { nom: "Mathématiques", coef: 4 },
    { nom: "Anglais", coef: 3 },
    { nom: "Arabe", coef: 2 },
    { nom: "Sciences Physiques", coef: 3 },
    { nom: "SVT", coef: 3 },
    { nom: "Histoire-Géo", coef: 3 },
    { nom: "Éducation Civique", coef: 1 },
    { nom: "EPS", coef: 2 }
  ]
};
```

---

## 📋 Configuration 5 : Burkina Faso - Lycée

```javascript
const BULLETIN_CONFIG = {
  header: {
    title: "BURKINA FASO",
    subtitle1: "Unité - Progrès - Justice",
    subtitle2: "MINISTÈRE DE L'ÉDUCATION NATIONALE",
    subtitle3: "DIRECTION RÉGIONALE DE L'ENSEIGNEMENT",
    ecole: "LYCÉE PROVINCIAL DE OUAGADOUGOU",
    contact: "CONTACT : +226 25 30 00 00",
  },
  
  title: {
    text: "BULLETIN ANNUEL",
    fontSize: 15,
    bold: true
  },
  
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
};
```

---

## 📋 Configuration 6 : Mali - Enseignement Fondamental

```javascript
const BULLETIN_CONFIG = {
  header: {
    title: "RÉPUBLIQUE DU MALI",
    subtitle1: "Un Peuple - Un But - Une Foi",
    subtitle2: "MINISTÈRE DE L'ÉDUCATION NATIONALE",
    subtitle3: "ACADÉMIE D'ENSEIGNEMENT DE BAMAKO",
    ecole: "ÉCOLE FONDAMENTALE",
    contact: "CONTACT : +223 20 22 00 00",
  },
  
  title: {
    text: "BULLETIN DE NOTES - 9ème ANNÉE",
    fontSize: 14,
    bold: true
  },
  
  matieres: [
    { nom: "Français", coef: 5 },
    { nom: "Mathématiques", coef: 4 },
    { nom: "Anglais", coef: 2 },
    { nom: "Sciences Physiques", coef: 3 },
    { nom: "Sciences Naturelles", coef: 3 },
    { nom: "Histoire-Géo", coef: 3 },
    { nom: "Éducation Civique et Morale", coef: 2 },
    { nom: "Arts", coef: 1 },
    { nom: "EPS", coef: 2 }
  ]
};
```

---

## 📋 Configuration 7 : Togo - Lycée Technique

```javascript
const BULLETIN_CONFIG = {
  header: {
    title: "RÉPUBLIQUE TOGOLAISE",
    subtitle1: "Travail - Liberté - Patrie",
    subtitle2: "MINISTÈRE DES ENSEIGNEMENTS TECHNIQUES",
    subtitle3: "DIRECTION RÉGIONALE DE LOMÉ",
    ecole: "LYCÉE TECHNIQUE INDUSTRIEL",
    contact: "CONTACT : +228 22 00 00 00",
  },
  
  title: {
    text: "BULLETIN SEMESTRIEL - BAC PRO",
    fontSize: 14,
    bold: true
  },
  
  matieres: [
    { nom: "Français", coef: 3 },
    { nom: "Mathématiques", coef: 4 },
    { nom: "Anglais", coef: 2 },
    { nom: "Technologie", coef: 7 },
    { nom: "Atelier", coef: 6 },
    { nom: "Électricité", coef: 5 },
    { nom: "Mécanique", coef: 5 },
    { nom: "Dessin Technique", coef: 4 },
    { nom: "EPS", coef: 2 }
  ]
};
```

---

## 🎯 Comment utiliser ces configurations

### Étape 1 : Choisir une configuration

Sélectionnez la configuration qui correspond à votre établissement.

### Étape 2 : Copier

Copiez toute la section `const BULLETIN_CONFIG = { ... };`

### Étape 3 : Remplacer

1. Ouvrez `backend/utils/bulletinTemplate.js`
2. Trouvez la section existante `const BULLETIN_CONFIG = {`
3. Remplacez-la par la nouvelle configuration

### Étape 4 : Personnaliser

Modifiez les détails spécifiques :

- Nom de l'école
- Numéro de contact
- Matières si nécessaire

### Étape 5 : Tester

1. Sauvegardez le fichier
2. Redémarrez le serveur
3. Générez un bulletin test

---

## 🔧 Modifications rapides communes

### Changer l'année scolaire

Dans toutes les configurations, cherchez :

```javascript
doc.text('ANNÉE SCOLAIRE : 2025-2026', ...)
```

Remplacez par votre année.

### Changer la période

```javascript
title: {
  text: "BULLETIN DE NOTES DU 1er TRIMESTRE",  // ← Modifiez ici
}
```

Options :

- `1er TRIMESTRE`
- `2ème TRIMESTRE`
- `3ème TRIMESTRE`
- `1er SEMESTRE`
- `2nd SEMESTRE`
- `BULLETIN ANNUEL`

### Ajouter votre logo

```javascript
header: {
  logo: {
    enabled: true,
    width: 60,
    height: 60,
    path: "/chemin/vers/votre/logo.png"  // ← Ajoutez le chemin
  }
}
```

---

## 💡 Conseils

1. **Testez d'abord** avec la configuration par défaut
2. **Sauvegardez** votre configuration actuelle avant modification
3. **Modifiez progressivement** une section à la fois
4. **Vérifiez** après chaque modification

---

## 📞 Support

Consultez `GUIDE-BULLETIN.md` pour :

- Explications détaillées
- Résolution de problèmes
- Personnalisations avancées

---

**🎉 Choisissez votre configuration et personnalisez votre bulletin !**
