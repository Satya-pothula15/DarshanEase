/**
 * models/Booking.js
 * ---------------------------------------------
 * A unified booking record. A booking can be EITHER:
 *   - a temple darshan slot booking (bookingType: 'darshan'), OR
 *   - a transport ticket booking (bookingType: 'transport')
 *
 * Using a single Booking collection with a discriminating
 * `bookingType` field keeps booking history, cancellation
 * logic, and payment linkage consistent across the whole app.
 * ---------------------------------------------
 */

const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    bookingType: {
      type: String,
      enum: ['darshan', 'transport'],
      required: [true, 'Booking type is required'],
    },

    // Populated only when bookingType === 'darshan'
    darshanSlot: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'DarshanSlot',
      required: function () {
        return this.bookingType === 'darshan';
      },
    },

    // Populated only when bookingType === 'transport'
    transport: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Transport',
      required: function () {
        return this.bookingType === 'transport';
      },
    },

    passengers: [
      {
        name: { type: String, required: true },
        age: { type: Number, required: true, min: 0 },
        gender: { type: String, enum: ['male', 'female', 'other'] },
        seatNumber: { type: String }, // relevant for transport bookings
      },
    ],

    numberOfTickets: {
      type: Number,
      required: true,
      min: 1,
      default: 1,
    },

    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    bookingStatus: {
      type: String,
      enum: ['pending', 'confirmed', 'cancelled', 'completed'],
      default: 'pending',
    },

    payment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Payment',
    },

    bookingReferenceId: {
      type: String,
      unique: true,
    },

    cancellation: {
      isCancelled: { type: Boolean, default: false },
      cancelledAt: { type: Date },
      reason: { type: String },
      refundAmount: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

bookingSchema.index({ user: 1, createdAt: -1 });

// ---- Middleware: auto-generate a human-readable booking reference ID ----
bookingSchema.pre('save', function (next) {
  if (!this.bookingReferenceId) {
    const prefix = this.bookingType === 'darshan' ? 'DRS' : 'TRP';
    const random = Math.random().toString(36).substring(2, 8).toUpperCase();
    const timestampPart = Date.now().toString().slice(-6);
    this.bookingReferenceId = `${prefix}-${timestampPart}-${random}`;
  }
  next();
});

module.exports = mongoose.model('Booking', bookingSchema);
