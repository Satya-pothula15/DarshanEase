const { DarshanSlot, Temple } = require('../models');
const { asyncHandler } = require('../middleware/errorHandler');

// Only admins, or the organizer who manages that exact temple, may touch a slot.
function assertCanManageTemple(req, templeId) {
  if (req.user.role === 'admin') return true;
  if (req.user.role === 'freelancer') {
    const managed = req.user.managedTemple ? req.user.managedTemple.toString() : null;
    return managed === templeId.toString();
  }
  return false;
}

// POST /api/slots
exports.createSlot = asyncHandler(async (req, res) => {
  const { temple: templeId } = req.body;
  const temple = await Temple.findById(templeId);
  if (!temple) return res.status(404).json({ success: false, message: 'Temple not found.' });

  if (!assertCanManageTemple(req, temple._id)) {
    return res.status(403).json({ success: false, message: 'You cannot create slots for this temple.' });
  }

  const slot = await DarshanSlot.create(req.body);
  res.status(201).json({ success: true, slot });
});

// PUT /api/slots/:id
exports.updateSlot = asyncHandler(async (req, res) => {
  const slot = await DarshanSlot.findById(req.params.id);
  if (!slot) return res.status(404).json({ success: false, message: 'Slot not found.' });

  if (!assertCanManageTemple(req, slot.temple)) {
    return res.status(403).json({ success: false, message: 'You cannot edit this slot.' });
  }

  Object.assign(slot, req.body);
  await slot.save();
  res.json({ success: true, slot });
});

// DELETE /api/slots/:id
exports.deleteSlot = asyncHandler(async (req, res) => {
  const slot = await DarshanSlot.findById(req.params.id);
  if (!slot) return res.status(404).json({ success: false, message: 'Slot not found.' });

  if (!assertCanManageTemple(req, slot.temple)) {
    return res.status(403).json({ success: false, message: 'You cannot delete this slot.' });
  }

  await slot.deleteOne();
  res.json({ success: true, message: 'Slot deleted.' });
});

// GET /api/slots/mine — slots for the organizer's managed temple
exports.getMySlots = asyncHandler(async (req, res) => {
  if (!req.user.managedTemple) {
    return res.json({ success: true, count: 0, slots: [] });
  }
  const slots = await DarshanSlot.find({ temple: req.user.managedTemple }).sort({ date: 1 });
  res.json({ success: true, count: slots.length, slots });
});
