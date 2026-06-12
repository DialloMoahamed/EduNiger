const express = require('express');
const router  = express.Router();
const jwt     = require('jsonwebtoken');
const ctrl    = require('../controllers/schoolRequestController');

// Middleware super admin (identique à superAdminRoutes)
const authSuperAdmin = (req, res, next) => {
  const h = req.headers.authorization;
  if (!h || !h.startsWith('Bearer '))
    return res.status(401).json({ success: false, message: 'Token manquant' });
  try {
    const d = jwt.verify(h.split(' ')[1], process.env.JWT_SECRET);
    if (d.role !== 'superadmin')
      return res.status(403).json({ success: false, message: 'Accès refusé' });
    req.admin = d;
    next();
  } catch {
    res.status(401).json({ success: false, message: 'Token invalide' });
  }
};

// ── Routes publiques ──────────────────────────────────────────
router.post('/', ctrl.submitRequest);              // Formulaire landing page

// ── Routes protégées super admin ─────────────────────────────
router.get('/',              authSuperAdmin, ctrl.listRequests);
router.get('/pending-count', authSuperAdmin, ctrl.countPending);
router.put('/:id',           authSuperAdmin, ctrl.updateRequest);
router.post('/:id/approve',  authSuperAdmin, ctrl.approveAndOnboard);

module.exports = router;
