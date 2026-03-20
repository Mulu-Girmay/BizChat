const express = require('express');
const { getUserProfile, updateUserProfile, getUsers } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Admin / Owner level routes
router.use(authorize('owner', 'admin'));
router.get('/', getUsers);

module.exports = router;
