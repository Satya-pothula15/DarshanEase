/* ============ UTIL ============ */
function toast(msg) {
  const t = document.getElementById("toast");
  t.textContent = msg;
  t.classList.add("show");
  clearTimeout(window._toastT);
  window._toastT = setTimeout(() => t.classList.remove("show"), 2600);
}

function esc(s) {
  return (s + "").replace(/[<>&]/g, c => ({
    "<": "&lt;",
    ">": "&gt;",
    "&": "&amp;"
  }[c]));
}

/* RFC-5322-ish, good enough for real-world form validation */
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test((email || "").trim());
}

function genId() {
  return Math.random().toString(16).slice(2, 12);
}

function fmtDate(d) {
  if (!d) return "--";
  const date = new Date(d);
  if (isNaN(date)) return String(d);
  return date.toLocaleDateString(undefined, { year: "numeric", month: "short", day: "numeric" });
}

function fmtMoney(n) {
  return n === 0 ? "Free" : `₹${n}`;
}

function templeImageUrl(t) {
  return (t.images && t.images[0] && t.images[0].url) || "images/default-temple.jpg";
}

function barCol(label, value, max, color) {
  const h = Math.max(6, Math.round((value / max) * 140));
  return `<div class="bar-col"><div class="bar" style="height:${h}px;background:${color}"></div><span>${label}</span><b>${value}</b></div>`;
}

function gopuramSVG(accent, size = 140) {
  return `<svg viewBox="0 0 100 100" width="${size}" height="${size}">
    <polygon points="50,4 58,16 66,16 66,26 74,26 74,38 84,38 84,52 94,52 94,96 6,96 6,52 16,52 16,38 26,38 26,26 34,26 34,16 42,16" fill="${accent}" opacity="0.92"/>
    <circle cx="50" cy="8" r="3.4" fill="#E8A33D"/>
    <rect x="30" y="70" width="40" height="26" fill="#fff" opacity="0.14"/>
  </svg>`;
}

/* ============ SHARED UI PIECES ============ */

function templeCard(t) {
  return `
  <div class="temple-card">

    <img
      src="${templeImageUrl(t)}"
      alt="${esc(t.name)}"
      class="temple-image"
      onerror="this.src='images/default-temple.jpg'">

    <div class="body">

      <h3>${esc(t.name)}</h3>

      <div class="badge-row">
        <span>🕘 Open ${esc(t.timings?.openTime || "--")}</span>
        <span>🌙 Close ${esc(t.timings?.closeTime || "--")}</span>
      </div>

      <p class="desc">${esc(t.location?.city || "")}, ${esc(t.location?.state || "")} — ${esc((t.description || "").slice(0, 110))}${(t.description || "").length > 110 ? "…" : ""}</p>

      <button
        class="link-btn"
        onclick="go('templeDetail',{templeDetailId:'${t._id}'})">
        View Temple
      </button>

    </div>

  </div>`;
}

function bookingCardHTML(b) {
  const temple = b.darshanSlot?.temple;
  const templeName = temple?.name || "Temple";
  const templeImage = temple ? templeImageUrl(temple) : "images/default-temple.jpg";
  const poojaType = b.darshanSlot?.poojaType || "Darshan";
  const timing = b.darshanSlot ? `${b.darshanSlot.startTime} – ${b.darshanSlot.endTime}` : "--";
  const dateStr = b.darshanSlot ? fmtDate(b.darshanSlot.date) : "--";

  const qrData = encodeURIComponent(`DarshanEase|${b.bookingReferenceId}|${templeName}|${poojaType}`);

  const statusColors = { pending: "#8a5a12", confirmed: "#2E7D32", cancelled: "#6B1E1E", completed: "#0F4C4F" };
  const statusColor = statusColors[b.bookingStatus] || "#8a5a12";

  return `
    <div class="booking-card">

        <div class="booking-thumb">
            <img src="${templeImage}" alt="${esc(templeName)}" class="booking-temple-img" onerror="this.src='images/default-temple.jpg'">
        </div>

        <div class="qr-box">
            <img src="https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${qrData}" alt="QR">
        </div>

        <div class="booking-info">
            <div><b>BOOKING REF</b><br>${esc(b.bookingReferenceId || b._id)}</div>
            <div><b>TEMPLE NAME</b><br>${esc(templeName)}</div>
            <div><b>DARSHAN TYPE</b><br>${esc(poojaType)}</div>
            <div><b>DARSHAN DATE</b><br>${esc(dateStr)}</div>
            <div><b>TIMING</b><br>${esc(timing)}</div>
            <div><b>NO OF TICKETS</b><br>${b.numberOfTickets}</div>
            <div><b>TOTAL PRICE</b><br>₹${b.totalAmount}</div>
            <div><b>STATUS</b><br><span style="color:${statusColor};font-weight:700;text-transform:capitalize">${esc(b.bookingStatus)}</span></div>
        </div>

        ${b.bookingStatus === "pending"
          ? `<button class="link-btn small" onclick="go('payment',{pendingBookingId:'${b._id}'})">Complete Payment</button>`
          : `<button class="link-btn small" onclick="downloadTicket('${b._id}')">⬇ Download</button>`}

    </div>
    `;
}

/* Simple client-side text "ticket" download — reads from the last rendered
   My Bookings list cached on `window._myBookingsCache`. */
function downloadTicket(id) {
  const booking = (window._myBookingsCache || []).find(b => b._id === id);
  if (!booking) { toast("Booking not found"); return; }

  const temple = booking.darshanSlot?.temple;
  const ticket = `
DARSHANEASE TICKET (DEMO)

Booking Ref : ${booking.bookingReferenceId}
Temple      : ${temple?.name || "--"}
Darshan     : ${booking.darshanSlot?.poojaType || "--"}
Date        : ${fmtDate(booking.darshanSlot?.date)}
Timing      : ${booking.darshanSlot ? booking.darshanSlot.startTime + " - " + booking.darshanSlot.endTime : "--"}
Tickets     : ${booking.numberOfTickets}
Amount      : ₹${booking.totalAmount}
Status      : ${booking.bookingStatus}

Thank you for booking with DarshanEase.
`;

  const blob = new Blob([ticket], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${(temple?.name || "DarshanEase")}-Ticket.txt`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  toast("Ticket downloaded successfully.");
}

function footerHTML() {
  return `
  <footer class="site-footer">
    <div class="container">
      <p class="quote">
        "Embark on a spiritual journey, one darshan at a time — seamless temple darshan ticket booking at your fingertips."
      </p>

      <div class="foot-grid">

        <div>
          <h4>DarshanEase</h4>
          <p>
            A trusted companion for planning temple visits,
            reserving darshan slots and skipping the queue —
            all from your phone.
          </p>
        </div>

        <div>
          <h4>Explore</h4>
          <p>Temples<br>About<br>Services</p>
        </div>

        <div>
          <h4>Contact</h4>
          <p>
            Call at: 127-865-586-67<br>
            hello@darshanease.app
          </p>
        </div>

      </div>

      <div class="foot-bottom">
        Copyright © 2024 By DarshanEase. All Rights Reserved.
      </div>

    </div>
  </footer>`;
}
