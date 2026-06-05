# 🚀 DÉMARRAGE RAPIDE

## Installation en 3 étapes

### 1️⃣ Base de données (5 min)
```bash
mysql -u root -p < database/schema.sql
```

### 2️⃣ Backend (2 min)
```bash
cd backend
npm install
npm start
```
→ Serveur sur http://localhost:3000

### 3️⃣ Frontend (2 min)
```bash
cd frontend
npm install
npm run dev
```
→ Application sur http://localhost:5173

## 🔐 Connexion

**Admin:**
- Email: admin@ecole.com
- Mot de passe: Admin123!

**Enseignant:**
- Email: prof@ecole.com
- Mot de passe: Prof123!

## 📁 Structure

```
school-management/
├── backend/          ← API Node.js + Express
│   ├── controllers/  ← Logique métier
│   ├── routes/       ← Routes API
│   ├── middleware/   ← Auth & validation
│   └── server.js     ← Point d'entrée
│
├── frontend/         ← Application React
│   ├── src/
│   │   ├── pages/    ← Écrans principaux
│   │   ├── components/ ← Composants réutilisables
│   │   ├── services/ ← API calls
│   │   └── context/  ← État global
│   └── vite.config.js
│
├── database/
│   └── schema.sql    ← Schéma MySQL + données de test
│
├── README.md         ← Ce fichier
├── INSTALLATION.md   ← Guide détaillé
└── PRESENTATION.md   ← Documentation complète
```

## ✨ Fonctionnalités

✅ Gestion des élèves (CRUD complet)
✅ Gestion des classes
✅ Suivi des présences avec notifications SMS
✅ Saisie des notes et moyennes
✅ Génération de bulletins PDF
✅ Authentification sécurisée (JWT)
✅ Interface responsive
✅ Données de test incluses

## 📊 Technologies

- **Backend:** Node.js, Express, MySQL, JWT, PDFKit
- **Frontend:** React, React Router, Axios, Vite
- **Base de données:** MySQL 8+

## 📚 Documentation

- `INSTALLATION.md` - Guide d'installation détaillé
- `PRESENTATION.md` - Documentation complète du projet
- `README.md` - Vue d'ensemble

## 🔧 Configuration

### Backend (.env)
```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=votre_mot_de_passe
DB_NAME=gestion_scolaire
PORT=3000
JWT_SECRET=votre_secret
```

### Frontend (vite.config.js)
Le proxy API est déjà configuré.

## 🎯 Prochaines étapes

1. Installez Node.js et MySQL si nécessaire
2. Suivez les 3 étapes d'installation ci-dessus
3. Connectez-vous avec les comptes de test
4. Explorez les fonctionnalités :
   - Ajoutez des élèves
   - Créez des classes
   - Enregistrez des présences
   - Saisissez des notes
   - Générez des bulletins

## 🆘 Besoin d'aide ?

1. Consultez `INSTALLATION.md` pour le guide détaillé
2. Vérifiez que MySQL est démarré
3. Vérifiez les logs dans la console
4. Assurez-vous que les ports 3000 et 5173 sont libres

## 📞 Support

- Issues : Créez un ticket
- Email : support@example.com
- Documentation : Voir PRESENTATION.md

## 🎓 Formation recommandée

2-3 heures pour :
- Administrateurs : Gestion complète
- Enseignants : Présences et notes

## 🌟 Points forts

- ✨ Interface moderne et intuitive
- 🔒 Sécurité robuste (JWT, bcrypt)
- 📱 Responsive (desktop, tablette, mobile)
- ⚡ Performance optimisée
- 📄 Documentation complète
- 🧪 Données de test incluses
- 🚀 Prêt pour la production

## 📝 Notes importantes

1. **Changez les mots de passe** en production
2. **Configurez HTTPS** pour la sécurité
3. **Sauvegardez** régulièrement la base de données
4. **Testez** avant de déployer en production

---

**Bon déploiement ! 🎉**

Pour des questions ou suggestions : Consultez PRESENTATION.md
