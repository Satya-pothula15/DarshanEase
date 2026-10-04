renderers.orgdarshans = async () => {
  let slots = [];
  try {
    slots = (await apiGetMySlots()).slots;
  } catch (err) {
    return `<div class="page-wrap container"><div class="empty-state"><h3>Could not load darshan slots</h3><p>${esc(err.message)}</p></div></div>${footerHTML()}`;
  }
  window._orgSlotsCache = slots;

  return `
  <div class="page-wrap container">
    <div class="top-actions"><button class="link-btn" onclick="go('orgcreate')">Create Darshan Slot</button></div>
    <h2 class="page-title teal-title">My Darshan Slots</h2>
    <div class="grid grid-3">
      ${slots.length ? slots.map(s => `
        <div class="darshan-card">
          <h4>${esc(s.poojaType)}</h4>
          <div class="row"><span>Date</span><b>${esc(fmtDate(s.date))}</b></div>
          <div class="row"><span>Timing</span><b>${esc(s.startTime)} – ${esc(s.endTime)}</b></div>
          <div class="row"><span>Price</span><b>${fmtMoney(s.pricePerTicket)}</b></div>
          <div class="row"><span>Booked</span><b>${s.bookedCount} / ${s.totalCapacity}</b></div>
          <div class="row"><span>Status</span><b style="text-transform:capitalize">${esc(s.status)}</b></div>
          <div style="display:flex;gap:8px;margin-top:10px">
            <button class="op-btn edit" onclick="go('orgeditslot',{editSlotId:'${s._id}'})">Edit</button>
            <button class="op-btn del" onclick="deleteOrgSlot('${s._id}')">Delete</button>
          </div>
        </div>`).join("") : `<div class="empty-state" style="grid-column:1/-1"><h3>No darshan slots yet</h3></div>`}
    </div>
  </div>
  ${footerHTML()}
  `;
};

renderers.orgcreate = () => `
  <div class="page-wrap container">
    <div class="form-card" style="max-width:560px">
      <h2>Create Darshan Slot</h2>
      <div class="field"><label>Pooja / Darshan Type</label><input id="cdName" placeholder="e.g. Special Darshan"></div>
      <div class="field"><label>Date</label><input id="cdDate" type="date"></div>
      <div class="field" style="display:flex;gap:12px">
        <div style="flex:1"><label>Start Time</label><input id="cdOpen" type="time"></div>
        <div style="flex:1"><label>End Time</label><input id="cdClose" type="time"></div>
      </div>
      <div class="field" style="display:flex;gap:12px">
        <div style="flex:1"><label>Price / Ticket</label><input id="cdPrice" type="number" min="0" placeholder="0"></div>
        <div style="flex:1"><label>Total Capacity</label><input id="cdCapacity" type="number" min="1" placeholder="100"></div>
      </div>
      <p id="cdError" style="color:#B3261E;font-size:13px;min-height:18px"></p>
      <button class="btn-solid" onclick="createDarshanSlot()">Create</button>
    </div>
  </div>
  ${footerHTML()}
`;

renderers.orgeditslot = () => {
  const slot = (window._orgSlotsCache || []).find(s => s._id === state.editSlotId);
  if (!slot) return `<div class="page-wrap container">Slot not found.</div>${footerHTML()}`;
  return `
  <div class="page-wrap container">
    <div class="form-card" style="max-width:560px">
      <h2>Edit Darshan Slot</h2>
      <div class="field"><label>Pooja / Darshan Type</label><input id="cdName" value="${esc(slot.poojaType)}"></div>
      <div class="field" style="display:flex;gap:12px">
        <div style="flex:1"><label>Price / Ticket</label><input id="cdPrice" type="number" min="0" value="${slot.pricePerTicket}"></div>
        <div style="flex:1"><label>Total Capacity</label><input id="cdCapacity" type="number" min="${slot.bookedCount}" value="${slot.totalCapacity}"></div>
      </div>
      <div class="field">
        <label>Status</label>
        <select id="cdStatus">
          <option value="open" ${slot.status === "open" ? "selected" : ""}>Open</option>
          <option value="closed" ${slot.status === "closed" ? "selected" : ""}>Closed</option>
        </select>
      </div>
      <p id="cdError" style="color:#B3261E;font-size:13px;min-height:18px"></p>
      <button class="btn-solid" onclick="updateDarshanSlot('${slot._id}')">Save Changes</button>
    </div>
  </div>
  ${footerHTML()}
`;
};

async function createDarshanSlot() {
  const errEl = document.getElementById("cdError");
  errEl.textContent = "";
  const payload = {
    temple: state.currentUser.managedTemple,
    poojaType: document.getElementById("cdName").value.trim(),
    date: document.getElementById("cdDate").value,
    startTime: document.getElementById("cdOpen").value,
    endTime: document.getElementById("cdClose").value,
    pricePerTicket: parseInt(document.getElementById("cdPrice").value, 10) || 0,
    totalCapacity: parseInt(document.getElementById("cdCapacity").value, 10) || 0,
  };
  if (!payload.poojaType || !payload.date || !payload.startTime || !payload.endTime || !payload.totalCapacity) {
    errEl.textContent = "Please fill in every field.";
    return;
  }
  try {
    await apiCreateSlot(payload);
    toast("Darshan slot created");
    go("orgdarshans");
  } catch (err) {
    errEl.textContent = err.message;
  }
}

async function updateDarshanSlot(slotId) {
  const errEl = document.getElementById("cdError");
  errEl.textContent = "";
  try {
    await apiUpdateSlot(slotId, {
      poojaType: document.getElementById("cdName").value.trim(),
      pricePerTicket: parseInt(document.getElementById("cdPrice").value, 10) || 0,
      totalCapacity: parseInt(document.getElementById("cdCapacity").value, 10) || 0,
      status: document.getElementById("cdStatus").value,
    });
    toast("Darshan slot updated");
    go("orgdarshans");
  } catch (err) {
    errEl.textContent = err.message;
  }
}

async function deleteOrgSlot(slotId) {
  if (!confirm("Delete this darshan slot?")) return;
  try {
    await apiDeleteSlot(slotId);
    toast("Darshan slot deleted");
    go("orgdarshans");
  } catch (err) {
    toast(err.message);
  }
}
