const express = require('express');
const cors    = require('cors');
const path    = require('path');
require('dotenv').config();

const app = express();

const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:5173,http://localhost:4173,http://localhost').split(',');
app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
    cb(new Error('Not allowed by CORS'));
  },
  credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use('/api/auth',      require('./routes/authRoutes'));
app.use('/api/eleves',    require('./routes/eleveRoutes'));
app.use('/api/classes',   require('./routes/classeRoutes'));
app.use('/api/presences', require('./routes/presenceRoutes'));
app.use('/api/notes',     require('./routes/noteRoutes'));
app.use('/api/ecole',     require('./routes/ecoleRoutes'));
app.use('/api/parent',    require('./routes/parentRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));

app.get('/api', (req, res) => res.json({ message: 'EduNiger API', version: '2.0.0', status: 'active' }));
app.use((req, res) => res.status(404).json({ success: false, message: 'Route non trouvée' }));
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err.message);
  res.status(500).json({ success: false, message: 'Erreur serveur interne' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log('===========================================');
  console.log(`🚀  EduNiger API — http://localhost:${PORT}/api`);
  console.log('===========================================');
});
module.exports = app;
