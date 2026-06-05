# 📚 EduNiger — Système de Gestion Scolaire

> Plateforme web complète de gestion scolaire pour les établissements primaires et secondaires du Niger et de l'Afrique de l'Ouest.

---

## ✨ Fonctionnalités

| Module | Description |
|---|---|
| 📊 **Tableau de bord** | Statistiques globales, parité, taux de présence en temps réel |
| 👨‍🎓 **Élèves** | Inscription, dossiers complets, recherche et filtrage |
| 🏫 **Classes** | Création, attribution d'enseignants, gestion multi-niveaux |
| 📋 **Présences** | Feuille d'appel quotidienne, statuts (présent/absent/retard/justifié) |
| 📝 **Notes & Bulletins** | Saisie des évaluations, moyennes automatiques, génération PDF |
| 👩‍🏫 **Enseignants** | Gestion des utilisateurs (admin/enseignant) |
| 📈 **Rapports** | Statistiques par niveau, parité, effectifs |
| ⚙️ **Paramètres** | Profil utilisateur, changement de mot de passe |

---

## 🏗️ Stack Technique

- **Frontend** : React 18 + Vite — design professionnel sans dépendances CSS externes
- **Backend** : Node.js + Express.js — API REST sécurisée JWT
- **Base de données** : MySQL 8 — schéma optimisé avec indexes
- **PDF** : PDFKit — bulletins générés côté serveur
- **Docker** : déploiement conteneurisé en une commande

---

## 🚀 Installation rapide

### Prérequis
- Node.js 18+ et npm
- MySQL 8+

### Étape 1 — Base de données
```sql
mysql -u root -p < database/schema.sql
```

### Étape 2 — Backend
```bash
cd backend
cp .env.example .env
# Remplir .env avec vos paramètres DB
npm install
npm start
```

### Étape 3 — Frontend
```bash
cd frontend
cp .env.example .env
npm install
npm run dev      # développement
npm run build    # production → dossier dist/
```

---

## 🐳 Déploiement Docker (recommandé)

```bash
# 1. Cloner le projet
git clone https://github.com/DialloMoahamed/Gestion-scolaire.git
cd Gestion-scolaire

# 2. Lancer tous les services
docker-compose up -d

# 3. Accéder à l'application
# Frontend : http://localhost
# API      : http://localhost:3000/api
```

---

## 🔐 Comptes par défaut

| Rôle | Email | Mot de passe |
|---|---|---|
| Administrateur | admin@ecole.com | Admin123! |
| Enseignant | prof@ecole.com | Prof123! |

> ⚠️ **Changer obligatoirement ces mots de passe en production !**

---

## 📁 Structure du projet

```
EduNiger/
├── frontend/               # Application React
│   ├── src/
│   │   ├── components/     # Sidebar, Topbar
│   │   ├── context/        # AuthContext
│   │   ├── pages/          # Dashboard, Eleves, Classes...
│   │   └── services/       # api.js (Axios)
│   └── Dockerfile
├── backend/                # API Node.js
│   ├── controllers/        # Logique métier
│   ├── routes/             # Endpoints REST
│   ├── middleware/         # Auth JWT
│   ├── utils/              # Génération bulletins PDF
│   └── Dockerfile
├── database/
│   └── schema.sql          # Schéma + données de test
└── docker-compose.yml
```

---

## 🌍 Adapté au contexte Niger

- Terminologie conforme au système éducatif nigérien (Primaire, Collège, Lycée)
- Données de démonstration avec noms locaux (Niamey, Maradi, Zinder...)
- Bulletins avec en-tête "République du Niger"
- Numéros de téléphone au format +227

---

## 📄 Licence

MIT — Libre d'utilisation, modification et distribution.

---

*Développé pour les établissements scolaires du Niger — Version 2.0*
