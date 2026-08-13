import { API_BASE_URL } from '../config.js';
export function renderReminders() {
  const container = document.createElement('div');
  
  let allReminders = [];
  let currentStatusFilter = "ACTIVE";

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem;">
        <select id="filterStatus" class="input" style="width: 150px;">
          <option value="ACTIVE" selected>ACTIVE</option>
          <option value="COMPLETED">COMPLETED</option>
          <option value="">ALL STATUSES</option>
        </select>
      </div>
      <button id="addReminderBtn" class="btn btn-primary">+ Set Reminder</button>
    </div>

    <div id="reminders-list" class="grid-container">
      <div style="text-align: center; color: var(--text-muted); width: 100%;">Loading...</div>
    </div>

    <!-- Modal Template -->
    <div id="reminderModal" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <button class="modal-close" id="closeReminderModal">&times;</button>
        <h2 class="section-title">Set Reminder</h2>
        <form id="reminderForm" style="margin-top: 1.5rem;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Remind me to... *</label>
            <input type="text" id="remTitle" class="input" required>
          </div>
          
          <div style="margin-bottom: 1rem; display: flex; gap: 1rem;">
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">When *</label>
              <input type="datetime-local" id="remTime" class="input" required>
            </div>
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Repeat</label>
              <select id="remRepeat" class="input">
                <option value="ONE_TIME" selected>ONE TIME</option>
                <option value="DAILY">DAILY</option>
                <option value="WEEKLY">WEEKLY</option>
                <option value="MONTHLY">MONTHLY</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 1.5rem; position: relative;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Assign To (Optional)</label>
            <div id="remAssigneeBtn" class="input" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; min-height: 38px;">
              <span id="remAssigneeText">Just Me</span>
              <span style="font-size: 12px; color: var(--text-muted);">▼</span>
            </div>
            <div id="remAssigneeDropdown" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); max-height: 200px; overflow-y: auto; z-index: 100; box-shadow: var(--shadow-md); padding: 0.5rem; flex-direction: column; gap: 0.25rem; margin-top: 4px;">
              <!-- Dynamic Checkboxes -->
            </div>
          </div>
          
          <button type="submit" class="btn btn-primary" style="width: 100%;">Save Reminder</button>
        </form>
      </div>
    </div>
  `;

  const filterStatus = container.querySelector('#filterStatus');

  const modal = container.querySelector('#reminderModal');
  const addBtn = container.querySelector('#addReminderBtn');
  const closeBtn = container.querySelector('#closeReminderModal');
  const form = container.querySelector('#reminderForm');
  const tbody = container.querySelector('#reminders-list');

  const remAssigneeBtn = container.querySelector('#remAssigneeBtn');
  const remAssigneeDropdown = container.querySelector('#remAssigneeDropdown');
  const remAssigneeText = container.querySelector('#remAssigneeText');

  remAssigneeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = remAssigneeDropdown.style.display === 'flex';
    remAssigneeDropdown.style.display = isVisible ? 'none' : 'flex';
  });

  document.addEventListener('click', (e) => {
    if (!remAssigneeBtn.contains(e.target) && !remAssigneeDropdown.contains(e.target)) {
      remAssigneeDropdown.style.display = 'none';
    }
  });

  const updateAssigneeText = () => {
    const checked = Array.from(remAssigneeDropdown.querySelectorAll('.assignee-checkbox:checked'));
    if (checked.length === 0) {
      remAssigneeText.textContent = 'Just Me';
    } else if (checked.length === 1) {
      remAssigneeText.textContent = checked[0].nextElementSibling.textContent;
    } else {
      remAssigneeText.textContent = `${checked.length} employees selected`;
    }
  };

  const applyFiltersAndRender = () => {
    currentStatusFilter = filterStatus.value;
    let filtered = allReminders.filter(r => {
      if (currentStatusFilter && r.status !== currentStatusFilter) return false;
      return true;
    });
    renderTable(filtered);
  };

  filterStatus.addEventListener('change', applyFiltersAndRender);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('aotms_token');
      const res = await fetch(`${API_BASE_URL}/users`, { headers: { 'Authorization': 'Bearer ' + token } });
      const users = await res.json();
      remAssigneeDropdown.innerHTML = '';
      users.forEach(u => {
        const label = document.createElement('label');
        label.style = 'display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border-radius: var(--radius-sm); transition: background 0.2s;';
        label.onmouseover = () => label.style.background = 'var(--bg-primary)';
        label.onmouseout = () => label.style.background = 'transparent';
        
        label.innerHTML = `<input type="checkbox" value="${u._id}" class="assignee-checkbox" style="cursor: pointer;"><span>${u.name}</span>`;
        
        label.querySelector('.assignee-checkbox').addEventListener('change', updateAssigneeText);
        
        remAssigneeDropdown.appendChild(label);
      });
      updateAssigneeText();
    } catch (e) { console.error(e); }
  };

  addBtn.addEventListener('click', async () => {
    form.reset();
    await loadUsers();
    
    // Set default datetime to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    container.querySelector('#remTime').value = now.toISOString().slice(0,16);

    // Clear selections on open
    Array.from(remAssigneeDropdown.querySelectorAll('.assignee-checkbox')).forEach(cb => cb.checked = false);
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
      title: form.querySelector('#remTitle').value,
      time: new Date(form.querySelector('#remTime').value).toISOString(),
      repeat: form.querySelector('#remRepeat').value
    };

    const assigneeCheckboxes = Array.from(remAssigneeDropdown.querySelectorAll('.assignee-checkbox:checked'));
    const assigneeIds = assigneeCheckboxes.map(cb => cb.value).filter(val => val !== "");
    
    if (assigneeIds.length > 0) body.assignedTo = assigneeIds;
    else body.assignedTo = [];

    try {
      await fetch(`${API_BASE_URL}/reminders`, {
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

  container.toggleStatus = async (id, currentStatus) => {
    try {
      const token = localStorage.getItem('aotms_token');
      const newStatus = currentStatus === 'ACTIVE' ? 'COMPLETED' : 'ACTIVE';
      await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ status: newStatus })
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  container.deleteReminder = async (id) => {
    if(!confirm("Delete this reminder?")) return;
    try {
      const token = localStorage.getItem('aotms_token');
      await fetch(`${API_BASE_URL}/reminders/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  const fetchData = async () => {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Loading...</td></tr>';
    try {
      const token = localStorage.getItem('aotms_token');
      const res = await fetch(`${API_BASE_URL}/reminders`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      allReminders = await res.json();
      applyFiltersAndRender();
    } catch (err) {
      console.error(err);
    }
  };

  const renderTable = (reminders) => {
    tbody.innerHTML = '';
    if (reminders.length === 0) {
      tbody.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">No reminders found.</div>';
      return;
    }

    reminders.forEach(r => {
      let badgeClass = 'badge-inprogress';
      let cardStyle = '';
      
      if (r.status === 'COMPLETED') { 
        badgeClass = 'badge-completed'; 
        cardStyle = 'opacity: 0.6; filter: grayscale(1);';
      }

      const d = new Date(r.time);
      const isPast = d < new Date() && r.status === 'ACTIVE';
      const initials = r.owner ? r.owner.name.substring(0,2).toUpperCase() : 'ME';

      let avatarsHtml = '';
      if (r.assignedTo && r.assignedTo.length > 0) {
        r.assignedTo.forEach(assignee => {
          const init = assignee.name ? assignee.name.substring(0, 2).toUpperCase() : '?';
          avatarsHtml += `<span class="metadata" style="margin-right: 8px;" title="Assigned to ${assignee.name || 'Unknown'}">${assignee.name || 'Unknown'}</span>`;
        });
      } else {
        avatarsHtml = `<span class="metadata">Assigned: Just Me</span>`;
      }

      const card = document.createElement('div');
      card.className = 'card';
      if (cardStyle) card.style = cardStyle;
      
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title" style="font-size: 18px; ${isPast ? 'color: #ef4444;' : ''}">${r.title}</h3>
          <div class="avatar" title="Owner: ${r.owner ? r.owner.name : 'Unknown'}">${initials}</div>
        </div>
        <div class="card-body">
          <p class="body-text" style="${isPast ? 'color: #ef4444; font-weight: 500;' : ''} margin-bottom: 0.5rem;">Due: ${d.toLocaleString()}</p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span class="badge" style="border: 1px solid var(--border-color);">${r.repeat.replace('_', ' ')}</span>
            <span class="badge ${badgeClass}">${r.status}</span>
          </div>
        </div>
        <div class="card-footer">
          <div>${avatarsHtml}</div>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary toggle-btn" style="padding: 0.25rem 0.5rem; font-size: 12px;">${r.status === 'ACTIVE' ? 'Complete' : 'Reactivate'}</button>
            <button class="btn btn-secondary del-btn" style="padding: 0.25rem 0.5rem; font-size: 12px; color: #ef4444; border-color: #fca5a5;">Delete</button>
          </div>
        </div>
      `;
      
      const toggleBtn = card.querySelector('.toggle-btn');
      toggleBtn.addEventListener('click', () => container.toggleStatus(r._id, r.status));

      const delBtn = card.querySelector('.del-btn');
      delBtn.addEventListener('click', () => container.deleteReminder(r._id));
      
      tbody.appendChild(card);
    });
  };

  fetchData();

  return container;
}
