renderers.templeDetail = async () => {
  const id = state.templeDetailId;
  if (!id) return `<div class="page-wrap container">Temple not found.</div>${footerHTML()}`;

  let temple, slots;
  try {
    [temple, slots] = await Promise.all([
      apiGetTemple(id).then(r => r.temple),
      apiGetTempleSlots(id).then(r => r.slots),
    ]);
  } catch (err) {
    return `<div class="page-wrap container"><div class="empty-state"><h3>Could not load this temple</h3><p>${esc(err.message)}</p></div></div>${footerHTML()}`;
  }

  // cached so bookingModal.js can look up a slot by id without another fetch
  state.currentTempleSlots = slots;
  state.currentTempleName = temple.name;

  const openSlots = slots.filter(s => s.status !== "closed");

  return `
  <div class="page-wrap container">
    <div class="two-col-grid" style="margin-bottom:40px">
      <div class="card">
        <h3 style="color:var(--maroon-dark);font-size:22px">Description</h3>
        <p style="color:var(--ink-soft);margin-top:10px">${esc(temple.description || "")}</p>
      </div>
      <div class="card">
        <h3 style="color:var(--maroon-dark);font-size:22px">Info</h3>
        <div class="info-list" style="margin-top:10px">
          <div><span>Deity</span><b>${esc(temple.deity || "--")}</b></div>
          <div><span>Open</span><b>${esc(temple.timings?.openTime || "--")}</b></div>
          <div><span>Close</span><b>${esc(temple.timings?.closeTime || "--")}</b></div>
          <div><span>Rating</span><b>⭐ ${temple.rating || "--"}</b></div>
          <div><span>Address</span><b style="text-align:right;max-width:60%">${esc(temple.location?.address || "")}, ${esc(temple.location?.city || "")}, ${esc(temple.location?.state || "")} ${esc(temple.location?.pincode || "")}</b></div>
        </div>
      </div>
    </div>
    <h2 class="page-title" style="font-size:26px">Darshan Slots</h2>
    <div class="grid grid-3">
      ${openSlots.length ? openSlots.map(s => {
        const seatsLeft = s.totalCapacity - s.bookedCount;
        const full = s.status === "full" || seatsLeft <= 0;
        return `
        <div class="darshan-card">
          <h4>${esc(s.poojaType)}</h4>
          <div class="row"><span>Date</span><b>${esc(fmtDate(s.date))}</b></div>
          <div class="row"><span>Timing</span><b>${esc(s.startTime)} – ${esc(s.endTime)}</b></div>
          <div class="row"><span>Price / ticket</span><b>${fmtMoney(s.pricePerTicket)}</b></div>
          <div class="row"><span>Seats left</span><b>${full ? "Full" : seatsLeft}</b></div>
          <button class="link-btn" style="width:100%;text-align:center;${full ? "opacity:.5;cursor:not-allowed" : ""}" ${full ? "disabled" : `onclick="openBooking('${s._id}')"`}>${full ? "Fully Booked" : "Book Now"}</button>
        </div>`;
      }).join("") : `<div class="empty-state" style="grid-column:1/-1"><h3>No darshan slots yet</h3><p>Please check back soon.</p></div>`}
    </div>
  </div>
  ${footerHTML()}
  ${bookingModalHTML()}
  `;
};
