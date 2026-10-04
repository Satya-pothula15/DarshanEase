# DarshanEase — Temple Darshan Booking Website (Full-Stack MERN)

DarshanEase is now a real full-stack application. The original UI (colors, layout,
temple cards, navigation, pages) is unchanged — what changed is what powers it:
every signup, login, temple listing, darshan slot, booking and payment is now
read from and written to **MongoDB** through a **Node.js/Express REST API**,
instead of living in JavaScript arrays in the browser.

```
Frontend (static HTML/CSS/JS, port 5173)
        │  fetch() calls, JWT in Authorization header
        ▼
REST API — Node.js + Express (port 5000)
        │
        ▼
Mongoose ODM
        │
        ▼
MongoDB — darshan_booking_db
```

---

## 1. Project structure

```
DarshanEase/
├── Database/                     ← backend (Express API)
│   ├── config/
│   │   └── db.js                 Mongoose connection (unchanged)
│   ├── models/                   Mongoose schemas (unchanged, +1 field)
│   │   ├── User.js               + managedTemple field for organizers
│   │   ├── Temple.js
│   │   ├── DarshanSlot.js
│   │   ├── Booking.js
│   │   ├── Payment.js
│   │   ├── Transport.js          (model kept, not exposed via routes — not used by the current UI)
│   │   └── index.js
│   ├── middleware/                NEW
│   │   ├── auth.js               JWT verification (protect) + role checks (authorize)
│   │   └── errorHandler.js       asyncHandler, 404 handler, centralized error formatter
│   ├── controllers/               NEW
│   │   ├── authController.js     register / login / me
│   │   ├── templeController.js   list/search/get/create/update/deactivate
│   │   ├── slotController.js     darshan slot CRUD (organizer/admin)
│   │   ├── bookingController.js  create (overbooking-safe), my/temple/all bookings
│   │   ├── paymentController.js  demo payment create + verify
│   │   └── userController.js     admin: users, organizers, dashboard stats
│   ├── routes/                    NEW
│   │   ├── authRoutes.js
│   │   ├── templeRoutes.js
│   │   ├── slotRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── paymentRoutes.js
│   │   └── userRoutes.js
│   ├── utils/
│   │   ├── generateToken.js      NEW — signs JWTs
│   │   └── seedData.js           REWRITTEN — seeds 10 temples, slots, demo accounts
│   ├── .env                      NEW — filled in with the values you specified
│   ├── .env.example
│   ├── .gitignore                (already excluded .env / node_modules)
│   ├── package.json              + cors, jsonwebtoken
│   └── server.js                 REWRITTEN — full Express app, CORS, routes, error handling
│
├── Frontend/                     ← static frontend (unchanged design)
│   ├── index.html                script tags updated for new/removed files
│   ├── css/style.css             UNCHANGED
│   ├── images/                   + 7 new locally-generated temple images + default-temple.jpg
│   ├── server.js                 UNCHANGED (tiny static file server, port 5173)
│   └── js/
│       ├── api.js                NEW — every fetch() call to the backend lives here
│       ├── data.js               REWRITTEN — dropped hardcoded temples/darshans/bookings/users arrays
│       ├── utils.js              REWRITTEN — templeCard/bookingCardHTML use real API documents
│       ├── nav.js                REWRITTEN — router now supports async, API-backed pages
│       ├── auth.js               REWRITTEN — real JWT login/signup, session persisted in localStorage
│       ├── bookingModal.js       REWRITTEN — books a real DarshanSlot via the API
│       ├── app.js                REWRITTEN — restores session on load
│       └── pages/
│           ├── home.js           REWRITTEN — fetches featured temples
│           ├── temples.js        REWRITTEN — live search + city filter + Load More
│           ├── templeDetail.js   REWRITTEN — real temple + live darshan slots
│           ├── login.js          REWRITTEN — real email/password form (no more demo shortcuts)
│           ├── signup.js         REWRITTEN — name/email/phone/password/confirm
│           ├── myBookings.js     REWRITTEN — GET /api/bookings/my
│           ├── payment.js        NEW — demo payment screen
│           ├── orgDashboard.js   REWRITTEN
│           ├── orgTemple.js      REWRITTEN — view + edit managed temple
│           ├── orgDarshans.js    REWRITTEN — darshan slot CRUD
│           ├── orgBookings.js    REWRITTEN — bookings for the organizer's temple
│           ├── adminDashboard.js REWRITTEN — live stats
│           ├── adminUsers.js     REWRITTEN — devotee list
│           ├── adminOrganizers.js REWRITTEN — organizer list + create-organizer form
│           ├── adminTemples.js   NEW — temple CRUD (add/edit/deactivate)
│           └── about.js / services.js / contact.js   UNCHANGED (static content)
│
├── Documents/                    UNCHANGED (your existing project docs)
├── Project Files/                UNCHANGED
├── Video Demo/                   UNCHANGED
└── MERN Phase Wise/               UNCHANGED (left as-is, not part of the running app)
```

