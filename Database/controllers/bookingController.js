const { Booking, DarshanSlot, Temple } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// POST /api/bookings
// Atomically reserves seats on the slot before creating the booking, so two
// simultaneous requests can never push bookedCount past totalCapacity.
exports.createBooking = asyncHandler(async (req, res) => {
  const { darshanSlot: slotId, numberOfTickets, passengers } = req.body;

  if (!slotId || !numberOfTickets || numberOfTickets < 1) {
    return res.status(400).json({ success: false, message: 'A slot and number of tickets are required.' });
  }

  const slot = await DarshanSlot.findById(slotId);
  if (!slot) return res.status(404).json({ success: false, message: 'Darshan slot not found.' });
  if (slot.status !== 'open') {
    return res.status(400).json({ success: false, message: 'This darshan slot is no longer open for booking.' });
  }

  // Atomic capacity check + reservation. $expr lets us compare two fields
  // of the same document inside the query itself.
  const reserved = await DarshanSlot.findOneAndUpdate(
    {
      _id: slotId,
      status: 'open',
      $expr: { $lte: [{ $add: ['$bookedCount', numberOfTickets] }, '$totalCapacity'] },
    },
    { $inc: { bookedCount: numberOfTickets } },
    { new: true }
  );

  if (!reserved) {
    const remaining = Math.max(0, slot.totalCapacity - slot.bookedCount);
    return res.status(400).json({
      success: false,
      message: remaining > 0
        ? `Only ${remaining} seat(s) are available for this slot.`
        : 'This darshan slot is fully booked.',
    });
  }

  if (reserved.bookedCount >= reserved.totalCapacity && reserved.status !== 'full') {
    reserved.status = 'full';
    await reserved.save();
  }

  try {
    const booking = await Booking.create({
      user: req.user._id,
      bookingType: 'darshan',
      darshanSlot: slot._id,
      passengers: Array.isArray(passengers) && passengers.length ? passengers : [],
      numberOfTickets,
      totalAmount: slot.pricePerTicket * numberOfTickets,
      bookingStatus: 'pending',
    });

    res.status(201).json({ success: true, booking });
  } catch (err) {
    // Roll back the seat reservation if booking creation failed.
    await DarshanSlot.findByIdAndUpdate(slotId, {
      $inc: { bookedCount: -numberOfTickets },
      status: 'open',
    });
    throw err;
  }
});

// GET /api/bookings/my
exports.getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .populate({ path: 'darshanSlot', populate: { path: 'temple', select: 'name images location' } })
    .populate('payment');
  res.json({ success: true, count: bookings.length, bookings });
});

// GET /api/bookings/:id
exports.getBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findById(req.params.id)
    .populate({ path: 'darshanSlot', populate: { path: 'temple', select: 'name images location' } })
    .populate('payment');
  if (!booking) return res.status(404).json({ success: false, message: 'Booking not found.' });

  const isOwner = booking.user.toString() === req.user._id.toString();
  if (!isOwner && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'You cannot view this booking.' });
  }
  res.json({ success: true, booking });
});

// GET /api/bookings  (admin) — all bookings
exports.getAllBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find()
    .sort({ createdAt: -1 })
    .populate('user', 'name email phone')
    .populate({ path: 'darshanSlot', populate: { path: 'temple', select: 'name' } });
  res.json({ success: true, count: bookings.length, bookings });
});

// GET /api/bookings/temple/mine  (organizer) — bookings for their managed temple
exports.getTempleBookings = asyncHandler(async (req, res) => {
  if (!req.user.managedTemple) {
    return res.json({ success: true, count: 0, bookings: [] });
  }
  const slots = await DarshanSlot.find({ temple: req.user.managedTemple }).select('_id');
  const slotIds = slots.map((s) => s._id);

  const bookings = await Booking.find({ darshanSlot: { $in: slotIds } })
    .sort({ createdAt: -1 })
    .populate('user', 'name email phone')
    .populate('darshanSlot');
  res.json({ success: true, count: bookings.length, bookings });
});
