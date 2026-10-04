renderers.orgbookings = async () => {
  let bookings = [];
  try {
    bookings = (await apiGetTempleBookings()).bookings;
  } catch (err) {
    return `<div class="page-wrap container"><div class="empty-state"><h3>Could not load bookings</h3><p>${esc(err.message)}</p></div></div>${footerHTML()}`;
  }

  return `
  <div class="page-wrap container">
    <h2 class="page-title teal-title">Bookings</h2>
    ${bookings.length ? `
    <table class="data">
      <tr><th>Booking Ref</th><th>Darshan</th><th>Devotee</th><th>Date</th><th>Timing</th><th>Qty</th><th>Amount</th><th>Status</th></tr>
      ${bookings.map(b => `<tr>
        <td class="mono">${esc(b.bookingReferenceId)}</td><td>${esc(b.darshanSlot?.poojaType || "")}</td><td>${esc(b.user?.name || "")}</td>
        <td>${esc(fmtDate(b.darshanSlot?.date))}</td><td>${esc(b.darshanSlot?.startTime || "")} – ${esc(b.darshanSlot?.endTime || "")}</td>
        <td>${b.numberOfTickets}</td><td>₹${b.totalAmount}</td><td style="text-transform:capitalize">${esc(b.bookingStatus)}</td>
      </tr>`).join("")}
    </table>` : `<div class="empty-state"><h3>No bookings yet</h3><p>Bookings made for your temple will appear here.</p></div>`}
  </div>
  ${footerHTML()}
  `;
};
