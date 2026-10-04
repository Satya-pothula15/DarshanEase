/* ============ APP STATE ============ */
/* Temple, darshan-slot, booking and user data now lives in MongoDB and is
   fetched through js/api.js. This file only keeps small UI-only constants
   and the shared client-side state/router registry. */

const colors = ["#C9600E", "#0F4C4F", "#6B1E1E", "#8a5a12"];

let state = {
  role: "guest",          // "guest" | "user" | "organizer" | "admin"
  currentUser: null,      // safe user object returned by the API
  templeDetailId: null,
  orgTempleId: null,
  view: "home",
  pendingBookingId: null, // set after a booking is created, used by the payment page
};

/* Global registry that each page file adds its renderer into */
const renderers = {};
