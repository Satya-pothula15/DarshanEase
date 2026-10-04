const express = require('express');
const router = express.Router();
const { getUsers, createOrganizer, deactivateUser, getStats } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/stats', protect, authorize('admin'), getStats);
router.get('/', protect, authorize('admin'), getUsers);
router.post('/organizers', protect, authorize('admin'), createOrganizer);
router.delete('/:id', protect, authorize('admin'), deactivateUser);

module.exports = router;
