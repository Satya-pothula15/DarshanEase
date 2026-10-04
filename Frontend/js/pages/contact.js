renderers.contact = () => `
  <div class="page-wrap container" style="max-width:520px">
    <h2 class="page-title">Contact us</h2>
    <div class="card">
      <div class="field"><label>Name</label><input id="cName" placeholder="Your name"></div>
      <div class="field"><label>Email</label><input id="cEmail" placeholder="you@example.com"></div>
      <div class="field"><label>Message</label><textarea id="cMessage" placeholder="How can we help?"></textarea></div>
      <p id="cError" style="color:#B3261E;font-size:13px;min-height:18px"></p>
      <button class="btn-solid" onclick="submitContactForm()">Send message</button>
    </div>
  </div>
  ${footerHTML()}
`;

function submitContactForm() {
  const errEl = document.getElementById("cError");
  const name = document.getElementById("cName").value.trim();
  const email = document.getElementById("cEmail").value.trim();
  const message = document.getElementById("cMessage").value.trim();

  if (!name || !email || !message) {
    errEl.textContent = "Please fill in every field.";
    return;
  }
  if (!isValidEmail(email)) {
    errEl.textContent = "Please enter a correctly formatted email address (e.g. name@example.com).";
    return;
  }

  errEl.textContent = "";
  document.getElementById("cName").value = "";
  document.getElementById("cEmail").value = "";
  document.getElementById("cMessage").value = "";
  toast("Message sent — we will get back to you soon.");
}
