const express = require('express');
const router  = express.Router();

const {
  register,
  login,
  logout,
  getMe,
  changePassword,
  inviteEmployee,
  acceptInvite,
  requestDeletion,
} = require('../controllers/authController');

const { protect } = require('../middleware/authMiddleware');

router.post('/register',       register);
router.post('/login',          login);
router.post('/accept-invite',  acceptInvite);

router.use(protect); 

router.post  ('/logout',           logout);
router.get   ('/me',               getMe);
router.patch ('/change-password',  changePassword);
router.post  ('/invite-employee',  inviteEmployee);
router.delete('/account',          requestDeletion);

module.exports = router;
