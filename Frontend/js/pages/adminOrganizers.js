renderers.adminorgs = async () => {
  let organizers = [], temples = [];
  try {
    [organizers, temples] = await Promise.all([
      apiGetUsers("freelancer").then(r => r.users),
      apiGetTemples({ limit: 50 }).then(r => r.temples),
    ]);
  } catch (err) {
    return `<div class="page-wrap container"><div class="empty-state"><h3>Could not load organizers</h3><p>${esc(err.message)}</p></div></div>${footerHTML()}`;
  }

  window._adminTemplesCache = temples;

  return `
  <div class="page-wrap container">
    <h2 class="page-title teal-title">Organizers</h2>

    <table class="data">
      <tr><th>sl/no</th><th>UserId</th><th>Name</th><th>Email</th><th>Manages Temple</th></tr>
      ${organizers.map((o, i) => `<tr>
        <td>${i + 1}</td><td class="mono">${esc(o._id)}</td><td>${esc(o.name)}</td><td>${esc(o.email)}</td>
        <td>${esc(o.managedTemple?.name || "—")}</td>
      </tr>`).join("") || `<tr><td colspan="5">No organizers yet</td></tr>`}
    </table>

    <div class="form-card" style="max-width:520px;margin-top:30px">
      <h2 style="font-size:20px">Create Organizer Account</h2>
      <div class="field"><label>Name</label><input id="orgName" placeholder="Organizer name"></div>
      <div class="field"><label>Email</label><input id="orgEmail" placeholder="Email address"></div>
      <div class="field"><label>Phone</label><input id="orgPhone" placeholder="10-digit phone number"></div>
      <div class="field"><label>Password</label><input type="password" id="orgPassword" placeholder="Temporary password"></div>
      <div class="field">
        <label>Manages Temple</label>
        <select id="orgTempleId">
          ${temples.map(t => `<option value="${t._id}">${esc(t.name)}</option>`).join("")}
        </select>
      </div>
      <p id="orgCreateError" style="color:#B3261E;font-size:13px;min-height:18px"></p>
      <button class="btn-solid" onclick="createOrganizerAccount()">Create Organizer</button>
    </div>
  </div>
  ${footerHTML()}
`;
};

async function createOrganizerAccount() {
  const errEl = document.getElementById("orgCreateError");
  errEl.textContent = "";
  const payload = {
    name: document.getElementById("orgName").value.trim(),
    email: document.getElementById("orgEmail").value.trim(),
    phone: document.getElementById("orgPhone").value.trim(),
    password: document.getElementById("orgPassword").value,
    templeId: document.getElementById("orgTempleId").value,
  };
  if (!payload.name || !payload.email || !payload.phone || !payload.password || !payload.templeId) {
    errEl.textContent = "All fields are required.";
    return;
  }
  if (!isValidEmail(payload.email)) {
    errEl.textContent = "Please enter a correctly formatted email address (e.g. name@example.com).";
    return;
  }
  try {
    await apiCreateOrganizer(payload);
    toast("Organizer account created.");
    go("adminorgs");
  } catch (err) {
    errEl.textContent = err.message;
  }
}
