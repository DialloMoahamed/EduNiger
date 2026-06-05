const express = require('express');
const router  = express.Router();
const ctrl    = require('../controllers/messageController');
const { auth } = require('../middleware/auth');

router.get('/contacts',                    auth, ctrl.getContacts);
router.get('/conversations',               auth, ctrl.getConversations);
router.get('/non-lus',                     auth, ctrl.getNonLus);
router.get('/conversation/:user_id',       auth, ctrl.getOrCreateConversation);
router.post('/send',                       auth, ctrl.sendMessage);

module.exports = router;
