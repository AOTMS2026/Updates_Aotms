import { API_BASE_URL } from '../config.js';
export function renderLogin() {
  const container = document.createElement('div');
  container.className = 'animate-fade-in';
  container.style.display = 'flex';
  container.style.justifyContent = 'center';
  container.style.alignItems = 'center';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.backgroundColor = 'var(--bg-surface)';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.width = '100%';
  card.style.maxWidth = '380px';
  card.style.padding = '2rem';

  const svgEye = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
  const svgEyeOff = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line></svg>`;

  // HTML Template - initially showing Login
  card.innerHTML = `
    <div style="text-align: center; margin-bottom: 2rem;">
      <h1 style="margin-bottom: 0.5rem; letter-spacing: 1px;">AOTMS</h1>
      <p class="body-text" id="authSubtitle">Sign in to internal operations</p>
    </div>
    
    <!-- LOGIN FORM -->
    <form id="loginForm">
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.25rem; font-size: 13px; font-weight: 500;">Email Address</label>
        <input type="email" id="loginEmail" class="input" placeholder="Aotms@gmail.com" required>
      </div>
      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.25rem; font-size: 13px; font-weight: 500;">Password</label>
        <div style="position: relative;">
          <input type="password" id="loginPassword" class="input" placeholder="Aotms@2026" required>
          <button type="button" class="toggle-password" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex;">
            ${svgEye}
          </button>
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Sign In</button>
      <div style="text-align: center; margin-top: 1.5rem; font-size: 13px;">
        <span style="color: var(--text-muted);">Don't have an account?</span>
        <a href="#" id="showSignup" style="color: var(--accent-primary); text-decoration: none; font-weight: 500; margin-left: 0.25rem;">Sign Up</a>
      </div>
    </form>

    <!-- SIGN UP FORM -->
    <form id="signupForm" style="display: none;">
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.25rem; font-size: 13px; font-weight: 500;">Full Name</label>
        <input type="text" id="signupName" class="input" placeholder="John Doe" required>
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.25rem; font-size: 13px; font-weight: 500;">Email Address</label>
        <input type="email" id="signupEmail" class="input" placeholder="john@example.com" required>
      </div>
      <div style="margin-bottom: 1rem;">
        <label style="display: block; margin-bottom: 0.25rem; font-size: 13px; font-weight: 500;">Password</label>
        <div style="position: relative;">
          <input type="password" id="signupPassword" class="input" placeholder="Min. 8 characters" minlength="8" required>
          <button type="button" class="toggle-password" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex;">
            ${svgEye}
          </button>
        </div>
      </div>
      <div style="margin-bottom: 1.5rem;">
        <label style="display: block; margin-bottom: 0.25rem; font-size: 13px; font-weight: 500;">Confirm Password</label>
        <div style="position: relative;">
          <input type="password" id="signupConfirm" class="input" placeholder="Confirm password" minlength="8" required>
          <button type="button" class="toggle-password" style="position: absolute; right: 10px; top: 50%; transform: translateY(-50%); background: none; border: none; color: var(--text-muted); cursor: pointer; display: flex;">
            ${svgEye}
          </button>
        </div>
      </div>
      <button type="submit" class="btn btn-primary" style="width: 100%;">Create Account</button>
      <div style="text-align: center; margin-top: 1.5rem; font-size: 13px;">
        <span style="color: var(--text-muted);">Already have an account?</span>
        <a href="#" id="showLogin" style="color: var(--accent-primary); text-decoration: none; font-weight: 500; margin-left: 0.25rem;">Sign In</a>
      </div>
    </form>

    <div id="errorMsg" style="color: #ef4444; font-weight: 500; font-size: 13px; margin-top: 1rem; text-align: center;"></div>
  `;

  container.appendChild(card);

  // Logic & Interactivity
  const loginForm = card.querySelector('#loginForm');
  const signupForm = card.querySelector('#signupForm');
  const showSignupBtn = card.querySelector('#showSignup');
  const showLoginBtn = card.querySelector('#showLogin');
  const authSubtitle = card.querySelector('#authSubtitle');
  const errorMsg = card.querySelector('#errorMsg');

  // View toggling
  showSignupBtn.addEventListener('click', (e) => {
    e.preventDefault();
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    authSubtitle.textContent = 'Create a new account';
    errorMsg.textContent = '';
  });

  showLoginBtn.addEventListener('click', (e) => {
    e.preventDefault();
    signupForm.style.display = 'none';
    loginForm.style.display = 'block';
    authSubtitle.textContent = 'Sign in to internal operations';
    errorMsg.textContent = '';
  });

  // Password Visibility toggling
  const toggleBtns = card.querySelectorAll('.toggle-password');
  toggleBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const input = btn.previousElementSibling;
      if (input.type === 'password') {
        input.type = 'text';
        btn.innerHTML = svgEyeOff;
      } else {
        input.type = 'password';
        btn.innerHTML = svgEye;
      }
    });
  });

  // Login Submit
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';
    const email = loginForm.querySelector('#loginEmail').value;
    const password = loginForm.querySelector('#loginPassword').value;

    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (response.ok) {
        localStorage.setItem('aotms_token', data.token); // Store for 7 days (JWT expiration handles validity)
        localStorage.setItem('aotms_user', JSON.stringify(data.user));
        window.location.hash = '#/';
      } else {
        errorMsg.textContent = data.error || 'Login failed';
      }
    } catch (err) {
      errorMsg.textContent = 'Network error. Backend unreachable.';
    }
  });

  // Sign Up Submit
  signupForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorMsg.textContent = '';
    
    const name = signupForm.querySelector('#signupName').value;
    const email = signupForm.querySelector('#signupEmail').value;
    const password = signupForm.querySelector('#signupPassword').value;
    const confirm = signupForm.querySelector('#signupConfirm').value;

    if (password.length < 8) {
      errorMsg.textContent = 'Password must be at least 8 characters long.';
      return;
    }

    if (password !== confirm) {
      errorMsg.textContent = 'Passwords do not match.';
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password })
      });

      const data = await response.json();
      if (response.ok) {
        // Automatically login the user upon successful registration
        localStorage.setItem('aotms_token', data.token);
        localStorage.setItem('aotms_user', JSON.stringify(data.user));
        window.location.hash = '#/';
      } else {
        errorMsg.textContent = data.error || 'Registration failed';
      }
    } catch (err) {
      errorMsg.textContent = 'Network error. Backend unreachable.';
    }
  });

  return container;
}
