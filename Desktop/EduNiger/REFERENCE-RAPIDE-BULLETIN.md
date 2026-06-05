# 📋 Référence Rapide - Modification du Bulletin

## 🎯 Fichier à modifier
**`backend/utils/bulletinTemplate.js`**

---

## ⚡ Modifications en 30 secondes

### ✏️ Changer le nom de l'école
**Ligne ~15-20 :**
```javascript
ecole: "VOTRE ÉCOLE ICI",
```

### ✏️ Changer le contact
**Ligne ~21 :**
```javascript
contact: "CONTACT : +227 XX XX XX XX",
```

### ✏️ Changer le titre
**Ligne ~25 :**
```javascript
text: "BULLETIN DE NOTES DU 1er TRIMESTRE",
```

### ✏️ Ajouter une matière
**Ligne ~35-45 :**
```javascript
matieres: [
  // ... matières existantes
  { nom: "Nouvelle Matière", coef: 2 },  // ← Ajoutez ici
]
```

### ✏️ Supprimer une matière
**Supprimez ou commentez la ligne :**
```javascript
// { nom: "Conduite", coef: 1 },  // ← Supprimé
```

### ✏️ Changer un coefficient
```javascript
{ nom: "Mathématiques", coef: 5 },  // ← Changé de 3 à 5
```

---

## 🚀 Appliquer les modifications

### Option 1 : Redémarrage manuel
```bash
Ctrl + C          # Arrêter le serveur
npm start         # Redémarrer
```

### Option 2 : Mode développement
```bash
npm run dev       # Le serveur redémarre automatiquement
```

---

## ⚠️ Règles importantes

1. **Toujours mettre une virgule** après chaque ligne
   ```javascript
   { nom: "Français", coef: 4 },  ← Virgule ici
   ```

2. **SAUF sur la dernière ligne**
   ```javascript
   { nom: "Conduite", coef: 1 }   ← Pas de virgule
   ```

3. **Fermer les guillemets**
   ```javascript
   { nom: "Français", ... }  ← Guillemets fermés
   ```

4. **Respecter la casse**
   ```javascript
   nom: "Mathématiques"   ← Majuscule + accent
   ```

---

## 🔍 Où trouver quoi ?

| Ce que je veux modifier | Ligne approximative |
|-------------------------|---------------------|
| Nom de l'école | ~15-20 |
| Contact | ~21 |
| Titre du bulletin | ~25 |
| Matières | ~35-45 |
| Appréciations | ~80-90 |
| Couleurs | ~100 |
| Tailles de police | ~110 |

---

## 📝 Template vide à remplir

```javascript
const BULLETIN_CONFIG = {
  header: {
    title: "_______________",           // Pays
    subtitle1: "_______________",       // Ministère
    subtitle2: "_______________",       // Région
    subtitle3: "_______________",       // Direction
    ecole: "_______________",           // Nom école
    contact: "_______________",         // Téléphone
  },
  
  matieres: [
    { nom: "_______________", coef: _ },
    { nom: "_______________", coef: _ },
    { nom: "_______________", coef: _ },
    // Ajoutez autant que nécessaire
  ]
};
```

---

## ✅ Checklist avant de modifier

- [ ] J'ai fait une sauvegarde du fichier
- [ ] J'ai ouvert le bon fichier (`bulletinTemplate.js`)
- [ ] Je sais comment redémarrer le serveur
- [ ] J'ai lu les règles ci-dessus

---

## 🆘 En cas d'erreur

### Le serveur ne démarre pas
1. Vérifiez les virgules
2. Vérifiez les guillemets
3. Restaurez la sauvegarde

### Le bulletin est vide
Vérifiez que les noms de matières correspondent à ceux dans la base de données.

### Les accents ne s'affichent pas
Consultez `FIX-ACCENTS.md`

---

## 📚 Pour aller plus loin

- **Guide complet :** `GUIDE-BULLETIN.md`
- **Configurations prêtes :** `CONFIGS-BULLETIN.md`
- **Documentation complète :** `PRESENTATION.md`

---

## 💡 Astuce pro

Testez toujours sur un élève test avant de générer tous les bulletins !

---

**Dernière mise à jour : Avril 2026**
