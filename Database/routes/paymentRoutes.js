const express = require('express');
const router = express.Router();
const { createPayment, verifyPayment, getAllPayments } = require('../controllers/paymentController');
const { protect, authorize } = require('../middleware/auth');

router.post('/create', protect, authorize('devotee'), createPayment);
router.post('/verify', protect, authorize('devotee'), verifyPayment);
router.get('/', protect, authorize('admin'), getAllPayments);

module.exports = router;
