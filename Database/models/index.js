/**
 * models/index.js
 * ---------------------------------------------
 * Central export point for all Mongoose models.
 * Other parts of the app (routes/controllers built
 * by teammates) can simply do:
 *
 *   const { User, Temple, DarshanSlot, Transport, Booking, Payment } = require('./models');
 * ---------------------------------------------
 */

const User = require('./User');
const Temple = require('./Temple');
const DarshanSlot = require('./DarshanSlot');
const Transport = require('./Transport');
const Booking = require('./Booking');
const Payment = require('./Payment');

module.exports = {
  User,
  Temple,
  DarshanSlot,
  Transport,
  Booking,
  Payment,
};
