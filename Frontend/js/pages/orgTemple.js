renderers.orgtemple = async () => {
  const templeId = state.currentUser?.managedTemple;
  if (!templeId) return `<div class="page-wrap container"><div class="empty-state"><h3>No temple assigned</h3></div></div>${footerHTML()}`;

  let t;
  try {
    t = (await apiGetTemple(templeId)).temple;
  } catch (err) {
    return `<div class="page-wrap container"><div class="empty-state"><h3>Could not load temple</h3><p>${esc(err.message)}</p></div></div>${footerHTML()}`;
  }

  return `
  <div class="page-wrap container">
    <div class="top-actions"><button class="link-btn" onclick="go('orgedit')">Edit Temple</button></div>
    <h2 class="page-title teal-title">My Temple</h2>
    <div class="card" style="max-width:520px;margin:0 auto">
      <div class="temple-art" style="background:${colors[0]};height:190px;margin:-26px -26px 18px">${gopuramSVG("#fbf3e7", 120)}</div>
      <h3 style="color:var(--maroon-dark)">${esc(t.name)}</h3>
      <div class="badge-row"><span><b>Open:</b> ${esc(t.timings?.openTime || "--")}</span><span><b>Close:</b> ${esc(t.timings?.closeTime || "--")}</span></div>
      <p class="desc" style="display:block"><b>Location:</b> ${esc(t.location?.city || "")}, ${esc(t.location?.state || "")}</p>
      <p class="desc" style="display:block"><b>Description:</b> ${esc(t.description || "")}</p>
    </div>
  </div>
  ${footerHTML()}
  `;
};

renderers.orgedit = async () => {
  const templeId = state.currentUser?.managedTemple;
  if (!templeId) return `<div class="page-wrap container"><div class="empty-state"><h3>No temple assigned</h3></div></div>${footerHTML()}`;

  let t;
  try {
    t = (await apiGetTemple(templeId)).temple;
  } catch (err) {
    return `<div class="page-wrap container"><div class="empty-state"><h3>Could not load temple</h3><p>${esc(err.message)}</p></div></div>${footerHTML()}`;
  }

  return `
  <div class="page-wrap container">
    <div class="form-card" style="max-width:560px">
      <h2>Update Temple</h2>
      <div class="field"><label>Temple Name</label><input id="edName" value="${esc(t.name)}"></div>
      <div class="field" style="display:flex;gap:12px">
        <div style="flex:1"><label>Open</label><input id="edOpen" value="${esc(t.timings?.openTime || "")}"></div>
        <div style="flex:1"><label>Close</label><input id="edClose" value="${esc(t.timings?.closeTime || "")}"></div>
      </div>
      <div class="field"><label>City</label><input id="edCity" value="${esc(t.location?.city || "")}"></div>
      <div class="field"><label>Description</label><textarea id="edDesc">${esc(t.description || "")}</textarea></div>
      <p id="edError" style="color:#B3261E;font-size:13px;min-height:18px"></p>
      <button class="btn-solid" onclick="saveTemple('${t._id}')">Update</button>
    </div>
  </div>
  ${footerHTML()}
  `;
};

async function saveTemple(templeId) {
  const errEl = document.getElementById("edError");
  errEl.textContent = "";
  try {
    await apiUpdateTemple(templeId, {
      name: document.getElementById("edName").value.trim(),
      timings: {
        openTime: document.getElementById("edOpen").value.trim(),
        closeTime: document.getElementById("edClose").value.trim(),
      },
      location: { city: document.getElementById("edCity").value.trim() },
      description: document.getElementById("edDesc").value.trim(),
    });
    toast("Temple details updated");
    go("orgtemple");
  } catch (err) {
    errEl.textContent = err.message;
  }
}
