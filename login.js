// Client-side Login / Registration (demo only)
// Uses Web Crypto API to hash passwords before storing in localStorage.
// Not suitable for production — real apps must use server-side authentication.

/**
 * Helpers: convert between strings and ArrayBuffers
 */
async function hashPassword(password, salt) {
  const enc = new TextEncoder();
  const data = enc.encode(password + salt);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return bufferToHex(hashBuffer);
}

function bufferToHex(buffer) {
  const bytes = new Uint8Array(buffer);
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('');
}

function randomSalt(len = 12) {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let s = '';
  const arr = new Uint32Array(len);
  crypto.getRandomValues(arr);
  for (let i = 0; i < len; i++) s += chars[arr[i] % chars.length];
  return s;
}

// Local storage users key
const USERS_KEY = 'demo_users_v1';

function loadUsers() {
  try {
    return JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
  } catch (e) {
    return {};
  }
}

function saveUsers(users) {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
}

function setCurrentUser(username) {
  localStorage.setItem('demo_current_user', username);
}

function getCurrentUser() {
  return localStorage.getItem('demo_current_user');
}

function clearCurrentUser() {
  localStorage.removeItem('demo_current_user');
}

// Register a new user
async function registerUser(username, password) {
  const users = loadUsers();
  if (users[username]) {
    throw new Error('User already exists');
  }
  const salt = randomSalt(16);
  const hash = await hashPassword(password, salt);
  users[username] = { hash, salt, createdAt: Date.now() };
  saveUsers(users);
  return true;
}

// Authenticate existing user
async function authenticateUser(username, password) {
  const users = loadUsers();
  const record = users[username];
  if (!record) return false;
  const hash = await hashPassword(password, record.salt);
  return hash === record.hash;
}

// Expose functions for UI
window.authDemo = {
  registerUser,
  authenticateUser,
  setCurrentUser,
  getCurrentUser,
  clearCurrentUser,
  loadUsers
};

// Auto-hook forms if present in the page
document.addEventListener('DOMContentLoaded', () => {
  const registerForm = document.getElementById('register-form');
  const loginForm = document.getElementById('login-form');
  const logoutBtn = document.getElementById('logout-btn');
  const currentUserEl = document.getElementById('current-user');

  if (currentUserEl) {
    const u = getCurrentUser();
    currentUserEl.textContent = u ? `Welcome to my project, ${u}!` : 'Not signed in';
  }

  if (registerForm) {
    registerForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const username = form.elements['username'].value.trim();
      const password = form.elements['password'].value;
      const msg = form.querySelector('.msg');
      try {
        if (!username || !password) throw new Error('Provide username and password');
        await registerUser(username, password);
        msg && (msg.textContent = 'Registered successfully. You can now log in.');
        form.reset();
      } catch (err) {
        msg && (msg.textContent = err.message);
      }
    });
  }

  if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
      e.preventDefault();
      const form = e.target;
      const username = form.elements['username'].value.trim();
      const password = form.elements['password'].value;
      const msg = form.querySelector('.msg');
      try {
        if (!username || !password) throw new Error('Provide username and password');
        const ok = await authenticateUser(username, password);
        if (!ok) throw new Error('Invalid credentials');
  setCurrentUser(username);
  msg && (msg.textContent = 'Logged in successfully');
  if (currentUserEl) currentUserEl.textContent = `Welcome to my project, ${username}!`;
        form.reset();
      } catch (err) {
        msg && (msg.textContent = err.message);
      }
    });
  }

  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      clearCurrentUser();
      if (currentUserEl) currentUserEl.textContent = 'Not signed in';
    });
  }
});

// mark the todo item 1 completed via the todo tool would be next, but UI will show functions
