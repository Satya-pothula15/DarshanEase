/**
 * models/Temple.js
 * ---------------------------------------------
 * Represents a temple that offers darshan booking
 * through the DarshanEase feature of the app.
 * ---------------------------------------------
 */

const mongoose = require('mongoose');

const templeSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Temple name is required'],
      trim: true,
    },
    deity: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    location: {
      address: { type: String, trim: true },
      city: { type: String, required: true, trim: true },
      state: { type: String, required: true, trim: true },
      pincode: { type: String, trim: true },
      coordinates: {
        lat: { type: Number },
        lng: { type: Number },
      },
    },
    images: [
      {
        url: { type: String },
        caption: { type: String },
      },
    ],
    timings: {
      openTime: { type: String, default: '06:00' }, // 24h "HH:mm"
      closeTime: { type: String, default: '20:00' },
    },
    poojaTypes: [
      {
        name: { type: String, required: true }, // e.g. "Special Darshan", "Archana"
        price: { type: Number, required: true, min: 0 },
        duration: { type: Number, default: 15 }, // in minutes
      },
    ],
    rating: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

templeSchema.index({ name: 1 });
templeSchema.index({ 'location.city': 1, 'location.state': 1 });

// Virtual: all darshan slots available for this temple
templeSchema.virtual('slots', {
  ref: 'DarshanSlot',
  localField: '_id',
  foreignField: 'temple',
});

templeSchema.set('toJSON', { virtuals: true });
templeSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Temple', templeSchema);
