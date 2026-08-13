import { API_BASE_URL } from '../config.js';

export function renderTasks() {
  const container = document.createElement('div');
  
  let allCompletedWork = [];
  let currentTypeFilter = "";

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem;">
        <input type="text" id="searchWork" class="input" placeholder="Search completed work..." style="width: 250px;">
        <select id="filterType" class="input" style="width: 150px;">
          <option value="">All Types</option>
          <option value="TODO">Todo</option>
          <option value="TASK">Task</option>
        </select>
      </div>
    </div>

    <div id="work-list" class="grid-container">
      <div style="text-align: center; color: var(--text-muted); width: 100%;">Loading...</div>
    </div>
  `;

  const searchInput = container.querySelector('#searchWork');
  const filterType = container.querySelector('#filterType');
  const tbody = container.querySelector('#work-list');

  container.deleteItem = async (id, itemType) => {
    if (!confirm(`Are you sure you want to delete this ${itemType}?`)) return;
    try {
      const token = localStorage.getItem('aotms_token');
      const endpoint = itemType === 'TODO' ? 'todos' : 'tasks';
      await fetch(`${API_BASE_URL}/${endpoint}/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      fetchData();
    } catch (err) { console.error(err); }
  };

  // --- Filtering & Rendering ---
  const applyFiltersAndRender = () => {
    currentTypeFilter = filterType.value;
    const searchTerm = searchInput.value.toLowerCase();

    let filtered = allCompletedWork.filter(item => {
      if (currentTypeFilter && item.itemType !== currentTypeFilter) return false;
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm)) return false;
      return true;
    });

    renderTable(filtered);
  };

  searchInput.addEventListener('input', applyFiltersAndRender);
  filterType.addEventListener('change', applyFiltersAndRender);

  const fetchData = async () => {
    tbody.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">Loading...</div>';
    try {
      const token = localStorage.getItem('aotms_token');
      const [todosRes, tasksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/todos`, { headers: { 'Authorization': 'Bearer ' + token } }),
        fetch(`${API_BASE_URL}/tasks`, { headers: { 'Authorization': 'Bearer ' + token } })
      ]);
      const todosData = await todosRes.json();
      const tasksData = await tasksRes.json();

      allCompletedWork = [
        ...todosData.map(t => ({...t, itemType: 'TODO'})),
        ...tasksData.map(t => ({...t, itemType: 'TASK'}))
      ].filter(item => item.status === 'COMPLETED'); // Filter only completed!

      applyFiltersAndRender();
    } catch (err) {
      console.error(err);
    }
  };

  const renderTable = (items) => {
    tbody.innerHTML = '';
    if (items.length === 0) {
      tbody.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">No completed work found.</div>';
      return;
    }

    items.forEach(item => {
      let badgeClass = 'badge-completed';
      
      let prioClass = 'badge-todo';
      if (item.priority === 'HIGH' || item.priority === 'URGENT') prioClass = 'badge-blocked';
      else if (item.priority === 'MEDIUM') prioClass = 'badge-inprogress';

      let avatarsHtml = '';
      if (item.assignedTo && item.assignedTo.length > 0) {
        item.assignedTo.forEach(assignee => {
          const init = assignee.name ? assignee.name.substring(0, 2).toUpperCase() : '?';
          avatarsHtml += `<div class="avatar" title="Assigned to ${assignee.name || 'Unknown'}">${init}</div>`;
        });
      } else {
        avatarsHtml = `<div class="avatar" title="Unassigned / Me">ME</div>`;
      }
      
      const card = document.createElement('div');
      card.className = 'card';
      card.style = 'opacity: 0.7;'; 
      
      const svgEye = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor: pointer; vertical-align: middle; margin-right: 4px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;
      const completedDate = item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : 'Unknown Date';

      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title" style="font-size: 18px;">${item.title}</h3>
          <div style="display: flex; gap: -8px;">${avatarsHtml}</div>
        </div>
        <div class="card-body">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
            <span class="badge" style="border: 1px solid var(--border-color);">${item.itemType === 'TODO' ? (item.type || 'PERSONAL') + ' TODO' : 'TASK'}</span>
            <span class="badge ${prioClass}">${item.priority || 'MEDIUM'}</span>
            <span class="badge ${badgeClass}">COMPLETED</span>
          </div>
          <div style="background: var(--bg-surface); padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <div class="desc-reveal-btn" style="color: var(--accent-primary); cursor: pointer; display: flex; align-items: center;">
              ${svgEye} <span style="font-size: 13px; font-weight: 500;">View Description</span>
            </div>
            <div class="desc-text" style="display: none; margin-top: 8px; font-size: 13px; color: var(--text-secondary); white-space: pre-wrap;">${item.description || 'No description provided.'}</div>
          </div>
        </div>
        <div class="card-footer" style="justify-content: space-between; align-items: center;">
          <span class="metadata">Completed: ${completedDate}</span>
          <button class="btn btn-secondary del-btn" style="padding: 0.25rem 0.5rem; font-size: 12px; color: #ef4444; border-color: #fca5a5;">Delete</button>
        </div>
      `;

      card.querySelector('.desc-reveal-btn').addEventListener('click', () => {
        const descText = card.querySelector('.desc-text');
        descText.style.display = descText.style.display === 'none' ? 'block' : 'none';
      });

      card.querySelector('.del-btn').addEventListener('click', () => {
        container.deleteItem(item._id, item.itemType);
      });
      
      tbody.appendChild(card);
    });
  };

  fetchData();

  return container;
}
