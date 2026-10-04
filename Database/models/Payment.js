/**
 * models/Payment.js
 * ---------------------------------------------
 * Represents a payment transaction linked to a Booking.
 * Kept as its own collection so payment/refund history
 * and gateway metadata don't bloat the Booking document.
 * ---------------------------------------------
 */

const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema(
  {
    booking: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Booking',
      required: [true, 'Booking reference is required'],
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'User reference is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: 0,
    },
    currency: {
      type: String,
      default: 'INR',
    },
    method: {
      type: String,
      enum: ['upi', 'card', 'netbanking', 'wallet', 'cash'],
      required: [true, 'Payment method is required'],
    },
    transactionId: {
      type: String,
      unique: true,
      sparse: true, // allows nulls while still enforcing uniqueness when present
    },
    gatewayResponse: {
      type: mongoose.Schema.Types.Mixed, // raw response from payment gateway (Razorpay/Stripe etc.)
    },
    status: {
      type: String,
      enum: ['initiated', 'success', 'failed', 'refunded'],
      default: 'initiated',
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

paymentSchema.index({ booking: 1 });

// ---- Middleware: set paidAt automatically when status becomes 'success' ----
paymentSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'success' && !this.paidAt) {
    this.paidAt = new Date();
  }
  next();
});

module.exports = mongoose.model('Payment', paymentSchema);
