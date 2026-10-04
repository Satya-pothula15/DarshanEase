const { User } = require('../models');
const generateToken = require('../utils/generateToken');
const { asyncHandler } = require('../middleware/errorHandler');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function safeUser(user) {
  return {
    id: user._id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    managedTemple: user.managedTemple || null,
  };
}

// POST /api/auth/register
exports.register = asyncHandler(async (req, res) => {
  const { name, email, phone, password, confirmPassword } = req.body;

  if (!name || !email || !phone || !password || !confirmPassword) {
    return res.status(400).json({ success: false, message: 'All fields are required.' });
  }
  if (!EMAIL_RE.test(email.trim())) {
    return res.status(400).json({ success: false, message: 'Please enter a correctly formatted email address.' });
  }
  if (password !== confirmPassword) {
    return res.status(400).json({ success: false, message: 'Passwords do not match.' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters.' });
  }

  const existingEmail = await User.findOne({ email: email.toLowerCase().trim() });
  if (existingEmail) {
    return res.status(400).json({ success: false, message: 'An account with this email already exists.' });
  }
  const existingPhone = await User.findOne({ phone: phone.trim() });
  if (existingPhone) {
    return res.status(400).json({ success: false, message: 'An account with this phone number already exists.' });
  }

  const user = await User.create({ name: name.trim(), email, phone, password, role: 'devotee' });
  const token = generateToken(user);

  res.status(201).json({ success: true, token, user: safeUser(user) });
});

// POST /api/auth/login
exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ success: false, message: 'Email and password are required.' });
  }

  const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
  if (!user || !user.isActive) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const isMatch = await user.comparePassword(password);
  if (!isMatch) {
    return res.status(401).json({ success: false, message: 'Invalid email or password.' });
  }

  const token = generateToken(user);
  res.json({ success: true, token, user: safeUser(user) });
});

// GET /api/auth/me
exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: safeUser(req.user) });
});
