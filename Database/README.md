# Darshan Ticket Booking App — Database Development Module

This folder covers the **Database Development** part of the Darshan Ticket
Booking App (temple darshan slot booking + bus/train/flight ticket booking),
as assigned:

- ✅ Configure MongoDB
- ✅ Create Database Connection
- ✅ Create Schema and Models

## 📁 Folder Structure

```
darshan-database/
├── config/
│   └── db.js              # MongoDB connection logic (Mongoose)
├── models/
│   ├── User.js             # Devotee / traveler / admin accounts
│   ├── Temple.js            # Temples offering darshan
│   ├── DarshanSlot.js       # Bookable darshan time slots per temple
│   ├── Transport.js          # Bus / Train / Flight ticket inventory
│   ├── Booking.js            # Unified bookings (darshan OR transport)
│   ├── Payment.js            # Payment records linked to bookings
│   └── index.js               # Central export of all models
├── utils/
│   └── seedData.js             # Script to insert sample test data
├── server.js                    # Minimal Express server to test the DB module
├── package.json
├── .env.example                  # Template for environment variables
└── README.md
```

## 1️⃣ Configure MongoDB

- Copy `.env.example` to `.env`
- Fill in `MONGO_URI` with either:
  - a **local** MongoDB instance: `mongodb://127.0.0.1:27017/darshan_booking_db`
  - or a **MongoDB Atlas** cluster connection string
- Never commit the real `.env` file — it's meant to stay private.

## 2️⃣ Database Connection

`config/db.js` uses **Mongoose** to connect to MongoDB:
- Reads `MONGO_URI` from environment variables
- Logs a clear success/failure message
- Exits the process if the connection fails (so the app never runs without a DB)
- Listens for `connected` / `error` / `disconnected` events
- Gracefully closes the connection on app shutdown (Ctrl+C)

## 3️⃣ Schema & Models

| Model | Purpose |
|---|---|
| **User** | Devotees/travelers (and admins via `role`). Passwords are hashed with `bcryptjs` before saving. |
| **Temple** | Temple details, location, pooja types & pricing for darshan. |
| **DarshanSlot** | A specific bookable time slot at a temple (date, time, pooja type, capacity, seats remaining). |
| **Transport** | Bus/Train/Flight inventory — source, destination, timing, seats, price. |
| **Booking** | A single unified collection for both darshan and transport bookings, linked to a user and (optionally) a payment. Auto-generates a human-readable `bookingReferenceId` (e.g. `DRS-482913-X7K2QP`). |
| **Payment** | Payment transaction linked to a booking — method, status, gateway response, auto-timestamps on success. |

### Relationships
```
User ──< Booking >── DarshanSlot ── Temple
                 \
                  >── Transport
Booking ── Payment
```

## 🚀 How to Run & Test

```bash
# 1. Install dependencies
npm install

# 2. Set up environment variables
cp .env.example .env
# then edit .env with your real MONGO_URI

# 3. Make sure MongoDB is running (local) or your Atlas cluster is reachable

# 4. (Optional) Insert sample test data
npm run seed

# 5. Start the server to verify the connection
npm start
```

Once running, visit:
- `http://localhost:5000/` → confirms the server is up and models are registered
- `http://localhost:5000/api/health/db` → shows document counts per collection (proves the DB connection + schemas work end-to-end)

## ✅ Status
All files have been syntax-checked and load without errors or warnings.
This module is ready to be plugged into the rest of the team's Express
routes/controllers (auth, booking APIs, admin panel, etc.) — they can import
models like this:

```js
const { User, Temple, DarshanSlot, Transport, Booking, Payment } = require('./models');
```
