/* ============ AUTH ACTIONS (real, backed by the API) ============ */

function mapRoleToUIRole(apiRole) {
  if (apiRole === "admin") return "admin";
  if (apiRole === "freelancer") return "organizer";
  return "user"; // devotee
}

function homeViewForRole(uiRole) {
  if (uiRole === "admin") return "admindash";
  if (uiRole === "organizer") return "orgdash";
  return "home";
}

function persistSession(token, user) {
  localStorage.setItem("darshanease_token", token);
  localStorage.setItem("darshanease_user", JSON.stringify(user));
  state.role = mapRoleToUIRole(user.role);
  state.currentUser = user;
}

/* Called on page load to restore a session from localStorage, if any. */
function restoreSession() {
  const token = localStorage.getItem("darshanease_token");
  const userRaw = localStorage.getItem("darshanease_user");
  if (!token || !userRaw) return;
  try {
    const user = JSON.parse(userRaw);
    state.role = mapRoleToUIRole(user.role);
    state.currentUser = user;
  } catch (_) {
    localStorage.removeItem("darshanease_token");
    localStorage.removeItem("darshanease_user");
  }
}

async function doLogin() {
  const email = document.getElementById("loginEmail").value.trim();
  const password = document.getElementById("loginPass").value;
  const errEl = document.getElementById("loginError");
  if (errEl) errEl.textContent = "";

  if (!email || !password) {
    if (errEl) errEl.textContent = "Please enter your email and password.";
    return;
  }
  if (!isValidEmail(email)) {
    if (errEl) errEl.textContent = "Please enter a correctly formatted email address.";
    return;
  }

  const selectedRole = typeof _loginRole !== "undefined" ? _loginRole : "devotee";

  try {
    const res = await apiLogin({ email, password });
    const actualRole = mapRoleToUIRole(res.user.role);

    if (actualRole !== selectedRole) {
      const roleLabel = LOGIN_ROLES[actualRole] ? LOGIN_ROLES[actualRole].label : actualRole;
      if (errEl) errEl.textContent = `This account is registered as ${roleLabel}, not ${LOGIN_ROLES[selectedRole].label}. Please switch tabs and try again.`;
      return;
    }

    persistSession(res.token, res.user);
    toast(`Welcome back, ${res.user.name}!`);
    go(homeViewForRole(state.role));
  } catch (err) {
    if (errEl) errEl.textContent = err.message;
    else toast(err.message);
  }
}

async function doSignup() {
  const name = document.getElementById("suName").value.trim();
  const email = document.getElementById("suEmail").value.trim();
  const phone = document.getElementById("suPhone").value.trim();
  const password = document.getElementById("suPassword").value;
  const confirmPassword = document.getElementById("suConfirmPassword").value;
  const errEl = document.getElementById("signupError");
  if (errEl) errEl.textContent = "";

  if (!name || !email || !phone || !password || !confirmPassword) {
    if (errEl) errEl.textContent = "Please fill in every field.";
    return;
  }
  if (!isValidEmail(email)) {
    if (errEl) errEl.textContent = "Please enter a correctly formatted email address (e.g. name@example.com).";
    return;
  }
  if (password !== confirmPassword) {
    if (errEl) errEl.textContent = "Passwords do not match.";
    return;
  }

  try {
    const res = await apiRegister({ name, email, phone, password, confirmPassword });
    persistSession(res.token, res.user);
    toast("Account created — welcome to DarshanEase!");
    go("home");
  } catch (err) {
    if (errEl) errEl.textContent = err.message;
    else toast(err.message);
  }
}
