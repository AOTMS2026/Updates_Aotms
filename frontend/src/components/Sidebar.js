export function renderSidebar() {
  const sidebar = document.createElement('aside');
  sidebar.className = 'sidebar animate-fade-in';
  
  let user = { role: 'EMPLOYEE' };
  try {
    const storedUser = localStorage.getItem('aotms_user');
    if (storedUser && storedUser !== 'undefined') {
      user = JSON.parse(storedUser);
    }
  } catch (e) {}

  const isAdmin = user.role && user.role.toUpperCase() === 'ADMIN';

  sidebar.innerHTML = `
    <div class="sidebar-logo" style="display: flex; justify-content: center; align-items: center; padding: 1.5rem 0 0.5rem 0;">
      <a href="#/landing" style="display: block;">
        <img src="/logo.jpg" alt="AOTMS Logo" style="max-height: 90px; width: auto; object-fit: contain;">
      </a>
    </div>
    
    <nav class="sidebar-nav">
      <a href="#/" class="sidebar-link active">Dashboard</a>

      <div class="nav-section">WORK</div>
      <a href="#/work/today" class="sidebar-link">Today's Work</a>
      <a href="#/work/tasks" class="sidebar-link">Completed Tasks</a>
      <a href="#/work/todo" class="sidebar-link">TODO</a>

      ${isAdmin ? `
      <div class="nav-section">ORGANIZATION</div>
      <a href="#/team" class="sidebar-link">Team Members</a>
      ` : ''}


      ${isAdmin ? `
      <div class="nav-section">SYSTEM</div>
      <a href="#/settings" class="sidebar-link">Settings</a>
      ` : ''}
    </nav>
  `;

  return sidebar;
}

export function renderTopHeader(pageTitle) {
  const header = document.createElement('header');
  header.className = 'top-header';
  
  let user = { name: 'User', email: 'user@aotms.com', role: 'EMPLOYEE' };
  try {
    const storedUser = localStorage.getItem('aotms_user');
    if (storedUser && storedUser !== 'undefined') {
      user = JSON.parse(storedUser);
    }
  } catch (e) {
    console.error('Error parsing user from localStorage', e);
  }
  
  const initials = user.name ? user.name.substring(0,2).toUpperCase() : 'U';
  const isAdminTop = user.role && user.role.toUpperCase() === 'ADMIN';
  
  const glowStyle = isAdminTop 
    ? 'box-shadow: 0 0 12px 2px rgba(239, 68, 68, 0.7); border-color: #ef4444; color: #ef4444;' 
    : 'box-shadow: 0 0 12px 2px rgba(34, 197, 94, 0.7); border-color: #22c55e; color: #22c55e;';

  header.innerHTML = `
    <div>
      <h2 style="margin: 0; font-size: 18px; font-family: 'Staatliches', sans-serif;">${pageTitle}</h2>
      <div class="metadata" style="margin-top: 2px;">Home / ${pageTitle}</div>
    </div>
    <div style="display: flex; align-items: center; gap: 1.5rem; position: relative;">
      <div style="font-size: 14px; color: var(--text-secondary);">
        <input type="text" class="input" placeholder="Search..." style="padding: 0.25rem 0.75rem; width: 200px;">
      </div>
      <div style="color: var(--text-secondary); cursor: pointer;">🔔</div>
      
      <!-- Profile Trigger -->
      <div id="profileTrigger" style="display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.25rem;">
        <div style="width: 36px; height: 36px; background: var(--bg-surface); border: 2px solid; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; transition: all 0.2s; ${glowStyle}">
          ${initials}
        </div>
      </div>

      <!-- Profile Dropdown -->
      <div id="profileDropdown" style="display: none; position: absolute; top: 100%; right: 0; margin-top: 0.5rem; background: var(--bg-primary); border: 1px solid var(--border-color); border-radius: var(--radius-md); box-shadow: var(--shadow-subtle); padding: 1rem; width: 200px; z-index: 100;">
        <div style="font-weight: 500; font-size: 15px;">${user.name}</div>
        <div style="color: var(--text-muted); font-size: 13px; margin-bottom: 1rem; word-break: break-all;">${user.email}</div>
        <div style="border-top: 1px solid var(--border-color); padding-top: 0.5rem;">
          <button id="logoutBtn" class="btn btn-secondary" style="width: 100%; font-size: 13px; color: #ef4444; border-color: #ef4444;">Logout</button>
        </div>
      </div>

    </div>
  `;

  // Dropdown Logic
  const profileTrigger = header.querySelector('#profileTrigger');
  const profileDropdown = header.querySelector('#profileDropdown');
  const logoutBtn = header.querySelector('#logoutBtn');

  profileTrigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = profileDropdown.style.display === 'block';
    profileDropdown.style.display = isVisible ? 'none' : 'block';
  });

  document.addEventListener('click', () => {
    profileDropdown.style.display = 'none';
  });

  logoutBtn.addEventListener('click', () => {
    localStorage.removeItem('aotms_token');
    localStorage.removeItem('aotms_user');
    window.location.hash = '#/landing';
  });

  return header;
}
