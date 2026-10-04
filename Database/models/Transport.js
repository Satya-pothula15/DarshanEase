/**
 * models/Transport.js
 * ---------------------------------------------
 * Represents a bookable transport option — bus, train,
 * or flight — used for the general ticket booking part
 * of the Darshan Ticket Booking App.
 * ---------------------------------------------
 */

const mongoose = require('mongoose');

const transportSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ['bus', 'train', 'flight'],
      required: [true, 'Transport type is required'],
    },
    operatorName: {
      type: String,
      required: [true, 'Operator / airline / railway name is required'],
      trim: true,
    },
    transportNumber: {
      type: String, // e.g. flight number, train number, bus number
      required: true,
      trim: true,
    },
    source: {
      name: { type: String, required: true, trim: true },
      code: { type: String, trim: true }, // e.g. airport/station code
    },
    destination: {
      name: { type: String, required: true, trim: true },
      code: { type: String, trim: true },
    },
    departureTime: {
      type: Date,
      required: true,
    },
    arrivalTime: {
      type: Date,
      required: true,
    },
    duration: {
      type: Number, // in minutes, can be derived, but stored for quick reads
    },
    totalSeats: {
      type: Number,
      required: true,
      min: 1,
    },
    availableSeats: {
      type: Number,
      required: true,
      min: 0,
    },
    price: {
      type: Number,
      required: true,
      min: 0,
    },
    classType: {
      type: String, // e.g. "Sleeper", "AC", "Economy", "Business"
      default: 'General',
    },
    status: {
      type: String,
      enum: ['scheduled', 'delayed', 'cancelled', 'completed'],
      default: 'scheduled',
    },
  },
  { timestamps: true }
);

transportSchema.index({ type: 1, 'source.name': 1, 'destination.name': 1 });
transportSchema.index({ departureTime: 1 });

// ---- Validation: arrival must be after departure ----
transportSchema.pre('validate', function (next) {
  if (this.departureTime && this.arrivalTime) {
    if (this.arrivalTime <= this.departureTime) {
      return next(new Error('Arrival time must be after departure time'));
    }
    // auto-calculate duration in minutes
    this.duration = Math.round(
      (this.arrivalTime - this.departureTime) / (1000 * 60)
    );
  }
  next();
});

module.exports = mongoose.model('Transport', transportSchema);
