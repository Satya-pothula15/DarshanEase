const { Payment, Booking } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

const ALLOWED_METHODS = ['upi', 'card', 'netbanking', 'wallet'];

// POST /api/payments/create
// Starts a DEMO payment for a pending booking. No card/UPI/bank credentials
// are accepted or stored here — this only records the chosen method.
exports.createPayment = asyncHandler(async (req, res) => {
  const { bookingId, method } = req.body;

  if (!bookingId || !ALLOWED_METHODS.includes(method)) {
    return res.status(400).json({ success: false, message: 'A booking and a valid payment method are required.' });
  }

  const booking = await Booking.findById(bookingId);
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });
  if (booking.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'This booking does not belong to you.' });
  }
  if (booking.bookingStatus !== 'pending') {
    return res.status(400).json({ success: false, message: 'This booking is not awaiting payment.' });
  }

  // A booking should only ever have ONE payment record. If the person
  // switched payment methods, hit "Pay" twice, or came back to this screen
  // after a page reload, reuse the existing not-yet-successful payment
  // instead of creating a second document for the same booking.
  let payment = await Payment.findOne({ booking: booking._id, status: { $ne: 'success' } });
  if (payment) {
    payment.method = method;
    payment.amount = booking.totalAmount;
    await payment.save();
  } else {
    payment = await Payment.create({
      booking: booking._id,
      user: req.user._id,
      amount: booking.totalAmount,
      method,
      status: 'initiated',
    });
  }

  booking.payment = payment._id;
  await booking.save();

  res.status(201).json({ success: true, payment, demo: true });
});

// POST /api/payments/verify
// DEMO ONLY: simulates the gateway callback and marks the payment + booking
// as successful/confirmed. A real integration (e.g. Razorpay) would verify
// a signature here instead of trusting the client.
exports.verifyPayment = asyncHandler(async (req, res) => {
  const { paymentId } = req.body;

  const existing = await Payment.findById(paymentId);
  if (!existing) return res.status(404).json({ success: false, message: 'Payment not found.' });
  if (existing.user.toString() !== req.user._id.toString()) {
    return res.status(403).json({ success: false, message: 'This payment does not belong to you.' });
  }

  // Atomic flip so two near-simultaneous "Pay" clicks (or a retry after a
  // slow response) can't both succeed and double-confirm the booking.
  const payment = await Payment.findOneAndUpdate(
    { _id: paymentId, status: { $ne: 'success' } },
    {
      status: 'success',
      transactionId: `DEMO-${Date.now()}-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    },
    { new: true }
  );

  if (!payment) {
    // Someone already confirmed this exact payment — return the existing record, not an error.
    return res.json({ success: true, payment: existing, message: 'Already confirmed.' });
  }

  const booking = await Booking.findById(payment.booking);
  if (booking && booking.bookingStatus !== 'confirmed') {
    booking.bookingStatus = 'confirmed';
    await booking.save();
  }

  res.json({ success: true, payment, booking, message: 'Demo payment successful.' });
});

// GET /api/payments  (admin)
exports.getAllPayments = asyncHandler(async (req, res) => {
  const payments = await Payment.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email')
    .populate('booking');
  res.json({ success: true, count: payments.length, payments });
});
