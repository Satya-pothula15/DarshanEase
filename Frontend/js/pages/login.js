const LOGIN_ROLES = {
  devotee: { label: "Devotee", blurb: "Book darshan slots at your favourite temples.", cta: "Log in as Devotee" },
  organizer: { label: "Organizer", blurb: "Manage your temple and its darshan slots.", cta: "Log in as Organizer" },
  admin: { label: "Admin", blurb: "Manage the whole DarshanEase platform.", cta: "Log in as Admin" },
};

let _loginRole = "devotee";

function renderLoginRoleTabs() {
  return `
    <div class="role-tabs">
      ${Object.keys(LOGIN_ROLES).map(r => `
        <button type="button" class="role-tab ${r === _loginRole ? "active" : ""}" onclick="setLoginRole('${r}')">
          ${LOGIN_ROLES[r].label}
        </button>
      `).join("")}
    </div>
  `;
}

function setLoginRole(role) {
  _loginRole = role;
  const tabsWrap = document.getElementById("loginRoleTabs");
  const blurb = document.getElementById("loginRoleBlurb");
  const btn = document.getElementById("loginSubmitBtn");
  const err = document.getElementById("loginError");
  if (!tabsWrap) return;
  tabsWrap.innerHTML = renderLoginRoleTabs();
  blurb.textContent = LOGIN_ROLES[role].blurb;
  btn.textContent = LOGIN_ROLES[role].cta;
  if (err) err.textContent = "";
}

renderers.login = () => {
  _loginRole = "devotee";
  return `
  <div class="page-wrap container">
    <div class="form-card">
      <h2>Login to DarshanEase</h2>

      <p style="color:var(--ink-soft,#8a8a8a);font-size:13px;margin:-6px 0 14px">
        Choose how you'll use DarshanEase, then log in.
      </p>

      <div id="loginRoleTabs">${renderLoginRoleTabs()}</div>
      <p id="loginRoleBlurb" style="font-size:13px;color:var(--ink-soft,#8a8a8a);margin:8px 0 16px">${LOGIN_ROLES.devotee.blurb}</p>

      <div class="field"><label>Email address</label><input id="loginEmail" placeholder="Email address"></div>
      <div class="field"><label>Password</label><input type="password" id="loginPass" placeholder="Password"></div>
      <p id="loginError" style="color:#ffb4a8;font-size:13px;min-height:18px"></p>
      <button class="btn-solid" id="loginSubmitBtn" onclick="doLogin()">${LOGIN_ROLES.devotee.cta}</button>
      <div class="switch-link">Don't have a devotee account? <a onclick="go('signup')">Create one — Signup</a></div>
      <p style="font-size:12px;color:var(--ink-soft,#8a8a8a);margin-top:10px">
        Organizer and Admin accounts are created by the DarshanEase admin team, not through signup.
      </p>
    </div>
  </div>
  ${footerHTML()}
`;
};
