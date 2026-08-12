export function renderSettings() {
  const container = document.createElement('div');
  
  let user = { name: 'Admin', email: 'admin@aotms.com', role: 'EMPLOYEE' };
  try {
    const storedUser = localStorage.getItem('aotms_user');
    if (storedUser && storedUser !== 'undefined') {
      user = JSON.parse(storedUser);
    }
  } catch (e) {}

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
      <h1 class="page-title">Settings</h1>
      <button class="btn btn-primary" disabled>Save All Changes</button>
    </div>

    <div style="display: flex; flex-direction: column; gap: 3rem;">
      
      <div>
        <h3 class="section-title" style="margin-bottom: 1.5rem;">Project Settings</h3>
        <div class="grid-container" style="grid-template-columns: 1fr;">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title" style="font-size: 18px;">General Information</h3>
            </div>
            <div class="card-body">
              <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Project Name</label>
                <input type="text" class="input" value="AOTMS v1.0" style="max-width: 400px;">
              </div>
              <div style="margin-bottom: 1rem;">
                <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Company/Organization</label>
                <input type="text" class="input" value="Acme Corp" style="max-width: 400px;">
              </div>
            </div>
          </div>
        </div>
      </div>

      <div>
        <h3 class="section-title" style="margin-bottom: 1.5rem;">My Profile</h3>
        <div class="grid-container" style="grid-template-columns: 1fr;">
          <div class="card">
            <div class="card-header">
              <h3 class="card-title" style="font-size: 18px;">Account Details</h3>
              <div class="avatar" title="${user.name}">${user.name.substring(0,2).toUpperCase()}</div>
            </div>
            <div class="card-body">
              <div style="display: flex; gap: 2rem; flex-wrap: wrap;">
                <div style="flex: 1; min-width: 250px;">
                  <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Name</label>
                  <input type="text" class="input" value="${user.name}" readonly style="background: var(--bg-surface); cursor: not-allowed;">
                </div>
                <div style="flex: 1; min-width: 250px;">
                  <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Email</label>
                  <input type="email" class="input" value="${user.email}" readonly style="background: var(--bg-surface); cursor: not-allowed;">
                </div>
              </div>
              <div style="margin-top: 1rem;">
                <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Role</label>
                <span class="badge badge-inprogress">${user.role}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

    </div>
  `;

  return container;
}
