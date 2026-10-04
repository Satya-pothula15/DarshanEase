const WALLETS = ["Paytm", "PhonePe", "Amazon Pay", "Mobikwik"];
const BANKS = ["State Bank of India", "HDFC Bank", "ICICI Bank", "Axis Bank", "Punjab National Bank", "Kotak Mahindra Bank"];

let _payMethod = "upi";
let _payWallet = WALLETS[0];
let _payAmount = 0;
let _payBookingId = null;

function methodTabsHTML() {
  const methods = [
    { id: "upi", label: "UPI" },
    { id: "card", label: "Card" },
    { id: "netbanking", label: "Netbanking" },
    { id: "wallet", label: "Wallet" },
  ];
  return `
    <div class="role-tabs">
      ${methods.map(m => `
        <button type="button" class="role-tab ${m.id === _payMethod ? "active" : ""}" onclick="setPayMethod('${m.id}')">${m.label}</button>
      `).join("")}
    </div>
  `;
}

function methodFieldsHTML() {
  if (_payMethod === "upi") {
    const qrData = encodeURIComponent(`upi://pay?pa=darshanease@demo&pn=DarshanEase&am=${_payAmount}&cu=INR&tn=Darshan%20Booking%20(Demo)`);
    return `
      <div class="field"><label>UPI ID</label><input id="payUpiId" placeholder="yourname@bank"></div>
      <p style="text-align:center;color:var(--ink-soft,#8a8a8a);font-size:12px;margin:4px 0 10px">— or scan with any UPI app —</p>
      <div style="text-align:center;margin-bottom:8px">
        <img src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${qrData}" alt="Demo UPI QR code" style="border-radius:10px;background:#fff;padding:8px">
        <p style="font-size:11px;color:var(--ink-soft,#8a8a8a);margin-top:6px">Demo QR — no real UPI app will complete this payment.</p>
      </div>
    `;
  }
  if (_payMethod === "card") {
    return `
      <div class="field"><label>Name on Card</label><input id="payCardName" placeholder="Full name"></div>
      <div class="field"><label>Card Number</label><input id="payCardNumber" placeholder="1234 5678 9012 3456" maxlength="19" oninput="formatCardNumberInput(this)"></div>
      <div class="field" style="display:flex;gap:12px">
        <div style="flex:1"><label>Expiry (MM/YY)</label><input id="payCardExpiry" placeholder="MM/YY" maxlength="5" oninput="formatExpiryInput(this)"></div>
        <div style="flex:1"><label>CVV</label><input id="payCardCvv" type="password" placeholder="•••" maxlength="4"></div>
      </div>
      <p style="font-size:11px;color:var(--ink-soft,#8a8a8a);margin-top:-4px">Demo card form — these details are never sent to the server or stored anywhere.</p>
    `;
  }
  if (_payMethod === "netbanking") {
    return `
      <div class="field">
        <label>Select your bank</label>
        <select id="payBank">
          ${BANKS.map(b => `<option value="${esc(b)}">${esc(b)}</option>`).join("")}
        </select>
      </div>
      <p style="font-size:11px;color:var(--ink-soft,#8a8a8a);margin-top:-4px">You'll be redirected to your bank's login in a real integration — this is a demo, so it isn't needed here.</p>
    `;
  }
  // wallet
  return `
    <div class="field">
      <label>Choose a wallet</label>
      <div class="role-tabs" style="flex-wrap:wrap">
        ${WALLETS.map(w => `<button type="button" class="role-tab ${w === _payWallet ? "active" : ""}" style="flex:1 1 45%" onclick="setPayWallet('${w}')">${esc(w)}</button>`).join("")}
      </div>
    </div>
  `;
}

function refreshMethodFieldsPanel() {
  const wrap = document.getElementById("methodFieldsWrap");
  const tabsWrap = document.getElementById("methodTabsWrap");
  if (!wrap) return;
  wrap.innerHTML = methodFieldsHTML();
  if (tabsWrap) tabsWrap.innerHTML = methodTabsHTML();
  const errEl = document.getElementById("payError");
  if (errEl) errEl.textContent = "";
}

function setPayMethod(method) {
  _payMethod = method;
  refreshMethodFieldsPanel();
}

function setPayWallet(wallet) {
  _payWallet = wallet;
  refreshMethodFieldsPanel();
}

