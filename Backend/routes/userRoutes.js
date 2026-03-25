const express = require('express');
const { getUserProfile, updateUserProfile, getUsers, deleteUser } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');
const { authorize } = require('../middleware/roleMiddleware');

const router = express.Router();

router.use(protect);

router.get('/profile', getUserProfile);
router.put('/profile', updateUserProfile);

// Owner level routes
router.use(authorize('owner'));
router.get('/', getUsers);
router.delete('/:id', deleteUser);

module.exports = router;
