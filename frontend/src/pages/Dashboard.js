import { API_BASE_URL } from '../config.js';

export function renderDashboard() {
  const container = document.createElement('div');
  container.className = 'dashboard-container';

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Initial skeleton / loading state
  container.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <h1 class="page-title" style="margin-bottom: 0.25rem;">Dashboard</h1>
      <p class="body-text">\${today}</p>
    </div>

    <!-- KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2.5rem;" id="kpi-cards">
      <div class="card" style="padding: 1rem 1.25rem;">
        <div class="metadata" style="margin-bottom: 0.5rem; text-transform: uppercase;">Total Items</div>
        <div class="metric-number" id="kpi-total">-</div>
      </div>
      <div class="card" style="padding: 1rem 1.25rem;">
        <div class="metadata" style="margin-bottom: 0.5rem; text-transform: uppercase;">In Progress</div>
        <div class="metric-number" id="kpi-inprogress">-</div>
      </div>
      <div class="card" style="padding: 1rem 1.25rem;">
        <div class="metadata" style="margin-bottom: 0.5rem; text-transform: uppercase;">Completed</div>
        <div class="metric-number" id="kpi-completed">-</div>
      </div>
      <div class="card" style="padding: 1rem 1.25rem;">
        <div class="metadata" style="margin-bottom: 0.5rem; text-transform: uppercase;">Overall Progress</div>
        <div class="metric-number" id="kpi-progress">-</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 300px; gap: 2rem;">
      
      <!-- Active Work Table -->
      <div>
        <h2 class="section-title">Active Work</h2>
        <div class="table-container" style="margin-top: 1rem;">
          <table>
            <thead>
              <tr>
                <th>Title</th>
                <th>Type</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="work-tbody">
              <tr>
                <td colspan="5" style="text-align: center; color: var(--text-muted);">Loading work...</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Team Progress -->
      <div>
        <h2 class="section-title">Team Progress</h2>
        <div class="card" style="margin-top: 1rem; padding: 1.25rem;" id="team-progress-container">
          <div style="text-align: center; color: var(--text-muted);">Loading team...</div>
        </div>
      </div>

    </div>
  `;

  // Fetch real data
  fetchDashboardData(container);

  return container;
}

async function fetchDashboardData(container) {
  try {
    const token = localStorage.getItem('aotms_token');
    if (!token) return;

    // Fetch tasks, todos, and users concurrently
    const [tasksRes, todosRes, usersRes] = await Promise.all([
      fetch(\`\${API_BASE_URL}/tasks\`, { headers: { 'Authorization': 'Bearer ' + token } }),
      fetch(\`\${API_BASE_URL}/todos\`, { headers: { 'Authorization': 'Bearer ' + token } }),
      fetch(\`\${API_BASE_URL}/users\`, { headers: { 'Authorization': 'Bearer ' + token } })
    ]);

    const tasks = await tasksRes.json();
    const todos = await todosRes.json();
    const users = await usersRes.json();

    // Combine all work items
    const allWork = [
      ...tasks.map(t => ({...t, itemType: 'TASK'})),
      ...todos.map(t => ({...t, itemType: 'TODO'}))
    ];

    // Calculate KPIs
    const total = allWork.length;
    const completed = allWork.filter(t => t.status === 'COMPLETED').length;
    const inProgress = allWork.filter(t => t.status === 'IN_PROGRESS').length;
    const overallProgress = total === 0 ? 0 : Math.round((completed / total) * 100);

    container.querySelector('#kpi-total').textContent = total;
    container.querySelector('#kpi-completed').textContent = completed;
    container.querySelector('#kpi-inprogress').textContent = inProgress;
    container.querySelector('#kpi-progress').textContent = overallProgress + '%';

    // Populate Active Work Table (exclude COMPLETED)
    const activeWork = allWork.filter(t => t.status !== 'COMPLETED');
    const tbody = container.querySelector('#work-tbody');
    tbody.innerHTML = '';
    
    if (activeWork.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No active work found.</td></tr>';
    } else {
      activeWork.forEach(item => {
        let badgeClass = 'badge-todo';
        let statusText = 'TODO';
        if (item.status === 'IN_PROGRESS') { badgeClass = 'badge-inprogress'; statusText = 'IN PROGRESS'; }

        // Extract assignee string safely
        let assigneeStr = 'Unassigned';
        if (item.assignedTo && item.assignedTo.length > 0) {
          assigneeStr = item.assignedTo.map(a => a.name).join(', ');
        } else if (item.assignedTo && item.assignedTo.name) {
          // If assignedTo is a single object (from old Task schema)
          assigneeStr = item.assignedTo.name;
        }

        const tr = document.createElement('tr');
        tr.innerHTML = \`
          <td style="font-weight: 500;">\${item.title}</td>
          <td class="body-text" style="font-size: 12px; opacity: 0.8;">\${item.itemType}</td>
          <td class="body-text">\${assigneeStr}</td>
          <td><span class="badge" style="border: 1px solid var(--border-color);">\${item.priority || 'MEDIUM'}</span></td>
          <td><span class="badge \${badgeClass}">\${statusText}</span></td>
        \`;
        tbody.appendChild(tr);
      });
    }

    // Populate Team Progress
    const teamContainer = container.querySelector('#team-progress-container');
    teamContainer.innerHTML = '';
    
    if (users.length === 0) {
      teamContainer.innerHTML = '<div style="text-align: center; color: var(--text-muted);">No team members found.</div>';
    } else {
      users.forEach(user => {
        // Calculate progress based on allWork assigned to this user
        const userWork = allWork.filter(item => {
          if (!item.assignedTo) return false;
          if (Array.isArray(item.assignedTo)) {
            return item.assignedTo.some(a => a._id === user._id);
          }
          return item.assignedTo._id === user._id; // Fallback for old Task schema
        });

        const userTotal = userWork.length;
        const userCompleted = userWork.filter(t => t.status === 'COMPLETED').length;
        const userProgress = userTotal === 0 ? 0 : Math.round((userCompleted / userTotal) * 100);

        const div = document.createElement('div');
        div.style.marginBottom = '1.5rem';
        div.innerHTML = \`
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span class="body-text" style="color: var(--text-primary); font-weight: 500;">\${user.name}</span>
            <span class="body-text">\${userProgress}%</span>
          </div>
          <div class="progress-wrapper">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: \${userProgress}%;"></div>
            </div>
          </div>
        \`;
        teamContainer.appendChild(div);
      });
    }

  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    container.querySelector('#work-tbody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger);">Failed to load data.</td></tr>';
  }
}
