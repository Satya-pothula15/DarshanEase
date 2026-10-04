renderers.mybookings = async () => {
  let bookings = [];
  try {
    const res = await apiGetMyBookings();
    bookings = res.bookings;
    window._myBookingsCache = bookings; // used by downloadTicket()
  } catch (err) {
    return `<div class="page-wrap container"><div class="empty-state"><h3>Could not load your bookings</h3><p>${esc(err.message)}</p></div></div>${footerHTML()}`;
  }

  return `
    <div class="page-wrap container">

        <h2 class="page-title teal-title">
            My Bookings
        </h2>

        ${
            bookings.length
                ? bookings.map(b => bookingCardHTML(b)).join("")
                :
                `
                <div class="empty-state">
                    <h3>No bookings yet</h3>

                    <p>
                        Your booked darshans will appear here
                        with a QR entry pass.
                    </p>

                    <button
                        class="link-btn"
                        style="margin-top:15px"
                        onclick="go('temples')">

                        Browse Temples

                    </button>

                </div>
                `
        }

    </div>

    ${footerHTML()}
    `;
};
