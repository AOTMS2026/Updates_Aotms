export function renderLanding() {
  const container = document.createElement('div');
  container.className = 'animate-fade-in';
  container.style.width = '100vw';
  container.style.height = '100vh';
  container.style.overflowY = 'auto';
  container.style.backgroundColor = 'var(--bg-primary)';

    // Check if logged in to show Profile or Sign In
    const token = localStorage.getItem('aotms_token');
    let user = null;
    let initials = 'U';
    let glowStyle = '';
    
    if (token) {
      try {
        const storedUser = localStorage.getItem('aotms_user');
        if (storedUser && storedUser !== 'undefined') {
          user = JSON.parse(storedUser);
          initials = user.name ? user.name.substring(0,2).toUpperCase() : 'U';
          const isAdmin = user.role && user.role.toUpperCase() === 'ADMIN';
          glowStyle = isAdmin 
            ? 'box-shadow: 0 0 12px 2px rgba(239, 68, 68, 0.7); border-color: #ef4444; color: #ef4444;' 
            : 'box-shadow: 0 0 12px 2px rgba(34, 197, 94, 0.7); border-color: #22c55e; color: #22c55e;';
        }
      } catch (e) {}
    }

    const navActionBtn = token 
      ? `<a href="#/" style="text-decoration: none;">
           <div style="width: 36px; height: 36px; background: var(--bg-surface); border: 2px solid; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-weight: bold; font-size: 14px; transition: all 0.2s; ${glowStyle}">
             ${initials}
           </div>
         </a>`
      : `<a href="#/login" class="btn btn-primary">Sign In</a>`;

    container.innerHTML = `
      <!-- Mini Navbar -->
      <div style="background-color: var(--bg-surface); padding: 0.5rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); font-size: 13px; color: var(--text-muted);">
        <div>📞 Support: +1 (800) 123-4567 | ✉️ info@aotms.com</div>
        <div style="display: flex; gap: 1rem;">
          <a href="#" style="color: var(--text-muted); text-decoration: none;">Help Center</a>
          <a href="#" style="color: var(--text-muted); text-decoration: none;">Status</a>
        </div>
      </div>

      <!-- Main Navbar -->
      <nav style="padding: 1rem 2rem; display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid var(--border-color); background-color: var(--bg-primary);">
        <div style="display: flex; align-items: center; gap: 1rem;">
          <img src="/logo.jpg" alt="AOTMS Logo" style="max-height: 50px; width: auto; object-fit: contain;">
          <h1 style="margin: 0; font-size: 28px; letter-spacing: 2px;">AOTMS</h1>
        </div>
        <div style="display: flex; gap: 1.5rem; align-items: center;">
          ${navActionBtn}
        </div>
      </nav>

    <!-- Hero Section -->
    <section style="display: flex; flex-direction: column; align-items: center; justify-content: center; padding: 6rem 2rem; text-align: center; background: linear-gradient(180deg, var(--bg-primary) 0%, var(--bg-surface) 100%); min-height: calc(100vh - 120px);">
      <div style="max-width: 800px;">
        <span class="badge badge-inprogress" style="margin-bottom: 1.5rem;">v1.0 is Now Live</span>
        <h1 style="font-size: 56px; line-height: 1.2; margin-bottom: 1.5rem; color: var(--text-primary);">
          Manage Your Work <br>
          <span style="color: var(--accent-primary);">Beautifully & Efficiently</span>
        </h1>
        <p style="font-size: 18px; color: var(--text-secondary); margin-bottom: 2.5rem; line-height: 1.6;">
          AOTMS provides a stunning, card-based interface for managing tasks, features, issues, and your entire team's workflow in one centralized hub.
        </p>
        <div style="display: flex; gap: 1rem; justify-content: center;">
          ${token 
            ? `<a href="#/" class="btn btn-primary" style="padding: 0.75rem 2rem; font-size: 18px;">Open Dashboard</a>` 
            : `<a href="#/login" class="btn btn-primary" style="padding: 0.75rem 2rem; font-size: 18px;">Get Started</a>`}
          <a href="#demo" class="btn btn-secondary" style="padding: 0.75rem 2rem; font-size: 18px;">View Demo</a>
        </div>
      </div>
    </section>
  `;

  return container;
}
