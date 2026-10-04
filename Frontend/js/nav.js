/* ============ NAV RENDERING ============ */
function renderNav() {
  const topbar = document.getElementById("topbar");
  const navLinks = document.getElementById("navLinks");
  const roleTag = document.getElementById("roleTag");
  topbar.classList.remove("teal");
  let html = "";
  if (state.role === "guest") {
    roleTag.textContent = "Book your visit";
    html = `
      <a onclick="go('home')" class="${navActive('home')}">Home</a>
      <a onclick="go('temples')" class="${navActive('temples')}">Temples</a>
      <a onclick="go('about')" class="${navActive('about')}">About</a>
      <a onclick="go('services')" class="${navActive('services')}">Services</a>
      <a onclick="go('contact')" class="${navActive('contact')}">Contact us</a>
      <a class="pill-btn" onclick="go('login')">Login</a>`;
  } else if (state.role === "user") {
    topbar.classList.add("teal"); roleTag.textContent = "Devotee dashboard";
    html = `
      <a onclick="go('home')" class="${navActive('home')}">Home</a>
      <a onclick="go('temples')" class="${navActive('temples')}">Temples</a>
      <a onclick="go('mybookings')" class="${navActive('mybookings')}">My Bookings</a>
      <a onclick="logout()">Logout</a>
      <span class="user-chip">${esc(state.currentUser?.name || "Devotee")}</span>`;
  } else if (state.role === "organizer") {
    topbar.classList.add("teal"); roleTag.textContent = "Organizer console";
    html = `
      <a onclick="go('orgdash')" class="${navActive('orgdash')}">Dashboard</a>
      <a onclick="go('orgtemple')" class="${navActive('orgtemple')}">My Temple</a>
      <a onclick="go('orgdarshans')" class="${navActive('orgdarshans')}">Darshan Slots</a>
      <a onclick="go('orgbookings')" class="${navActive('orgbookings')}">Bookings</a>
      <a onclick="logout()">Logout</a>
      <span class="user-chip">${esc(state.currentUser?.name || "")}</span>`;
  } else if (state.role === "admin") {
    topbar.classList.add("teal"); roleTag.textContent = "Admin console";
    html = `
      <a onclick="go('admindash')" class="${navActive('admindash')}">Dashboard</a>
      <a onclick="go('adminusers')" class="${navActive('adminusers')}">Users</a>
      <a onclick="go('adminorgs')" class="${navActive('adminorgs')}">Organizers</a>
      <a onclick="go('admintemples')" class="${navActive('admintemples')}">Temples</a>
      <a onclick="logout()">Logout</a>
      <span class="user-chip">${esc(state.currentUser?.name || "Admin")}</span>`;
  }
  navLinks.innerHTML = html;
}

function navActive(v) {
  return state.view === v ? "active" : "";
}

function logout() {
  localStorage.removeItem("darshanease_token");
  localStorage.removeItem("darshanease_user");
  state.role = "guest"; state.currentUser = null;
  toast("Signed out");
  go("home");
}

/* ============ ROUTER ============ */
/* Page renderers in renderers[view] may return either an HTML string
   (sync pages) or a Promise<string> (pages that fetch from the API).
   A render token guards against a slow fetch overwriting a page the
   user has since navigated away from. */
let _renderToken = 0;

function go(view, payload) {
  state.view = view;
  if (payload) Object.assign(state, payload);
  renderNav();

  const app = document.getElementById("app");
  const myToken = ++_renderToken;

  const renderer = renderers[view];
  if (!renderer) {
    app.innerHTML = `<div class="page-wrap container">Not found</div>`;
    return;
  }

  const result = renderer();

  if (result && typeof result.then === "function") {
    app.innerHTML = `<div class="page-wrap container"><p style="text-align:center;padding:60px 0;color:var(--ink-soft)">Loading…</p></div>`;
    result
      .then((html) => {
        if (myToken !== _renderToken) return; // user navigated elsewhere while we were loading
        app.innerHTML = html;
        window.scrollTo({ top: 0, behavior: "smooth" });
      })
      .catch((err) => {
        if (myToken !== _renderToken) return;
        app.innerHTML = `<div class="page-wrap container"><div class="empty-state"><h3>Something went wrong</h3><p>${esc(err.message)}</p></div></div>`;
      });
  } else {
    app.innerHTML = result;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
}
