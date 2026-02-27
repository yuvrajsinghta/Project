import { qs, toast } from "./utils.js";

const AUTH_KEYS = {
  USERS: "uw_users",          // array of users
  SESSION: "uw_session_user", // active session userId
};

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}
function writeJSON(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

function getUsers() {
  return readJSON(AUTH_KEYS.USERS, []);
}

function saveUsers(users) {
  writeJSON(AUTH_KEYS.USERS, users);
}

function setSession(userId) {
  localStorage.setItem(AUTH_KEYS.SESSION, String(userId));
}

function clearSession() {
  localStorage.removeItem(AUTH_KEYS.SESSION);
}

function getSessionUser() {
  const id = localStorage.getItem(AUTH_KEYS.SESSION);
  if (!id) return null;
  const users = getUsers();
  return users.find((u) => String(u.id) === String(id)) || null;
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email || "").trim());
}
function isValidPhone(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  return digits.length >= 10;
}

function signupHandler() {
  const form = qs("[data-signup-form]");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const fullName = (qs("#su_name")?.value || "").trim();
    const email = (qs("#su_email")?.value || "").trim().toLowerCase();
    const phone = (qs("#su_phone")?.value || "").trim();
    const password = (qs("#su_password")?.value || "").trim();

    if (!fullName || !email || !phone || !password) {
      toast("Please fill all fields");
      return;
    }
    if (!isValidEmail(email)) {
      toast("Please enter a valid email");
      return;
    }
    if (!isValidPhone(phone)) {
      toast("Please enter a valid phone number");
      return;
    }
    if (password.length < 6) {
      toast("Password must be at least 6 characters");
      return;
    }

    const users = getUsers();
    const exists = users.some((u) => u.email === email);
    if (exists) {
      toast("Account already exists. Please login.");
      window.location.href = "./login.html";
      return;
    }

    const user = {
      id: `u_${Date.now()}`,
      fullName,
      email,
      phone,
      password, // demo only (never store plaintext in real apps)
      createdAt: new Date().toISOString(),
    };

    users.push(user);
    saveUsers(users);
    setSession(user.id);

    toast("Signup successful");
    window.location.href = "./profile.html";
  });
}

function loginHandler() {
  const form = qs("[data-login-form]");
  if (!form) return;

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const email = (qs("#li_email")?.value || "").trim().toLowerCase();
    const password = (qs("#li_password")?.value || "").trim();

    if (!email || !password) {
      toast("Please enter email and password");
      return;
    }

    const users = getUsers();
    const user = users.find((u) => u.email === email && u.password === password);

    if (!user) {
      toast("Invalid credentials");
      return;
    }

    setSession(user.id);
    toast("Logged in");
    window.location.href = "./profile.html";
  });
}

function profileHandler() {
  const box = qs("[data-profile]");
  if (!box) return;

  const user = getSessionUser();
  if (!user) {
    toast("Please login first");
    window.location.href = "./login.html";
    return;
  }

  box.innerHTML = `
    <div class="profilebox">
      <div class="kv"><span>Name</span><strong>${user.fullName}</strong></div>
      <div class="kv"><span>Email</span><strong>${user.email}</strong></div>
      <div class="kv"><span>Phone</span><strong>${user.phone}</strong></div>
      <div class="kv"><span>Member Since</span><strong>${new Date(user.createdAt).toLocaleDateString()}</strong></div>

      <div style="display:flex; gap:10px; flex-wrap:wrap; margin-top:10px;">
        <a class="btn btn--outline" href="./shop.html">Shop</a>
        <a class="btn btn--outline" href="./wishlist.html">Wishlist</a>
        <a class="btn btn--outline" href="./cart.html">Cart</a>
        <button class="btn btn--primary" type="button" data-logout>Logout</button>
      </div>
    </div>
  `;

  qs("[data-logout]")?.addEventListener("click", () => {
    clearSession();
    toast("Logged out");
    window.location.href = "./index.html";
  });
}

document.addEventListener("DOMContentLoaded", () => {
  signupHandler();
  loginHandler();
  profileHandler();
});