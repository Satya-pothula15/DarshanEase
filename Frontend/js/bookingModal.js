/* ============ BOOKING MODAL ============ */

let pendingSlot = null; // the slot object currently being booked

function openBooking(slotId) {
  if (state.role !== "user") {
    toast("Please log in as a devotee to book.");
    go("login");
    return;
  }

  const slot = (state.currentTempleSlots || []).find(s => s._id === slotId);
  if (!slot) { toast("This darshan slot is no longer available."); return; }
  if (slot.status !== "open" || (slot.totalCapacity - slot.bookedCount) <= 0) {
    toast("This darshan slot is fully booked.");
    return;
  }

  pendingSlot = slot;
  document.getElementById("bookingModalRoot").classList.remove("hidden");
  document.getElementById("bmTitle").textContent = `Book ${slot.poojaType} — ${state.currentTempleName || ""}`;
  document.getElementById("bmAvailable").textContent = `${slot.totalCapacity - slot.bookedCount} seat(s) available`;
  document.getElementById("bmQty").value = 1;
  document.getElementById("bmQty").max = Math.max(1, slot.totalCapacity - slot.bookedCount);
  document.getElementById("bmName").value = state.currentUser?.name || "";
  document.getElementById("bmAge").value = "";
  document.getElementById("bmError").textContent = "";
}

function closeBooking() {
  document.getElementById("bookingModalRoot").classList.add("hidden");
}

async function confirmBooking() {
  const errEl = document.getElementById("bmError");
  errEl.textContent = "";

  const qty = parseInt(document.getElementById("bmQty").value, 10) || 1;
  const name = document.getElementById("bmName").value.trim();
  const age = parseInt(document.getElementById("bmAge").value, 10);

  if (!name || !age || age <= 0) {
    errEl.textContent = "Please enter the devotee's name and age.";
    return;
  }
  const available = pendingSlot.totalCapacity - pendingSlot.bookedCount;
  if (qty < 1 || qty > available) {
    errEl.textContent = `Only ${available} seat(s) are available.`;
    return;
  }

  const passengers = Array.from({ length: qty }, () => ({ name, age }));

  try {
    const res = await apiCreateBooking({
      darshanSlot: pendingSlot._id,
      numberOfTickets: qty,
      passengers,
    });
    closeBooking();
    toast("Darshan reserved — please complete payment.");
    go("payment", { pendingBookingId: res.booking._id });
  } catch (err) {
    errEl.textContent = err.message;
  }
}

function bookingModalHTML() {
  return `
<div id="bookingModalRoot" class="hidden" style="position:fixed;inset:0;background:rgba(0,0,0,.55);display:flex;justify-content:center;align-items:center;z-index:1000;">

    <div class="card" style="max-width:420px;width:92%;">

        <h3 id="bmTitle" style="margin-bottom:6px;color:var(--maroon-dark)"></h3>
        <p id="bmAvailable" style="color:var(--ink-soft);font-size:13px;margin-bottom:14px"></p>

        <div class="field">
            <label>Devotee Name</label>
            <input id="bmName" placeholder="Full name">
        </div>

        <div class="field">
            <label>Age</label>
            <input id="bmAge" type="number" min="1" placeholder="Age">
        </div>

        <div class="field">
            <label>Number of Tickets</label>
            <input id="bmQty" type="number" min="1" value="1">
        </div>

        <p id="bmError" style="color:#B3261E;font-size:13px;min-height:18px"></p>

        <div style="display:flex;gap:12px;margin-top:10px;">
            <button class="btn-ghost" style="flex:1" onclick="closeBooking()">Cancel</button>
            <button class="btn-primary" style="flex:1" onclick="confirmBooking()">Confirm Booking</button>
        </div>

    </div>

</div>
`;
}