### Files created
`Database/middleware/auth.js`, `Database/middleware/errorHandler.js`,
`Database/controllers/*.js` (6 files), `Database/routes/*.js` (6 files),
`Database/utils/generateToken.js`, `Database/.env`,
`Frontend/js/api.js`, `Frontend/js/pages/payment.js`, `Frontend/js/pages/adminTemples.js`,
`Frontend/images/{srisailam,puri,madurai,somnath,kedarnath,badrinath,rameshwaram,default-temple}.jpg`

### Files modified
`Database/models/User.js`, `Database/server.js`, `Database/package.json`,
`Database/utils/seedData.js`,
`Frontend/index.html`, `Frontend/js/{data,utils,nav,auth,bookingModal,app}.js`,
`Frontend/js/pages/{home,temples,templeDetail,login,signup,myBookings,orgDashboard,orgTemple,orgDarshans,orgBookings,adminDashboard,adminUsers,adminOrganizers}.js`

Nothing in `css/style.css`, the image files you already had, or the page layout/markup
structure of `about.js`, `services.js`, `contact.js` was changed.

---

## 2. Install dependencies

Open two terminals.

**Terminal 1 — backend**
```bash
cd Database
npm install
```

**Terminal 2 — frontend**
```bash
cd Frontend
npm install
```
(the frontend has no real dependencies — its `server.js` is a zero-dependency static
file server — `npm install` will just no-op quickly.)

---

## 3. Environment variables

`Database/.env` is already filled in with exactly what you asked for:

```
PORT=5000
NODE_ENV=development
MONGO_URI=mongodb://localhost:27017/darshan_booking_db
JWT_SECRET=<a random 64-character hex string, already generated for you>
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:5173,http://127.0.0.1:5173
```

You don't need to change anything to run the project locally — just make sure your
local `mongod` service is running. If you deploy this later, generate a fresh
`JWT_SECRET` and never commit `.env` (already covered by `.gitignore`).

---

## 4. Seed the database

Make sure MongoDB is running locally, then:

```bash
cd Database
npm run seed
```

This clears and reinserts the `temples` and `darshanslots` collections (safe to
re-run any time) and **upserts** (creates once, never duplicates) three demo
accounts:

| Role | Email | Password | Manages |
|---|---|---|---|
| Admin | `admin@darshanease.app` | `Admin@123` | — |
| Organizer | `tirumala@darshanease.app` | `Organizer@123` | Tirumala Venkateswara Temple |
| Organizer | `shirdi@darshanease.app` | `Organizer@123` | Shirdi Sai Baba Temple |
| Organizer | `kashi@darshanease.app` | `Organizer@123` | Kashi Vishwanath Temple |

Sign up as a devotee from the website itself to test the booking flow end to end.

---

## 5. Run the app

```bash
# Terminal 1
cd Database
npm start          # or: npm run dev  (nodemon, auto-restarts on changes)
# 🚀 DarshanEase API running on http://localhost:5000

# Terminal 2
cd Frontend
npm start
#   DarshanEase running at: http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## 6. Verifying data in MongoDB Compass

Connect Compass to `mongodb://localhost:27017`, open `darshan_booking_db`, and you
should see these collections filling up as you use the site:

| Collection | Filled by |
|---|---|
| `users` | Sign Up, and the seed script's admin/organizer accounts |
| `temples` | `npm run seed` |
| `darshanslots` | `npm run seed`, and any slot an organizer creates |
| `bookings` | Every "Confirm Booking" in the booking modal |
| `payments` | Every completed demo payment |

Refresh Compass (or the browser) after each step in the test flow below — data
persists across restarts because it's in MongoDB, not in a JS array.

---

## 7. End-to-end test flow

1. Open `http://localhost:5173` → home page loads temples from the API.
2. **Browse Temples** → all 10 seeded temples appear, with search working
   (try "Tirupati", "Shirdi", "Shiva").
3. **Sign Up** with a new devotee account → check MongoDB Compass → the user
   appears in `users` with a bcrypt-hashed password (never plain text).
4. **Logout**, then **Login** with that same account → real JWT auth, no demo
   shortcuts remain.
5. Open a temple → darshan slots are fetched live from `darshanslots`.
6. **Book Now** on a slot → fill devotee name/age/tickets → **Confirm Booking**
   → a `bookings` document appears with `bookingStatus: "pending"`.
7. You're redirected to the **Demo Payment** screen → pick a method → **Pay** →
   a `payments` document appears, and the booking flips to `confirmed`.
