import { API_BASE_URL } from '../config.js';
export function renderIssues() {
  const container = document.createElement('div');
  
  let allIssues = [];
  let currentStatusFilter = "";

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem;">
        <input type="text" id="searchIssue" class="input" placeholder="Search issues..." style="width: 250px;">
        <select id="filterStatus" class="input" style="width: 150px;">
          <option value="">All Statuses</option>
          <option value="OPEN">OPEN</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="BLOCKED">BLOCKED</option>
          <option value="RESOLVED">RESOLVED</option>
          <option value="CLOSED">CLOSED</option>
        </select>
      </div>
      <button id="addIssueBtn" class="btn btn-primary">+ Report Issue</button>
    </div>

    <div id="issues-list" class="grid-container">
      <div style="text-align: center; color: var(--text-muted); width: 100%;">Loading...</div>
    </div>

    <!-- Modal Template -->
    <div id="issueModal" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <button class="modal-close" id="closeIssueModal">&times;</button>
        <h2 class="section-title">Report New Issue</h2>
        <form id="issueForm" style="margin-top: 1.5rem;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Issue Title *</label>
            <input type="text" id="issueTitle" class="input" required>
          </div>
          
          <div style="margin-bottom: 1rem; display: flex; gap: 1rem;">
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Priority</label>
              <select id="issuePriority" class="input">
                <option value="LOW">LOW</option>
                <option value="MEDIUM" selected>MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Severity</label>
              <select id="issueSeverity" class="input">
                <option value="LOW">LOW</option>
                <option value="MEDIUM" selected>MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="CRITICAL">CRITICAL</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 1rem; position: relative;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Assigned To</label>
            <div id="issueAssigneeBtn" class="input" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; min-height: 38px;">
              <span id="issueAssigneeText">Unassigned</span>
              <span style="font-size: 12px; color: var(--text-muted);">▼</span>
            </div>
            <div id="issueAssigneeDropdown" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); max-height: 200px; overflow-y: auto; z-index: 100; box-shadow: var(--shadow-md); padding: 0.5rem; flex-direction: column; gap: 0.25rem; margin-top: 4px;">
              <!-- Dynamic Checkboxes -->
            </div>
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Description</label>
            <textarea id="issueDesc" class="input" rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Submit Issue</button>
        </form>
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#searchIssue');
  const filterStatus = container.querySelector('#filterStatus');

  const modal = container.querySelector('#issueModal');
  const addBtn = container.querySelector('#addIssueBtn');
  const closeBtn = container.querySelector('#closeIssueModal');
  const form = container.querySelector('#issueForm');
  const tbody = container.querySelector('#issues-list');

  const issueAssigneeBtn = container.querySelector('#issueAssigneeBtn');
  const issueAssigneeDropdown = container.querySelector('#issueAssigneeDropdown');
  const issueAssigneeText = container.querySelector('#issueAssigneeText');

  issueAssigneeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = issueAssigneeDropdown.style.display === 'flex';
    issueAssigneeDropdown.style.display = isVisible ? 'none' : 'flex';
  });

  document.addEventListener('click', (e) => {
    if (!issueAssigneeBtn.contains(e.target) && !issueAssigneeDropdown.contains(e.target)) {
      issueAssigneeDropdown.style.display = 'none';
    }
  });

  const updateAssigneeText = () => {
    const checked = Array.from(issueAssigneeDropdown.querySelectorAll('.assignee-checkbox:checked'));
    if (checked.length === 0) {
      issueAssigneeText.textContent = 'Unassigned';
    } else if (checked.length === 1) {
      issueAssigneeText.textContent = checked[0].nextElementSibling.textContent;
    } else {
      issueAssigneeText.textContent = `${checked.length} employees selected`;
    }
  };

  const applyFiltersAndRender = () => {
    currentStatusFilter = filterStatus.value;
    const searchTerm = searchInput.value.toLowerCase();

    let filtered = allIssues.filter(i => {
      if (currentStatusFilter && i.status !== currentStatusFilter) return false;
      if (searchTerm && !i.title.toLowerCase().includes(searchTerm)) return false;
      return true;
    });

    renderTable(filtered);
  };

  searchInput.addEventListener('input', applyFiltersAndRender);
  filterStatus.addEventListener('change', applyFiltersAndRender);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('aotms_token');
      const res = await fetch(`${API_BASE_URL}/users`, { headers: { 'Authorization': 'Bearer ' + token } });
      const users = await res.json();
      issueAssigneeDropdown.innerHTML = '';
      users.forEach(u => {
        const label = document.createElement('label');
        label.style = 'display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border-radius: var(--radius-sm); transition: background 0.2s;';
        label.onmouseover = () => label.style.background = 'var(--bg-primary)';
        label.onmouseout = () => label.style.background = 'transparent';
        
        label.innerHTML = `<input type="checkbox" value="${u._id}" class="assignee-checkbox" style="cursor: pointer;"><span>${u.name}</span>`;
        
        label.querySelector('.assignee-checkbox').addEventListener('change', updateAssigneeText);
        
        issueAssigneeDropdown.appendChild(label);
      });
      updateAssigneeText();
    } catch (e) { console.error(e); }
  };

  addBtn.addEventListener('click', async () => {
    form.reset();
    await loadUsers();
    
    // Clear selections on open
    Array.from(issueAssigneeDropdown.querySelectorAll('.assignee-checkbox')).forEach(cb => cb.checked = false);
    updateAssigneeText();
    
    modal.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('aotms_token');
    
    const body = {
      title: form.querySelector('#issueTitle').value,
      priority: form.querySelector('#issuePriority').value,
      severity: form.querySelector('#issueSeverity').value,
      description: form.querySelector('#issueDesc').value
    };

    const assigneeCheckboxes = Array.from(issueAssigneeDropdown.querySelectorAll('.assignee-checkbox:checked'));
    const assigneeIds = assigneeCheckboxes.map(cb => cb.value).filter(val => val !== "");
    
    if (assigneeIds.length > 0) body.assignedTo = assigneeIds;
    else body.assignedTo = [];

    try {
      await fetch(`${API_BASE_URL}/issues`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
      });
      modal.style.display = 'none';
      form.reset();
      fetchData();
    } catch (err) {
      console.error(err);
    }
  });

  const fetchData = async () => {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Loading...</td></tr>';
    try {
      const token = localStorage.getItem('aotms_token');
      const res = await fetch(`${API_BASE_URL}/issues`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      allIssues = await res.json();
      applyFiltersAndRender();
    } catch (err) {
      console.error(err);
    }
  };

  const renderTable = (issues) => {
    tbody.innerHTML = '';
    if (issues.length === 0) {
      tbody.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">No issues found.</div>';
      return;
    }

    issues.forEach(i => {
      let badgeClass = 'badge-todo';
      let statusText = 'OPEN';
      let cardStyle = '';
      
      if (i.status === 'IN_PROGRESS') { badgeClass = 'badge-inprogress'; statusText = 'IN PROGRESS'; }
      else if (i.status === 'RESOLVED' || i.status === 'CLOSED') { 
        badgeClass = 'badge-completed'; 
        statusText = i.status; 
        cardStyle = 'opacity: 0.6; filter: grayscale(1);';
      }
      else if (i.status === 'BLOCKED') { badgeClass = 'badge-blocked'; statusText = 'BLOCKED'; }

      const initials = i.reportedBy ? i.reportedBy.name.substring(0,2).toUpperCase() : '??';

      let avatarsHtml = '';
      if (i.assignedTo && i.assignedTo.length > 0) {
        i.assignedTo.forEach(assignee => {
          const init = assignee.name ? assignee.name.substring(0, 2).toUpperCase() : '?';
          avatarsHtml += `<span class="metadata" style="margin-right: 8px;" title="Assigned to ${assignee.name || 'Unknown'}">${assignee.name || 'Unknown'}</span>`;
        });
      } else {
        avatarsHtml = `<span class="metadata">Assigned: Unassigned</span>`;
      }

      const card = document.createElement('div');
      card.className = 'card';
      if (cardStyle) card.style = cardStyle;
      
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title" style="font-size: 18px;">${i.title}</h3>
          <div class="avatar" title="Reported by ${i.reportedBy ? i.reportedBy.name : 'Unknown'}">${initials}</div>
        </div>
        <div class="card-body">
          <div style="display: flex; gap: 0.5rem; margin-bottom: 1rem;">
            <span class="badge" style="border: 1px solid var(--border-color);">${i.priority} Prio</span>
            <span class="badge" style="border: 1px solid var(--border-color);">${i.severity} Sev</span>
          </div>
          <span class="badge ${badgeClass}">${statusText}</span>
        </div>
        <div class="card-footer">
          <div>${avatarsHtml}</div>
          <a href="#/tracking/issues/${i._id}" class="btn btn-secondary" style="padding: 0.25rem 0.5rem; font-size: 12px; text-decoration: none;">View / Update</a>
        </div>
      `;
      
      tbody.appendChild(card);
    });
  };

  fetchData();

  return container;
}
