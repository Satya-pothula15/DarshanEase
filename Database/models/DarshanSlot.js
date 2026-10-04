/**
 * models/DarshanSlot.js
 * ---------------------------------------------
 * Represents a bookable time slot at a specific temple
 * for a specific date and pooja type, with a limited
 * capacity of devotees.
 * ---------------------------------------------
 */

const mongoose = require('mongoose');

const darshanSlotSchema = new mongoose.Schema(
  {
    temple: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Temple',
      required: [true, 'Temple reference is required'],
    },
    date: {
      type: Date,
      required: [true, 'Slot date is required'],
    },
    startTime: {
      type: String, // "HH:mm" 24-hour format
      required: [true, 'Start time is required'],
    },
    endTime: {
      type: String,
      required: [true, 'End time is required'],
    },
    poojaType: {
      type: String,
      required: [true, 'Pooja type is required'],
    },
    pricePerTicket: {
      type: Number,
      required: true,
      min: 0,
    },
    totalCapacity: {
      type: Number,
      required: true,
      min: 1,
    },
    bookedCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['open', 'full', 'closed'],
      default: 'open',
    },
  },
  { timestamps: true }
);

// Prevent duplicate slots for the same temple/date/time/pooja type
darshanSlotSchema.index(
  { temple: 1, date: 1, startTime: 1, poojaType: 1 },
  { unique: true }
);

// ---- Virtual: remaining seats available ----
darshanSlotSchema.virtual('availableSeats').get(function () {
  return this.totalCapacity - this.bookedCount;
});

// ---- Middleware: auto-update status when capacity is reached ----
darshanSlotSchema.pre('save', function (next) {
  if (this.bookedCount >= this.totalCapacity) {
    this.status = 'full';
  } else if (this.status === 'full' && this.bookedCount < this.totalCapacity) {
    this.status = 'open';
  }
  next();
});

darshanSlotSchema.set('toJSON', { virtuals: true });
darshanSlotSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('DarshanSlot', darshanSlotSchema);
