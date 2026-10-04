const express = require('express');
const router = express.Router();
const { createSlot, updateSlot, deleteSlot, getMySlots } = require('../controllers/slotController');
const { protect, authorize } = require('../middleware/auth');

router.get('/mine', protect, authorize('freelancer', 'admin'), getMySlots);
router.post('/', protect, authorize('freelancer', 'admin'), createSlot);
router.put('/:id', protect, authorize('freelancer', 'admin'), updateSlot);
router.delete('/:id', protect, authorize('freelancer', 'admin'), deleteSlot);

module.exports = router;
