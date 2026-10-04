/* ============ API LAYER ============ */
/* Centralizes every fetch call to the DarshanEase backend, attaches the
   JWT (when present) and normalizes error handling so page code can just
   `await apiX(...)` and get back parsed JSON or a thrown Error with a
   friendly .message. */

const API_BASE_URL = "http://localhost:5000/api";

function getToken() {
  return localStorage.getItem("darshanease_token");
}

async function apiRequest(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new Error("Could not reach the DarshanEase server. Is the backend running on port 5000?");
  }

  let data = null;
  try {
    data = await res.json();
  } catch (_) {
    // no JSON body
  }

  if (!res.ok) {
    throw new Error((data && data.message) || `Request failed (${res.status})`);
  }
  return data;
}

/* ---- Auth ---- */
const apiRegister = (payload) => apiRequest("/auth/register", { method: "POST", body: payload });
const apiLogin = (payload) => apiRequest("/auth/login", { method: "POST", body: payload });
const apiGetMe = () => apiRequest("/auth/me", { auth: true });

/* ---- Temples ---- */
const apiGetTemples = (params = {}) => {
  const qs = new URLSearchParams(
    Object.fromEntries(Object.entries(params).filter(([, v]) => v !== undefined && v !== ""))
  ).toString();
  return apiRequest(`/temples${qs ? `?${qs}` : ""}`);
};
const apiGetTemple = (id) => apiRequest(`/temples/${id}`);
const apiGetTempleSlots = (id) => apiRequest(`/temples/${id}/slots`);
const apiCreateTemple = (payload) => apiRequest("/temples", { method: "POST", body: payload, auth: true });
const apiUpdateTemple = (id, payload) => apiRequest(`/temples/${id}`, { method: "PUT", body: payload, auth: true });
const apiDeleteTemple = (id) => apiRequest(`/temples/${id}`, { method: "DELETE", auth: true });

/* ---- Darshan slots (organizer) ---- */
const apiGetMySlots = () => apiRequest("/slots/mine", { auth: true });
const apiCreateSlot = (payload) => apiRequest("/slots", { method: "POST", body: payload, auth: true });
const apiUpdateSlot = (id, payload) => apiRequest(`/slots/${id}`, { method: "PUT", body: payload, auth: true });
const apiDeleteSlot = (id) => apiRequest(`/slots/${id}`, { method: "DELETE", auth: true });

/* ---- Bookings ---- */
const apiCreateBooking = (payload) => apiRequest("/bookings", { method: "POST", body: payload, auth: true });
const apiGetMyBookings = () => apiRequest("/bookings/my", { auth: true });
const apiGetBooking = (id) => apiRequest(`/bookings/${id}`, { auth: true });
const apiGetTempleBookings = () => apiRequest("/bookings/temple/mine", { auth: true });
const apiGetAllBookings = () => apiRequest("/bookings", { auth: true });

/* ---- Payments (demo) ---- */
const apiCreatePayment = (payload) => apiRequest("/payments/create", { method: "POST", body: payload, auth: true });
const apiVerifyPayment = (payload) => apiRequest("/payments/verify", { method: "POST", body: payload, auth: true });

/* ---- Admin / users ---- */
const apiGetUsers = (role) => apiRequest(`/users${role ? `?role=${role}` : ""}`, { auth: true });
const apiCreateOrganizer = (payload) => apiRequest("/users/organizers", { method: "POST", body: payload, auth: true });
const apiDeactivateUser = (id) => apiRequest(`/users/${id}`, { method: "DELETE", auth: true });
const apiGetStats = () => apiRequest("/users/stats", { auth: true });
