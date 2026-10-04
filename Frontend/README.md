# DarshanEase — Temple Darshan Booking (Frontend Demo)

A multi-file interactive demo of the DarshanEase temple darshan booking platform.
Plain HTML, CSS and JavaScript — no build step, no framework, no dependencies.

## How to run
Two ways to run it — either works:

**A) Just open the file (fastest):**
Double-click `index.html`. It opens directly in your browser, nothing else needed.

**B) Use npm (serves it over `http://localhost` instead of `file://`):**
```
npm install
npm start
```
Then open the URL it prints: http://localhost:5173

`npm install` won't actually install anything (there are no dependencies) — it just
confirms `package.json` is valid. `npm start` runs `server.js`, a small built-in Node
static file server with zero external packages.

> If you previously saw `npm error Missing script: "start"`, that was because an
> **old `package.json` from a different project** was sitting in that folder. Make
> sure you extract this zip into a clean, empty folder.

## File structure
```
DarshanEase-Website/
├── index.html              Page shell: header, nav, script includes
├── css/
│   └── style.css           All styling (colors, layout, components)
└── js/
    ├── data.js              Mock in-memory data: temples, darshans, users, organizers, bookings
    ├── utils.js             Shared helpers: toast, escaping, SVG art, card/footer builders
    ├── nav.js                Navigation bar rendering + page router (go())
    ├── bookingModal.js       "Book Now" modal: open/close/confirm booking
    ├── auth.js               Login / signup / edit temple / create darshan actions
    ├── app.js                Boot file — starts the app on the home page
    └── pages/
        ├── home.js            Public home page
        ├── about.js           About page
        ├── services.js        Services page
        ├── contact.js         Contact page
        ├── temples.js         Temples listing page
        ├── templeDetail.js    Single temple + its darshans + booking flow
        ├── login.js           Login page (role shortcuts: devotee / organizer / admin)
        ├── signup.js          Signup page
        ├── myBookings.js      Devotee "My Bookings" page with QR pass
        ├── orgDashboard.js    Organizer dashboard (stats + chart)
        ├── orgTemple.js       Organizer "My Temple" view + edit form
        ├── orgDarshans.js     Organizer darshans list + create form
        ├── orgBookings.js     Organizer bookings table
        ├── adminDashboard.js  Admin dashboard (stats + chart)
        ├── adminUsers.js      Admin users table
        └── adminOrganizers.js Admin organizers table
```

## How it fits together
- `index.html` loads every JS file with plain `<script src="...">` tags, in a specific
  order: `data.js` first (defines the shared data + a global `renderers` object), then
  `utils.js` and `nav.js`, then each page file (each one just adds its own function to
  `renderers`, e.g. `renderers.home = () => "...")`), then `bookingModal.js` and
  `auth.js` for interactive features, and finally `app.js` which calls `go("home")` to
  start the app.
- Regular `<script>` tags (not ES modules) are used on purpose, so the site keeps
  working when opened directly from disk via `file://` — ES modules are blocked by
  the browser in that case.
- Everything is in-memory: bookings, new darshans, edited temple info, etc. reset when
  you refresh the page. There's no backend or database wired up.

## Demo logins
On the Login page, use the shortcut buttons to sign in instantly as:
- **Devotee** — book darshans, view "My Bookings" with a QR pass
- **Organizer** — manage "My Temple", darshans, and bookings
- **Admin** — view platform-wide stats, users and organizers

## Turning this into the real stack
Your original project notes describe a React (Vite) + Express + MongoDB app with
files like `Onavbar.jsx`, `Utemple.jsx`, `userRoutes.js`, etc. This demo mirrors that
page structure 1:1 (one file per page/feature) but in plain JS so it's easy to run
right away. If you want, ask for the actual React + Express + MongoDB scaffold next
and I'll build out real `.jsx` components, Express routes/controllers, and Mongoose
models matching your folder screenshots.