function formatCardNumberInput(el) {
  el.value = el.value.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiryInput(el) {
  let v = el.value.replace(/\D/g, "").slice(0, 4);
  if (v.length > 2) v = v.slice(0, 2) + "/" + v.slice(2);
  el.value = v;
}

renderers.payment = async () => {
  const bookingId = state.pendingBookingId;
  if (!bookingId) return `<div class="page-wrap container">No pending booking to pay for.</div>${footerHTML()}`;

  let booking;
  try {
    const res = await apiGetBooking(bookingId);
    booking = res.booking;
  } catch (err) {
    return `<div class="page-wrap container"><div class="empty-state"><h3>Could not load this booking</h3><p>${esc(err.message)}</p></div></div>${footerHTML()}`;
  }

  if (booking.bookingStatus !== "pending") {
    return `<div class="page-wrap container"><div class="empty-state"><h3>This booking is already ${esc(booking.bookingStatus)}</h3>
      <button class="link-btn" style="margin-top:15px" onclick="go('mybookings')">Go to My Bookings</button></div></div>${footerHTML()}`;
  }

  const temple = booking.darshanSlot?.temple;
  _payMethod = "upi";
  _payWallet = WALLETS[0];
  _payAmount = booking.totalAmount;
  _payBookingId = booking._id;

  return `
  <div class="page-wrap container">
    <div class="form-card" style="max-width:480px">
      <h2>Demo Payment</h2>
      <div class="demo-note" style="background:rgba(255,255,255,0.12);border-color:rgba(255,255,255,0.4);color:#eafaf8;margin-bottom:16px">
        This is a <b>demo payment</b> for a student project — no real money moves and no card/UPI/bank details are collected or stored.
      </div>

      <div class="info-list" style="margin-bottom:16px">
        <div><span>Temple</span><b>${esc(temple?.name || "--")}</b></div>
        <div><span>Darshan</span><b>${esc(booking.darshanSlot?.poojaType || "--")}</b></div>
        <div><span>Tickets</span><b>${booking.numberOfTickets}</b></div>
        <div><span>Amount</span><b>₹${booking.totalAmount}</b></div>
      </div>

      <div class="field">
        <label>Payment Method</label>
        <div id="methodTabsWrap">${methodTabsHTML()}</div>
      </div>

      <div id="methodFieldsWrap">${methodFieldsHTML()}</div>

      <p id="payError" style="color:#B3261E;font-size:13px;min-height:18px"></p>

      <button class="btn-solid" id="payNowBtn" onclick="confirmDemoPayment()">Pay ₹${booking.totalAmount} (Demo)</button>
    </div>
  </div>
  ${footerHTML()}
`;
};

/* Only the chosen method enum ever reaches apiCreatePayment — card/UPI/bank
   fields below are for realism in the demo UI only and are read solely to
   validate the form looks filled in; their values are never sent anywhere. */
function validatePayMethodFields() {
  if (_payMethod === "upi") {
    const upiId = document.getElementById("payUpiId").value.trim();
    if (!/^[\w.\-]{2,}@[a-zA-Z]{2,}$/.test(upiId)) {
      return "Please enter a valid UPI ID (e.g. name@bank), or scan the QR code with your UPI app.";
    }
  } else if (_payMethod === "card") {
    const name = document.getElementById("payCardName").value.trim();
    const number = document.getElementById("payCardNumber").value.replace(/\s/g, "");
    const expiry = document.getElementById("payCardExpiry").value.trim();
    const cvv = document.getElementById("payCardCvv").value.trim();
    if (!name) return "Please enter the name on the card.";
    if (!/^\d{16}$/.test(number)) return "Please enter a valid 16-digit card number.";
    if (!/^\d{2}\/\d{2}$/.test(expiry)) return "Please enter the expiry as MM/YY.";
    if (!/^\d{3,4}$/.test(cvv)) return "Please enter a valid CVV.";
  } else if (_payMethod === "netbanking") {
    const bank = document.getElementById("payBank").value;
    if (!bank) return "Please select your bank.";
  }
  // wallet: a wallet is always selected by default, nothing to validate
  return null;
}

async function confirmDemoPayment() {
  const btn = document.getElementById("payNowBtn");
  const errEl = document.getElementById("payError");
  errEl.textContent = "";

  const validationError = validatePayMethodFields();
  if (validationError) {
    errEl.textContent = validationError;
    return;
  }

  btn.disabled = true;
  btn.textContent = "Processing demo payment…";

  try {
    const createRes = await apiCreatePayment({ bookingId: _payBookingId, method: _payMethod });
    await apiVerifyPayment({ paymentId: createRes.payment._id });
    toast("Demo payment successful — darshan confirmed!");
    go("mybookings");
  } catch (err) {
    errEl.textContent = err.message;
    btn.disabled = false;
    btn.textContent = "Try again";
  }
}
