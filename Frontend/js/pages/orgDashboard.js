renderers.orgdash = async () => {
  const templeId = state.currentUser?.managedTemple;
  if (!templeId) {
    return `<div class="page-wrap container"><div class="empty-state"><h3>No temple assigned</h3><p>Ask an admin to assign you a temple to manage.</p></div></div>${footerHTML()}`;
  }

  let temple, slots, bookings;
  try {
    [temple, slots, bookings] = await Promise.all([
      apiGetTemple(templeId).then(r => r.temple),
      apiGetMySlots().then(r => r.slots),
      apiGetTempleBookings().then(r => r.bookings),
    ]);
  } catch (err) {
    return `<div class="page-wrap container"><div class="empty-state"><h3>Could not load dashboard</h3><p>${esc(err.message)}</p></div></div>${footerHTML()}`;
  }

  const max = Math.max(1, slots.length, bookings.length);

  return `
  <div class="page-wrap container">
    <h2 class="page-title teal-title">Dashboard — ${esc(temple.name)}</h2>
    <div class="stats-row">
      <div class="stat-box" style="background:var(--teal)"><span>Temple</span><b>1</b></div>
      <div class="stat-box" style="background:var(--marigold);color:#3F1010"><span>Darshan Slots</span><b>${slots.length}</b></div>
      <div class="stat-box" style="background:#2E7D32"><span>Total Bookings</span><b>${bookings.length}</b></div>
    </div>
    <div class="barchart">
      ${barCol("temples", 1, max, "#0F4C4F")}
      ${barCol("slots", slots.length, max, "#E8A33D")}
      ${barCol("bookings", bookings.length, max, "#2E7D32")}
    </div>
  </div>
  ${footerHTML()}
  `;
};
