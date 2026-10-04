/**
 * config/db.js
 * ---------------------------------------------
 * Handles the MongoDB connection using Mongoose.
 * This is the single source of truth for connecting
 * the Darshan Ticket Booking App to its database.
 * ---------------------------------------------
 */

const mongoose = require('mongoose');

/**
 * Establishes a connection to MongoDB using the URI
 * defined in the environment variables (MONGO_URI).
 *
 * Includes:
 *  - Clear success / failure logging
 *  - Automatic process exit on failure (so the server never
 *    runs silently without a working database)
 *  - Connection event listeners for ongoing monitoring
 */
const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      throw new Error(
        'MONGO_URI is not defined. Please set it in your .env file.'
      );
    }

    const conn = await mongoose.connect(mongoUri, {
      // Mongoose 6+/8+ no longer needs useNewUrlParser / useUnifiedTopology,
      // they are defaults now, but options object is kept for clarity/extension.
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
    console.log(`   Database Name: ${conn.connection.name}`);

    return conn;
  } catch (error) {
    console.error(`❌ MongoDB Connection Error: ${error.message}`);
    // Exit process with failure — the app should not run without a DB.
    process.exit(1);
  }
};

// ---- Connection event listeners (useful for debugging & monitoring) ----
mongoose.connection.on('connected', () => {
  console.log('Mongoose default connection is open.');
});

mongoose.connection.on('error', (err) => {
  console.error(`Mongoose default connection error: ${err}`);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose default connection is disconnected.');
});

// Gracefully close the connection when the Node process ends (e.g. Ctrl+C)
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose connection closed due to app termination (SIGINT).');
  process.exit(0);
});

module.exports = connectDB;
