const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/authController');
const { auth, isAdmin } = require('../middleware/auth');

// Public
router.post('/login',                   ctrl.login);
router.post('/forgot-password',         ctrl.forgotPassword);
router.get('/reset-password/:token',    ctrl.verifyResetToken);
router.post('/reset-password',          ctrl.resetPassword);

// Authentifié — profil personnel
router.get('/profile',          auth, ctrl.getProfile);
router.put('/profile',          auth, ctrl.updateProfile);
router.post('/profile/photo',   auth, ctrl.uploadPhoto);
router.post('/change-password', auth, ctrl.changePassword);

// Admin — gestion utilisateurs
router.get('/users',        auth, isAdmin, ctrl.getUsers);
router.post('/register',    auth, isAdmin, ctrl.register);
router.put('/users/:id',    auth, isAdmin, ctrl.updateUser);
router.delete('/users/:id', auth, isAdmin, ctrl.deleteUser);

module.exports = router;
