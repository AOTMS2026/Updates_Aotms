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

  const applyFiltersAndRender = () => {
    currentStatusFilter = filterStatus.value;
    let filtered = allReminders.filter(r => {
      if (currentStatusFilter && r.status !== currentStatusFilter) return false;
      return true;
    });
    renderTable(filtered);
  };

  filterStatus.addEventListener('change', applyFiltersAndRender);

  addBtn.addEventListener('click', () => {
    form.reset();
    
    // Set default datetime to now
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    container.querySelector('#remTime').value = now.toISOString().slice(0,16);

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
          <span class="metadata"></span>
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
