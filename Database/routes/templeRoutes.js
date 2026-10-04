const express = require('express');
const router = express.Router();
const {
  getTemples, getTemple, getTempleSlots, createTemple, updateTemple, deleteTemple,
} = require('../controllers/templeController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getTemples);
router.get('/:id', getTemple);
router.get('/:id/slots', getTempleSlots);

router.post('/', protect, authorize('admin'), createTemple);
router.put('/:id', protect, authorize('admin', 'freelancer'), updateTemple);
router.delete('/:id', protect, authorize('admin'), deleteTemple);

module.exports = router;
