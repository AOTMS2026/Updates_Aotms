import { API_BASE_URL } from '../config.js';
export function renderReports() {
  const container = document.createElement('div');
  
  let allReports = [];
  let myUpdates = [];

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem;">
      <h1 class="page-title">Reports & Updates</h1>
      <div style="display: flex; gap: 1rem;">
        <button id="generateReportBtn" class="btn btn-secondary" style="background-color: var(--card-bg); color: var(--text-primary); border-color: var(--border-color);">Generate Master Report</button>
        <button id="submitUpdateBtn" class="btn btn-primary">Submit My Daily Update</button>
      </div>
    </div>

    <div style="display: flex; flex-direction: column; gap: 3rem;">
      <div>
        <h3 class="section-title" style="margin-bottom: 1.5rem;">My Recent Updates</h3>
        <div id="updates-list" class="grid-container">
          <div style="text-align: center; color: var(--text-muted); width: 100%;">Loading updates...</div>
        </div>
      </div>

      <div>
        <h3 class="section-title" style="margin-bottom: 1.5rem;">Master Daily Reports</h3>
        <div id="reports-list" class="grid-container">
          <div style="text-align: center; color: var(--text-muted); width: 100%;">Loading reports...</div>
        </div>
      </div>
    </div>

    <!-- Submit Update Modal -->
    <div id="updateModal" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <button class="modal-close" id="closeUpdateModal">&times;</button>
        <h2 class="section-title">My Daily Update</h2>
        <form id="updateForm" style="margin-top: 1.5rem;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Progress Percentage (%) *</label>
            <input type="number" id="updProgress" class="input" min="0" max="100" required>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Issues / Blockers</label>
            <textarea id="updIssues" class="input" rows="2" placeholder="Any blockers you are facing?"></textarea>
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Plan for Tomorrow *</label>
            <textarea id="updPlan" class="input" rows="2" required></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Submit Update</button>
        </form>
      </div>
    </div>
  `;

  const modal = container.querySelector('#updateModal');
  const addBtn = container.querySelector('#submitUpdateBtn');
  const closeBtn = container.querySelector('#closeUpdateModal');
  const form = container.querySelector('#updateForm');
  const reportsList = container.querySelector('#reports-list');
  const updatesList = container.querySelector('#updates-list');
  const genBtn = container.querySelector('#generateReportBtn');

  addBtn.addEventListener('click', () => {
    form.reset();
    modal.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  genBtn.addEventListener('click', async () => {
    if(!confirm("Generate master daily report based on today's submissions?")) return;
    try {
      const token = localStorage.getItem('aotms_token');
      const res = await fetch(`${API_BASE_URL}/reports/generate`, {
        method: 'POST',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if(res.ok) {
        alert("Daily report generated successfully!");
        fetchData();
      } else {
        const error = await res.json();
        alert("Error: " + error.error);
      }
    } catch (err) {
      console.error(err);
    }
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('aotms_token');
    
    const body = {
      progressPercentage: parseInt(form.querySelector('#updProgress').value),
      issues: [form.querySelector('#updIssues').value].filter(Boolean),
      planForTomorrow: form.querySelector('#updPlan').value
    };

    try {
      await fetch(`${API_BASE_URL}/reports/updates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
      });
      modal.style.display = 'none';
      form.reset();
      fetchData(); // Reload both
    } catch (err) {
      console.error(err);
    }
  });

  const fetchData = async () => {
    reportsList.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">Loading reports...</div>';
    updatesList.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">Loading updates...</div>';
    
    try {
      const token = localStorage.getItem('aotms_token');
      
      const resR = await fetch(`${API_BASE_URL}/reports`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if(resR.ok) {
        allReports = await resR.json();
        renderReportsTable(allReports);
      }

      const resU = await fetch(`${API_BASE_URL}/reports/updates`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      if(resU.ok) {
        myUpdates = await resU.json();
        renderUpdatesTable(myUpdates);
      }

    } catch (err) {
      console.error(err);
    }
  };

  const renderUpdatesTable = (updates) => {
    updatesList.innerHTML = '';
    if (updates.length === 0) {
      updatesList.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">No updates submitted yet.</div>';
      return;
    }

    updates.forEach(u => {
      const d = new Date(u.date);
      const card = document.createElement('div');
      card.className = 'card';
      
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title" style="font-size: 18px;">${d.toLocaleDateString()}</h3>
          <div class="avatar" title="My Update" style="background: rgba(16, 185, 129, 0.1); color: #10b981; border-color: rgba(16, 185, 129, 0.3);">ME</div>
        </div>
        <div class="card-body">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
            <div style="flex: 1; height: 6px; background: var(--border-color); border-radius: var(--radius-sm); overflow: hidden;">
              <div style="height: 100%; width: ${u.progressPercentage || 0}%; background: var(--accent-primary);"></div>
            </div>
            <span class="metadata">${u.progressPercentage || 0}%</span>
          </div>
          <p class="body-text" style="font-size: 14px; white-space: pre-wrap;"><strong style="color: var(--text-primary);">Plan:</strong><br/>${u.planForTomorrow || '-'}</p>
        </div>
      `;
      updatesList.appendChild(card);
    });
  };

  const renderReportsTable = (reports) => {
    reportsList.innerHTML = '';
    if (reports.length === 0) {
      reportsList.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">No daily reports found.</div>';
      return;
    }

    reports.forEach(r => {
      const d = new Date(r.date);
      const card = document.createElement('div');
      card.className = 'card';
      
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title" style="font-size: 18px;">${d.toLocaleDateString()}</h3>
          <div class="avatar" title="Master Report" style="background: rgba(59, 130, 246, 0.1); color: #3b82f6; border-color: rgba(59, 130, 246, 0.3);">MR</div>
        </div>
        <div class="card-body">
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
            <div style="flex: 1; height: 6px; background: var(--border-color); border-radius: var(--radius-sm); overflow: hidden;">
              <div style="height: 100%; width: ${r.overallCompletion}%; background: #3b82f6;"></div>
            </div>
            <span class="metadata">${Math.round(r.overallCompletion)}%</span>
          </div>
          <p class="body-text">Aggregated Updates: <strong>${r.userUpdates ? r.userUpdates.length : 0} Members</strong></p>
        </div>
      `;
      reportsList.appendChild(card);
    });
  };

  fetchData();

  return container;
}
