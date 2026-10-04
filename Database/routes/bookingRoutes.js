const express = require('express');
const router = express.Router();
const {
  createBooking, getMyBookings, getBooking, getAllBookings, getTempleBookings,
} = require('../controllers/bookingController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('devotee'), createBooking);
router.get('/my', protect, getMyBookings);
router.get('/temple/mine', protect, authorize('freelancer', 'admin'), getTempleBookings);
router.get('/', protect, authorize('admin'), getAllBookings);
router.get('/:id', protect, getBooking);

module.exports = router;
