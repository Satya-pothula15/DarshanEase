const { Temple, DarshanSlot } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// GET /api/temples?search=&city=&state=&page=&limit=
exports.getTemples = asyncHandler(async (req, res) => {
  const { search, city, state, page = 1, limit = 12 } = req.query;

  const query = { isActive: true };

  if (search) {
    const re = new RegExp(search.trim(), 'i');
    query.$or = [
      { name: re },
      { deity: re },
      { 'location.city': re },
      { 'location.state': re },
    ];
  }
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (state) query['location.state'] = new RegExp(state, 'i');

  const pageNum = Math.max(1, parseInt(page, 10) || 1);
  const limitNum = Math.max(1, parseInt(limit, 10) || 12);

  const [temples, total] = await Promise.all([
    Temple.find(query)
      .sort({ name: 1 })
      .skip((pageNum - 1) * limitNum)
      .limit(limitNum),
    Temple.countDocuments(query),
  ]);

  res.json({
    success: true,
    count: temples.length,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    temples,
  });
});

// GET /api/temples/:id
exports.getTemple = asyncHandler(async (req, res) => {
  const temple = await Temple.findById(req.params.id);
  if (!temple || !temple.isActive) {
    return res.status(404).json({ success: false, message: 'Temple not found.' });
  }
  res.json({ success: true, temple });
});

// GET /api/temples/:id/slots
exports.getTempleSlots = asyncHandler(async (req, res) => {
  const temple = await Temple.findById(req.params.id);
  if (!temple) {
    return res.status(404).json({ success: false, message: 'Temple not found.' });
  }
  const slots = await DarshanSlot.find({ temple: temple._id, status: { $ne: 'closed' } })
    .sort({ date: 1, startTime: 1 });
  res.json({ success: true, count: slots.length, slots });
});

// POST /api/temples  (admin)
exports.createTemple = asyncHandler(async (req, res) => {
  const temple = await Temple.create(req.body);
  res.status(201).json({ success: true, temple });
});

// PUT /api/temples/:id  (admin, or the organizer who manages this temple)
exports.updateTemple = asyncHandler(async (req, res) => {
  const temple = await Temple.findById(req.params.id);
  if (!temple) {
    return res.status(404).json({ success: false, message: 'Temple not found.' });
  }

  if (req.user.role === 'freelancer') {
    const managed = req.user.managedTemple ? req.user.managedTemple.toString() : null;
    if (managed !== temple._id.toString()) {
      return res.status(403).json({ success: false, message: 'You can only edit the temple you manage.' });
    }
  }

  // Shallow top-level fields overwrite directly; nested objects (location,
  // timings) are merged so a partial update — e.g. { location: { city } }
  // from the organizer's edit form — doesn't wipe out sibling fields like
  // state/pincode that weren't included in this request.
  const { location, timings, ...rest } = req.body;
  Object.assign(temple, rest);
  if (location) Object.assign(temple.location, location);
  if (timings) Object.assign(temple.timings, timings);

  await temple.save();
  res.json({ success: true, temple });
});

// DELETE /api/temples/:id  (admin) — soft delete
exports.deleteTemple = asyncHandler(async (req, res) => {
  const temple = await Temple.findById(req.params.id);
  if (!temple) {
    return res.status(404).json({ success: false, message: 'Temple not found.' });
  }
  temple.isActive = false;
  await temple.save();
  res.json({ success: true, message: 'Temple deactivated.' });
});