8. **My Bookings** → only this account's bookings are listed (`GET /api/bookings/my`
   is scoped to the JWT's user id server-side).
9. Try booking more tickets than are available on a slot → the backend rejects it
   with "Only N seat(s) are available" — capacity is enforced atomically in MongoDB,
   so two simultaneous requests can never overbook a slot.
10. Log in as an organizer (see table above) → **Darshan Slots** → create/edit/delete
    slots for your temple → **Bookings** shows only bookings for that temple.
11. Log in as admin → **Dashboard** shows live counts, **Users**/**Organizers**/
    **Temples** tabs manage real data, including creating new organizer accounts
    and adding/editing/deactivating temples.

---

## 8. Security notes

- Passwords are hashed with **bcryptjs** before being saved — `users.password` is
  never stored or returned in plain text.
- JWTs are signed with `JWT_SECRET` and expire after `JWT_EXPIRE` (7 days).
- The backend **never trusts a role sent from the frontend** — `req.user.role` is
  always re-read from the database inside `middleware/auth.js` on every protected
  request.
- The demo payment flow never asks for or stores a card number, CVV, UPI PIN, or
  bank credentials — only the chosen method (`upi`/`card`/`netbanking`/`wallet`)
  and a generated demo transaction id.
- CORS is restricted to the frontend's own origin (`localhost:5173`), not a
  wildcard.

---

## 9. Viva Q&A

**Q: Why MongoDB instead of a relational database?**
Bookings, temples and darshan slots have a flexible, document-shaped structure
(e.g. a temple's `poojaTypes` array, a booking's `passengers` array), which maps
naturally onto MongoDB documents without needing extra join tables for simple
one-to-many relationships. Mongoose still gives us schema validation on top.

**Q: How do you stop two users from booking the last seat at the same time?**
`bookingController.createBooking` uses a single atomic MongoDB operation —
`DarshanSlot.findOneAndUpdate` with a `$expr` condition comparing `bookedCount +
requestedTickets <= totalCapacity` — to both check and reserve capacity in one
step. If two requests race, the database guarantees only one `findOneAndUpdate`
succeeds; the loser gets a clean "not enough seats" error and no booking is
created for it. This is safer than reading the slot, checking capacity in
JavaScript, and writing back — which has a race window.

**Q: How does authentication work end to end?**
On login/signup the backend verifies credentials (bcrypt compare), then signs a
JWT containing the user's id and role. The frontend stores that token in
`localStorage` and sends it as `Authorization: Bearer <token>` on every
protected request. `middleware/auth.js`'s `protect` function verifies the token,
loads the *current* user from MongoDB (not from the token payload alone), and
attaches it to `req.user`. `authorize(...roles)` then checks `req.user.role`
against the roles allowed for that route.

**Q: Why re-fetch the user from the database in `protect` instead of trusting the
JWT payload?**
So a role change or account deactivation takes effect immediately instead of
waiting for the old JWT to expire, and so the frontend can never forge a role by
tampering with a stored token payload — a valid JWT only proves *who* the user
is; the database is always asked what that user is *allowed to do right now*.

**Q: How would you swap the demo payment for a real gateway (e.g. Razorpay)?**
`paymentController.createPayment`/`verifyPayment` are the only two functions that
would change. `createPayment` would call Razorpay's order-creation API instead of
immediately marking the payment `initiated`, and `verifyPayment` would verify the
gateway's signed callback (HMAC signature) instead of trusting the client — the
`Booking`/`Payment` schema and the rest of the booking flow wouldn't need to
change at all.

**Q: What happens if a booking is created but the payment never completes?**
The `Booking` document stays in `bookingStatus: "pending"` and the reserved
seats stay counted in `DarshanSlot.bookedCount` (so the slot doesn't
over-promise capacity). The demo project doesn't implement an expiry/cleanup job
for abandoned pending bookings — a production version would add a scheduled job
or a TTL-based cleanup to release unpaid reservations after a timeout.

**Q: Why is `role` an enum of `devotee` / `admin` / `freelancer` instead of
`devotee` / `admin` / `organizer`?**
That enum already existed in the original `User` model you provided, so the
backend reuses `freelancer` as the "temple organizer" role rather than
renaming it (which would have meant migrating the schema). The frontend maps
`freelancer` → the "organizer" UI/nav so the naming is transparent to the user.

**Q: How is the frontend still "just HTML/CSS/JS with no build step"?**
`js/api.js` is a small `fetch()` wrapper loaded as a plain `<script>` tag, same
as every other file. Nothing here needs bundling, transpiling, or npm packages
in the browser — `Frontend/server.js` still just serves static files.

