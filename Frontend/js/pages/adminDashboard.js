renderers.admindash = async () => {
  let stats;
  try {
    stats = (await apiGetStats()).stats;
  } catch (err) {
    return `<div class="page-wrap container"><div class="empty-state"><h3>Could not load dashboard</h3><p>${esc(err.message)}</p></div></div>${footerHTML()}`;
  }

  const max = Math.max(1, stats.devotees, stats.organizers, stats.temples, stats.bookings);

  return `
  <div class="page-wrap container">
    <h2 class="page-title teal-title">Dashboard</h2>
    <div class="stats-row">
      <div class="stat-box" style="background:#7A2B8C"><span>Devotees</span><b>${stats.devotees}</b></div>
      <div class="stat-box" style="background:var(--teal)"><span>Organizers</span><b>${stats.organizers}</b></div>
      <div class="stat-box" style="background:var(--saffron)"><span>Temples</span><b>${stats.temples}</b></div>
      <div class="stat-box" style="background:var(--marigold);color:#3F1010"><span>Darshan Slots</span><b>${stats.slots}</b></div>
      <div class="stat-box" style="background:#2E7D32"><span>Total Bookings</span><b>${stats.bookings}</b></div>
    </div>
    <div class="barchart">
      ${barCol("devotees", stats.devotees, max, "#7A2B8C")}
      ${barCol("temples", stats.temples, max, "#C9600E")}
      ${barCol("bookings", stats.bookings, max, "#2E7D32")}
    </div>
  </div>
  ${footerHTML()}
  `;
};
