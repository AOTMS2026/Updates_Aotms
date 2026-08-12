import { API_BASE_URL } from '../config.js';
export function renderDashboard() {
  const container = document.createElement('div');
  container.className = 'dashboard-container';

  const today = new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  // Initial skeleton / loading state
  container.innerHTML = `
    <div style="margin-bottom: 2rem;">
      <h1 class="page-title" style="margin-bottom: 0.25rem;">Dashboard</h1>
      <p class="body-text">${today}</p>
    </div>

    <!-- KPI Cards -->
    <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 1rem; margin-bottom: 2.5rem;" id="kpi-cards">
      <div class="card" style="padding: 1rem 1.25rem;">
        <div class="metadata" style="margin-bottom: 0.5rem; text-transform: uppercase;">Today's Tasks</div>
        <div class="metric-number" id="kpi-total">-</div>
      </div>
      <div class="card" style="padding: 1rem 1.25rem;">
        <div class="metadata" style="margin-bottom: 0.5rem; text-transform: uppercase;">Completed</div>
        <div class="metric-number" id="kpi-completed">-</div>
      </div>
      <div class="card" style="padding: 1rem 1.25rem;">
        <div class="metadata" style="margin-bottom: 0.5rem; text-transform: uppercase;">In Progress</div>
        <div class="metric-number" id="kpi-inprogress">-</div>
      </div>
      <div class="card" style="padding: 1rem 1.25rem;">
        <div class="metadata" style="margin-bottom: 0.5rem; text-transform: uppercase;">Blocked</div>
        <div class="metric-number" id="kpi-blocked">-</div>
      </div>
      <div class="card" style="padding: 1rem 1.25rem;">
        <div class="metadata" style="margin-bottom: 0.5rem; text-transform: uppercase;">Overall Progress</div>
        <div class="metric-number" id="kpi-progress">-</div>
      </div>
    </div>

    <div style="display: grid; grid-template-columns: 1fr 300px; gap: 2rem;">
      
      <!-- Today's Execution Table -->
      <div>
        <h2 class="section-title">Today's Execution</h2>
        <div class="table-container" style="margin-top: 1rem;">
          <table>
            <thead>
              <tr>
                <th>Execution Point</th>
                <th>Feature</th>
                <th>Assigned To</th>
                <th>Priority</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody id="tasks-tbody">
              <tr>
                <td colspan="5" style="text-align: center; color: var(--text-muted);">Loading tasks...</td>
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

    // Fetch tasks
    const tasksRes = await fetch(`${API_BASE_URL}/tasks`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    // Fetch users for team progress
    const usersRes = await fetch(`${API_BASE_URL}/users`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });

    const tasks = await tasksRes.json();
    const users = await usersRes.json();

    // Calculate KPIs
    const total = tasks.length;
    const completed = tasks.filter(t => t.status === 'COMPLETED').length;
    const inProgress = tasks.filter(t => t.status === 'IN_PROGRESS').length;
    const blocked = tasks.filter(t => t.status === 'BLOCKED').length;
    const overallProgress = total === 0 ? 0 : Math.round((completed / total) * 100);

    container.querySelector('#kpi-total').textContent = total;
    container.querySelector('#kpi-completed').textContent = completed;
    container.querySelector('#kpi-inprogress').textContent = inProgress;
    container.querySelector('#kpi-blocked').textContent = blocked;
    container.querySelector('#kpi-progress').textContent = overallProgress + '%';

    // Populate Tasks Table
    const tbody = container.querySelector('#tasks-tbody');
    tbody.innerHTML = '';
    
    if (tasks.length === 0) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">No tasks found.</td></tr>';
    } else {
      tasks.forEach(task => {
        let badgeClass = 'badge-todo';
        let statusText = 'TODO';
        if (task.status === 'IN_PROGRESS') { badgeClass = 'badge-inprogress'; statusText = 'IN PROGRESS'; }
        else if (task.status === 'COMPLETED') { badgeClass = 'badge-completed'; statusText = 'COMPLETED'; }
        else if (task.status === 'BLOCKED') { badgeClass = 'badge-blocked'; statusText = 'BLOCKED'; }

        const tr = document.createElement('tr');
        tr.innerHTML = `
          <td style="font-weight: 500;">${task.title}</td>
          <td class="body-text">${task.feature ? task.feature.title : '-'}</td>
          <td class="body-text">${task.assignedTo ? task.assignedTo.name : 'Unassigned'}</td>
          <td><span class="badge" style="border: 1px solid var(--border-color);">${task.priority}</span></td>
          <td><span class="badge ${badgeClass}">${statusText}</span></td>
        `;
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
        // Mock progress for now, or calculate based on their tasks
        const userTasks = tasks.filter(t => t.assignedTo && t.assignedTo._id === user._id);
        const userTotal = userTasks.length;
        const userCompleted = userTasks.filter(t => t.status === 'COMPLETED').length;
        const userProgress = userTotal === 0 ? 0 : Math.round((userCompleted / userTotal) * 100);

        const div = document.createElement('div');
        div.style.marginBottom = '1.5rem';
        div.innerHTML = `
          <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
            <span class="body-text" style="color: var(--text-primary); font-weight: 500;">${user.name}</span>
            <span class="body-text">${userProgress}%</span>
          </div>
          <div class="progress-wrapper">
            <div class="progress-bar-bg">
              <div class="progress-bar-fill" style="width: ${userProgress}%;"></div>
            </div>
          </div>
        `;
        teamContainer.appendChild(div);
      });
    }

  } catch (err) {
    console.error('Error fetching dashboard data:', err);
    container.querySelector('#tasks-tbody').innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--danger);">Failed to load data.</td></tr>';
  }
}
