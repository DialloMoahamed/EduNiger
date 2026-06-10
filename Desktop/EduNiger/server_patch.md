# Modification à apporter dans backend/server.js

## 1. Importer le middleware (en haut du fichier, avec les autres require)

```js
const tenantMiddleware = require('./middleware/tenant');
```

## 2. Activer le middleware APRÈS cors et body-parser, AVANT toutes les routes

```js
// --- Middlewares globaux ---
app.use(cors());
app.use(express.json());

// ✅ Ajouter cette ligne ici
app.use(tenantMiddleware);

// --- Routes ---
app.use('/api/auth',          authRoutes);
app.use('/api/classes',       classeRoutes);
app.use('/api/eleves',        eleveRoutes);
app.use('/api/matieres',      matiereRoutes);
app.use('/api/notes',         noteRoutes);
app.use('/api/presences',     presenceRoutes);
app.use('/api/emploi',        emploiDuTempsRoutes);
app.use('/api/messages',      messageRoutes);
app.use('/api/parents',       parentRoutes);
app.use('/api/ecole',         ecoleRoutes);
app.use('/api/sms',           smsRoutes);
```

## ⚠️ Exception : les routes publiques (login, register) ne doivent pas
## être bloquées par le tenant. Deux options :

### Option A — Exclure /api/auth du middleware (recommandé)
```js
app.use((req, res, next) => {
  if (req.path.startsWith('/api/auth')) return next();
  tenantMiddleware(req, res, next);
});
```

### Option B — Dans tenantMiddleware, le slug 'pilote' par défaut en dev
## couvre déjà ce cas pendant le développement.
