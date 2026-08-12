import { API_BASE_URL } from '../config.js';
export function renderTodo() {
  const container = document.createElement('div');
  
  let editingTodoId = null;
  let allTodos = [];
  
  let currentStatusFilter = "";
  let currentTypeFilter = "";

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem;">
        <input type="text" id="searchTodo" class="input" placeholder="Search todos..." style="width: 250px;">
        <select id="filterType" class="input" style="width: 150px;">
          <option value="">All Types</option>
          <option value="PERSONAL">PERSONAL</option>
          <option value="TEAM">TEAM</option>
        </select>
        <select id="filterStatus" class="input" style="width: 150px;">
          <option value="">All Statuses</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
      </div>
      <button id="addTodoBtn" class="btn btn-primary">+ Add Todo</button>
    </div>

    <div id="todos-list" class="grid-container">
      <div style="text-align: center; color: var(--text-muted); width: 100%;">Loading...</div>
    </div>

    <!-- Modal Template -->
    <div id="todoModal" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <button class="modal-close" id="closeTodoModal">&times;</button>
        <h2 id="modalTitle" class="section-title">Add Todo</h2>
        <form id="todoForm" style="margin-top: 1.5rem;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Title *</label>
            <input type="text" id="todoTitle" class="input" required>
          </div>
          
          <div style="margin-bottom: 1rem; display: flex; gap: 1rem;">
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Type</label>
              <select id="todoType" class="input">
                <option value="PERSONAL" selected>PERSONAL</option>
                <option value="TEAM">TEAM</option>
              </select>
            </div>
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Assigned To (If Team)</label>
              <select id="todoAssignee" class="input">
                <option value="">Unassigned / Me</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 1rem; display: flex; gap: 1rem;">
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Status</label>
              <select id="todoStatus" class="input">
                <option value="TODO" selected>TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
                <option value="CANCELLED">CANCELLED</option>
              </select>
            </div>
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Priority</label>
              <select id="todoPriority" class="input">
                <option value="LOW">LOW</option>
                <option value="MEDIUM" selected>MEDIUM</option>
                <option value="HIGH">HIGH</option>
                <option value="URGENT">URGENT</option>
              </select>
            </div>
          </div>
          
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Description</label>
            <textarea id="todoDesc" class="input" rows="2"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Save Todo</button>
        </form>
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#searchTodo');
  const filterStatus = container.querySelector('#filterStatus');
  const filterType = container.querySelector('#filterType');

  const modal = container.querySelector('#todoModal');
  const addBtn = container.querySelector('#addTodoBtn');
  const closeBtn = container.querySelector('#closeTodoModal');
  const form = container.querySelector('#todoForm');
  const modalTitle = container.querySelector('#modalTitle');
  const tbody = container.querySelector('#todos-list');
  const assigneeSelect = container.querySelector('#todoAssignee');

  const applyFiltersAndRender = () => {
    currentStatusFilter = filterStatus.value;
    currentTypeFilter = filterType.value;
    const searchTerm = searchInput.value.toLowerCase();

    let filtered = allTodos.filter(t => {
      if (currentStatusFilter && t.status !== currentStatusFilter) return false;
      if (currentTypeFilter && t.type !== currentTypeFilter) return false;
      if (searchTerm && !t.title.toLowerCase().includes(searchTerm)) return false;
      return true;
    });

    renderTable(filtered);
  };

  searchInput.addEventListener('input', applyFiltersAndRender);
  filterStatus.addEventListener('change', applyFiltersAndRender);
  filterType.addEventListener('change', applyFiltersAndRender);

  const loadUsers = async () => {
    try {
      const token = localStorage.getItem('aotms_token');
      const res = await fetch(`${API_BASE_URL}/users`, { headers: { 'Authorization': 'Bearer ' + token } });
      const users = await res.json();
      assigneeSelect.innerHTML = '<option value="">Unassigned / Me</option>';
      users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u._id;
        opt.textContent = u.name;
        assigneeSelect.appendChild(opt);
      });
    } catch (e) { console.error(e); }
  };

  addBtn.addEventListener('click', async () => {
    editingTodoId = null;
    modalTitle.textContent = "Add Todo";
    form.reset();
    await loadUsers();
    modal.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  container.openEditModal = async (todoData) => {
    editingTodoId = todoData._id;
    modalTitle.textContent = "Edit Todo";
    form.reset();
    await loadUsers();
    
    form.querySelector('#todoTitle').value = todoData.title || '';
    form.querySelector('#todoType').value = todoData.type || 'PERSONAL';
    form.querySelector('#todoStatus').value = todoData.status || 'TODO';
    form.querySelector('#todoPriority').value = todoData.priority || 'MEDIUM';
    form.querySelector('#todoDesc').value = todoData.description || '';
    if (todoData.assignedTo && todoData.assignedTo._id) assigneeSelect.value = todoData.assignedTo._id;
    
    modal.style.display = 'flex';
  };

  container.deleteTodo = async (id) => {
    if (!confirm('Are you sure you want to delete this Todo?')) return;
    try {
      const token = localStorage.getItem('aotms_token');
      await fetch(`${API_BASE_URL}/todos/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': 'Bearer ' + token }
      });
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('aotms_token');
    
    const body = {
      title: form.querySelector('#todoTitle').value,
      type: form.querySelector('#todoType').value,
      status: form.querySelector('#todoStatus').value,
      priority: form.querySelector('#todoPriority').value,
      description: form.querySelector('#todoDesc').value
    };

    const assigneeId = form.querySelector('#todoAssignee').value;
    if (assigneeId) body.assignedTo = assigneeId;
    else body.assignedTo = null;

    try {
      const url = editingTodoId ? `${API_BASE_URL}/todos/${editingTodoId}` : `${API_BASE_URL}/todos`;
      const method = editingTodoId ? 'PUT' : 'POST';

      await fetch(url, {
        method: method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify(body)
      });
      modal.style.display = 'none';
      form.reset();
      editingTodoId = null;
      fetchData();
    } catch (err) {
      console.error(err);
    }
  });

  const fetchData = async () => {
    tbody.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">Loading...</div>';
    try {
      const token = localStorage.getItem('aotms_token');
      const res = await fetch(`${API_BASE_URL}/todos`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      allTodos = await res.json();
      applyFiltersAndRender();
    } catch (err) {
      console.error(err);
    }
  };

  const renderTable = (todos) => {
    tbody.innerHTML = '';
    if (todos.length === 0) {
      tbody.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">No TODOs found.</div>';
      return;
    }

    todos.forEach(t => {
      let badgeClass = 'badge-todo';
      if (t.status === 'IN_PROGRESS') badgeClass = 'badge-inprogress';
      else if (t.status === 'COMPLETED') badgeClass = 'badge-completed';

      let prioClass = 'badge-todo';
      if (t.priority === 'HIGH') prioClass = 'badge-blocked';
      else if (t.priority === 'MEDIUM') prioClass = 'badge-inprogress';

      const initials = t.assignedTo ? t.assignedTo.name.substring(0,2).toUpperCase() : '?';

      const card = document.createElement('div');
      card.className = 'card';
      if (t.status === 'COMPLETED') card.style = 'opacity: 0.6; filter: grayscale(1);';
      
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title" style="font-size: 18px;">${t.title}</h3>
          <div class="avatar" title="Assigned to ${t.assignedTo ? t.assignedTo.name : 'Unknown'}">${initials}</div>
        </div>
        <div class="card-body">
          <p class="body-text" style="margin-bottom: 1rem; white-space: pre-wrap;">${t.description || 'No description'}</p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 0.5rem;">
            <span class="badge" style="border: 1px solid var(--border-color);">${t.type}</span>
            <span class="badge ${prioClass}">${t.priority}</span>
            <span class="badge ${badgeClass}">${t.status.replace('_', ' ')}</span>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-secondary edit-btn" style="padding: 0.25rem 0.5rem; font-size: 12px;">Update Status</button>
          <button class="btn btn-secondary del-btn" style="padding: 0.25rem 0.5rem; font-size: 12px; color: #ef4444; border-color: #fca5a5;">Delete</button>
        </div>
      `;
      
      const editBtn = card.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => container.openEditModal(t));

      const delBtn = card.querySelector('.del-btn');
      delBtn.addEventListener('click', () => container.deleteTodo(t._id));
      
      tbody.appendChild(card);
    });
  };

  fetchData();

  return container;
}
