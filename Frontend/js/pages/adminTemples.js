renderers.admintemples = async () => {
  let temples = [];
  try {
    temples = (await apiGetTemples({ limit: 50 })).temples;
  } catch (err) {
    return `<div class="page-wrap container"><div class="empty-state"><h3>Could not load temples</h3><p>${esc(err.message)}</p></div></div>${footerHTML()}`;
  }
  window._adminTemplesCache = temples;

  return `
  <div class="page-wrap container">
    <h2 class="page-title teal-title">Temples</h2>

    <table class="data">
      <tr><th>sl/no</th><th>Name</th><th>City</th><th>State</th><th>Rating</th><th>Operation</th></tr>
      ${temples.map((t, i) => `<tr>
        <td>${i + 1}</td><td>${esc(t.name)}</td><td>${esc(t.location?.city || "")}</td><td>${esc(t.location?.state || "")}</td><td>${t.rating || "--"}</td>
        <td><button class="op-btn edit" onclick="openTempleEditor('${t._id}')">Edit</button><button class="op-btn del" onclick="deactivateTemple('${t._id}')">Deactivate</button></td>
      </tr>`).join("")}
    </table>

    <div class="top-actions" style="margin-top:20px"><button class="link-btn" onclick="openTempleEditor(null)">Add Temple</button></div>

    <div id="templeEditorWrap"></div>
  </div>
  ${footerHTML()}
`;
};

function openTempleEditor(templeId) {
  const t = templeId ? (window._adminTemplesCache || []).find(x => x._id === templeId) : null;
  const wrap = document.getElementById("templeEditorWrap");
  wrap.innerHTML = `
    <div class="form-card" style="max-width:560px;margin-top:24px">
      <h2 style="font-size:20px">${t ? "Edit Temple" : "Add Temple"}</h2>
      <div class="field"><label>Name</label><input id="teName" value="${t ? esc(t.name) : ""}"></div>
      <div class="field"><label>Deity</label><input id="teDeity" value="${t ? esc(t.deity || "") : ""}"></div>
      <div class="field" style="display:flex;gap:12px">
        <div style="flex:1"><label>City</label><input id="teCity" value="${t ? esc(t.location?.city || "") : ""}"></div>
        <div style="flex:1"><label>State</label><input id="teState" value="${t ? esc(t.location?.state || "") : ""}"></div>
      </div>
      <div class="field" style="display:flex;gap:12px">
        <div style="flex:1"><label>Open</label><input id="teOpen" value="${t ? esc(t.timings?.openTime || "06:00") : "06:00"}"></div>
        <div style="flex:1"><label>Close</label><input id="teClose" value="${t ? esc(t.timings?.closeTime || "20:00") : "20:00"}"></div>
      </div>
      <div class="field"><label>Image path (e.g. images/default-temple.jpg)</label><input id="teImage" value="${t && t.images?.[0]?.url ? esc(t.images[0].url) : "images/default-temple.jpg"}"></div>
      <div class="field"><label>Description</label><textarea id="teDesc">${t ? esc(t.description || "") : ""}</textarea></div>
      <p id="teError" style="color:#B3261E;font-size:13px;min-height:18px"></p>
      <button class="btn-solid" onclick="saveTempleFromAdmin(${t ? `'${t._id}'` : "null"})">${t ? "Save Changes" : "Create Temple"}</button>
    </div>
  `;
}

async function saveTempleFromAdmin(templeId) {
  const errEl = document.getElementById("teError");
  errEl.textContent = "";
  const payload = {
    name: document.getElementById("teName").value.trim(),
    deity: document.getElementById("teDeity").value.trim(),
    description: document.getElementById("teDesc").value.trim(),
    location: {
      city: document.getElementById("teCity").value.trim(),
      state: document.getElementById("teState").value.trim(),
    },
    timings: {
      openTime: document.getElementById("teOpen").value.trim(),
      closeTime: document.getElementById("teClose").value.trim(),
    },
    images: [{ url: document.getElementById("teImage").value.trim() || "images/default-temple.jpg" }],
  };
  if (!payload.name || !payload.location.city || !payload.location.state) {
    errEl.textContent = "Name, city and state are required.";
    return;
  }
  try {
    if (templeId) await apiUpdateTemple(templeId, payload);
    else await apiCreateTemple(payload);
    toast(templeId ? "Temple updated." : "Temple created.");
    go("admintemples");
  } catch (err) {
    errEl.textContent = err.message;
  }
}

async function deactivateTemple(templeId) {
  if (!confirm("Deactivate this temple? It will be hidden from devotees.")) return;
  try {
    await apiDeleteTemple(templeId);
    toast("Temple deactivated.");
    go("admintemples");
  } catch (err) {
    toast(err.message);
  }
}
