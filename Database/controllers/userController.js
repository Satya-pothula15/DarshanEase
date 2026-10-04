const { User, Temple, DarshanSlot, Booking, Payment } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// GET /api/users?role=devotee  (admin)
exports.getUsers = asyncHandler(async (req, res) => {
  const filter = {};
  if (req.query.role) filter.role = req.query.role;
  const users = await User.find(filter).sort({ createdAt: -1 }).populate('managedTemple', 'name');
  res.json({ success: true, count: users.length, users });
});

// POST /api/users/organizers  (admin) — create an organizer account for a temple
exports.createOrganizer = asyncHandler(async (req, res) => {
  const { name, email, phone, password, templeId } = req.body;
  if (!name || !email || !phone || !password || !templeId) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Please enter a correctly formatted email address.' });
  }
  const temple = await Temple.findById(templeId);
  if (!temple) return res.status(404).json({ success: false, message: 'Temple not found.' });

  const user = await User.create({
    name, email, phone, password, role: 'freelancer', managedTemple: temple._id,
  });
  res.status(201).json({ success: true, user: { id: user._id, name: user.name, email: user.email, managedTemple: temple._id } });
});

// DELETE /api/users/:id  (admin) — deactivate
exports.deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  user.isActive = false;
  await user.save();
  res.json({ success: true, message: 'User deactivated.' });
});

// GET /api/users/stats  (admin) — dashboard counts
exports.getStats = asyncHandler(async (req, res) => {
  const [devotees, organizers, temples, slots, bookings, payments] = await Promise.all([
    User.countDocuments({ role: 'devotee' }),
    User.countDocuments({ role: 'freelancer' }),
    Temple.countDocuments({ isActive: true }),
    DarshanSlot.countDocuments(),
    Booking.countDocuments(),
    Payment.countDocuments({ status: 'success' }),
  ]);
  res.json({ success: true, stats: { devotees, organizers, temples, slots, bookings, payments } });
});
