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
      
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title" style="font-size: 18px;">${item.title}</h3>
          <div style="display: flex; gap: -8px;">${avatarsHtml}</div>
        </div>
        <div class="card-body">
          <p class="body-text" style="margin-bottom: 1rem; white-space: pre-wrap;">${item.description || 'No description'}</p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
            <span class="badge" style="border: 1px solid var(--border-color);">${item.itemType === 'TODO' ? (item.type || 'PERSONAL') + ' TODO' : 'TASK'}</span>
            <span class="badge ${prioClass}">${item.priority || 'MEDIUM'}</span>
            <span class="badge ${badgeClass}">COMPLETED</span>
          </div>
        </div>
        <div class="card-footer" style="justify-content: flex-end;">
          <button class="btn btn-secondary del-btn" style="padding: 0.25rem 0.5rem; font-size: 12px; color: #ef4444; border-color: #fca5a5;">Delete</button>
        </div>
      `;

      card.querySelector('.del-btn').addEventListener('click', () => {
        container.deleteItem(item._id, item.itemType);
      });
      
      tbody.appendChild(card);
    });
  };

  fetchData();

  return container;
}
