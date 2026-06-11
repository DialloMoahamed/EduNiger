const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const ctrl    = require('../controllers/superAdminController');

// ── Middleware auth super admin ───────────────────────────────
const authSuperAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Token manquant' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    if (decoded.role !== 'superadmin')
      return res.status(403).json({ success: false, message: 'Accès réservé aux super admins' });
    req.admin = decoded;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalide ou expiré' });
  }
};

// ── Routes ────────────────────────────────────────────────────
router.post('/login',                       ctrl.login);

router.get('/stats',                        authSuperAdmin, ctrl.getStats);
router.get('/schools',                      authSuperAdmin, ctrl.getSchools);
router.post('/schools/onboard',             authSuperAdmin, ctrl.onboardSchool);
router.post('/schools/:id/renew',           authSuperAdmin, ctrl.renewSchool);
router.post('/schools/:id/toggle',          authSuperAdmin, ctrl.toggleSchool);
router.get('/pricing',                      authSuperAdmin, ctrl.getPricing);
router.put('/pricing',                      authSuperAdmin, ctrl.updatePricing);

module.exports = router;