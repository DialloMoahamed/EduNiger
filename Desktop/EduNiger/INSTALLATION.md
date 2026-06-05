# Guide d'Installation - Application de Gestion Scolaire (VS Code Edition 💻)

## 📋 Prérequis

Avant de commencer, assure-toi d’avoir installé :

* **Node.js** (version 18 ou +)
  👉 Vérifier :

  ```bash
  node --version
  ```

* **MySQL** (version 8 ou +)
  👉 Vérifier :

  ```bash
  mysql --version
  ```

* **VS Code** (éditeur principal)

* **Extensions VS Code recommandées** :

  * ES7+ React Snippets
  * Prettier
  * MySQL (optionnel mais pratique)

---

## 🚀 Installation complète dans VS Code

### 🧱 Étape 1 : Ouvrir le projet

1. Lance **VS Code**
2. Clique sur :

   ```
   File > Open Folder
   ```
3. Sélectionne ton dossier :

   ```
   school-management
   ```

---

## 🗄️ Étape 2 : Configuration de la base de données

### 👉 Ouvrir le terminal dans VS Code

Raccourci :

```
Ctrl + `
```

---

### 👉 Importer la base de données

⚠️ IMPORTANT : fais ça dans le terminal (pas dans `mysql>`)

```bash
mysql -u root -p < database/schema.sql
```

---

### 👉 Vérifier que tout est OK

Ensuite :

```bash
mysql -u root -p
```

Puis dans MySQL :

```sql
SHOW DATABASES;
USE gestion_scolaire;
SHOW TABLES;
```

---

## ⚙️ Étape 3 : Backend (API)

### 👉 Aller dans le dossier backend

```bash
cd backend
```

---

### 👉 Installer les dépendances

```bash
npm install
```

---

### 👉 Configurer les variables d’environnement

```bash
cp .env.example .env
```

Puis ouvre `.env` dans VS Code et modifie :

```
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=ton_mot_de_passe
DB_NAME=gestion_scolaire
DB_PORT=3306
```

---

### 👉 Lancer le serveur backend

```bash
npm start
```

✅ Serveur disponible sur :

```
http://localhost:3000
```

---

## 🎨 Étape 4 : Frontend (React + Vite)

### 👉 Ouvrir un nouveau terminal dans VS Code

Clique sur ➕ dans le terminal

---

### 👉 Aller dans le dossier frontend

```bash
cd frontend
```

---

### 👉 Installer les dépendances

```bash
npm install
```

---

### 👉 Lancer l’application

```bash
npm run dev
```

✅ Application disponible sur :

```
http://localhost:5173
```

---

## 🔐 Comptes de test

**Admin**

```
admin@ecole.com
Admin123!
```

**Prof**

```
prof@ecole.com
Prof123!
```

---

## 🛠️ Problèmes fréquents (et solutions)

### ❌ mysql: command not found dans VS Code

👉 Solution :

* Redémarre VS Code
* Ou utilise le terminal **CMD / PowerShell**
* Ou ajoute MySQL au PATH

---

### ❌ Port déjà utilisé

**Backend (.env)**

```
PORT=3001
```

**Frontend (vite.config.js)**

```js
server: {
  port: 5174
}
```

---

### ❌ Erreur npm

```bash
rm -rf node_modules
npm install
```

---

## 📁 Structure du projet

```
school-management/
├── backend/
├── frontend/
├── database/
│   └── schema.sql
└── README.md
```

---

## 🚀 Bonus dev (mode pro activé)

### Sauvegarder la base de données

```bash
mysqldump -u root -p gestion_scolaire > backup.sql
```

---

### Build production

**Frontend**

```bash
npm run build
```

**Backend**

```bash
npm install --production
```

---

## 💡 Conseils

* Toujours lancer backend AVANT frontend
* Vérifie ton `.env` si erreur DB
* Utilise VS Code terminal (mais choisis le bon 😏)

---

## 🧠 Conclusion

👉 Tout se fait maintenant **directement dans VS Code**
👉 Terminal + code + DB = même endroit = efficacité max ⚡

---

Si tu veux, prochaine étape :
👉 connecter ton backend à MySQL en mode propre
👉 ou déployer ton projet en ligne 🌍

On peut passer en mode projet sérieux quand tu veux 😎
