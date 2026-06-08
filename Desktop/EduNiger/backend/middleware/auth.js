const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ success: false, message: 'Accès refusé. Token manquant.' });
    }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Token invalide ou expiré.' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Accès réservé à l\'administrateur.' });
  }
  next();
};

const isParent = (req, res, next) => {
  if (req.user.role !== 'parent') {
    return res.status(403).json({ success: false, message: 'Accès réservé aux parents.' });
  }
  next();
};

const isEnseignant = (req, res, next) => {
  if (req.user.role !== 'enseignant') {
    return res.status(403).json({ success: false, message: 'Accès réservé aux enseignants.' });
  }
  next();
};

module.exports = { auth, isAdmin, isParent, isEnseignant };