**Q: Where would you add automated tests?**
`bookingController.createBooking` (the overbooking-safety path) and
`authController` (password hashing / JWT issuance) are the highest-value
targets for unit/integration tests, e.g. with Jest + Supertest + an in-memory
MongoDB instance (`mongodb-memory-server`).

---

## 10. Known limitations (by design, for a student project)

- Payments are demo-only — no real money moves, and no gateway is integrated
  unless you add one (see Q&A above).
- The `Transport` model exists (kept from your original project) but has no
  routes/UI wired up — the spec only asked for darshan booking to be made real.
- No automated test suite is included.
- `MERN Phase Wise/Frontend` (an older snapshot in your repo) was left untouched
  and is not part of the running application.

## 11. The three logins

The login page (`Frontend/js/pages/login.js`) has three tabs — **Devotee**, **Organizer**,
**Admin** — matching the three roles and their responsibilities:

| Role | Main responsibility |
|---|---|
| Devotee | Books darshan slots |
| Organizer | Manages their temple and its darshan slots |
| Admin | Manages the whole platform |

There's still only one `POST /api/auth/login` endpoint — the backend always derives the
real role from the database, never from what the frontend claims. The tabs exist so the
person logging in tells the UI which dashboard they expect, and the frontend checks that
against the account's actual role after login; if they pick the wrong tab for their
account (e.g. an organizer account on the Devotee tab) they get a clear error instead of
landing in the wrong dashboard. Sign-up only ever creates a **Devotee** account — Organizer
and Admin accounts are created by an admin (`Admin > Organizers > Create Organizer
Account`) or by the seed script.

## 12. Email format validation

Every form that collects an email address — Sign Up, Login, Contact us, and the admin's
Create Organizer form — now rejects anything that isn't a correctly formatted email
address (e.g. `name@example.com`) both in the browser (`Frontend/js/utils.js`'s
`isValidEmail`) and again on the server (`Database/controllers/authController.js` and
`userController.js`), so a malformed address can't get through even by calling the API
directly.

## 13. Temple images — what's real and what isn't

- **Tirumala, Shirdi, Kashi Vishwanath** — the real photos already in your project
  (`Frontend/images/tirumala.jpg`, `shirdi.jpg`, `kashi.jpg`).
- **Srisailam, Jagannath Temple (Puri), Meenakshi Amman Temple (Madurai)** — now use real,
  freely-licensed photographs hotlinked from Wikimedia Commons (each uploaded as the
  photographer's "own work" under a Creative Commons license), via Commons'
  `Special:FilePath` feature — the same mechanism Wikipedia itself uses to serve an image
  by title without a separate download step. If a link ever breaks, the page falls back to
  `images/default-temple.jpg` automatically (`onerror` on the `<img>`).
- **Somnath, Kedarnath, Badrinath, Rameshwaram** — I could not find and verify a Commons
  photo URL I was fully confident wouldn't 404 for these four within this session, so they
  still use the illustrated placeholder art generated for this project
  (`images/somnath.jpg`, `kedarnath.jpg`, `badrinath.jpg`, `rameshwaram.jpg`) rather than
  risk shipping a broken image link. If you'd like real photos for these, the easiest fix
  is to download any photo you like the license of and drop it in as
  `Frontend/images/<name>.jpg`, replacing the placeholder — no code changes needed since
  `seedData.js` already points at that filename.

## 14. Payment page: method-specific fields + duplicate-payment fix

The demo payment screen now shows different fields depending on the method you pick,
same as a real checkout would:

- **UPI** — a UPI ID field, plus a scannable demo QR code (generated the same way the
  booking QR passes are).
- **Card** — name on card, card number (auto-spaced), expiry (MM/YY), CVV.
- **Netbanking** — a bank picker.
- **Wallet** — a wallet picker (Paytm/PhonePe/Amazon Pay/Mobikwik).

All of this is client-side only for realism — whatever you type in these fields is
validated for a plausible format and then **thrown away**; only the method name
(`upi`/`card`/`netbanking`/`wallet`) is ever sent to `POST /api/payments/create`. No card
number, CVV, UPI ID, or bank selection is transmitted or stored, matching your original
"never store card/CVV/UPI PIN" requirement.

**Also fixed:** `paymentController.createPayment` previously created a brand-new `Payment`
document every time it was called for the same booking — so switching payment methods,
double-clicking Pay, or reopening the payment page could leave two (or more) `payments`
documents pointing at one `bookings` document. It now reuses the existing
not-yet-successful payment for that booking instead of creating a duplicate, and
`verifyPayment` was made atomic (`findOneAndUpdate` with a status guard) so two
near-simultaneous confirmations can't both succeed either. One `booking` now always maps
to at most one `payment`.
