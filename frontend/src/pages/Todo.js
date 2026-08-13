import { API_BASE_URL } from '../config.js';

export function renderTodo() {
  const container = document.createElement('div');
  
  let editingTodoId = null;
  let editingTaskId = null;
  let allWork = [];
  
  let currentStatusFilter = "";
  let currentTypeFilter = "";

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem;">
        <input type="text" id="searchWork" class="input" placeholder="Search work..." style="width: 250px;">
        <select id="filterType" class="input" style="width: 150px;">
          <option value="">All Types</option>
          <option value="TODO">Todo (Personal/Team)</option>
          <option value="TASK">Task</option>
        </select>
        <select id="filterStatus" class="input" style="width: 150px;">
          <option value="">All Statuses</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
      </div>
      <div style="display: flex; gap: 1rem;">
        <button id="addTodoBtn" class="btn btn-secondary">+ Add Todo</button>
        <button id="addTaskBtn" class="btn btn-primary">+ Add Task</button>
      </div>
    </div>

    <div id="work-list" class="grid-container">
      <div style="text-align: center; color: var(--text-muted); width: 100%;">Loading...</div>
    </div>

    <!-- Todo Modal -->
    <div id="todoModal" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <button class="modal-close" id="closeTodoModal">&times;</button>
        <h2 id="todoModalTitle" class="section-title">Add Todo</h2>
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
            <div style="margin-bottom: 1rem; position: relative; flex: 1;">
              <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Assigned To (If Team)</label>
              <div id="todoAssigneeBtn" class="input" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; min-height: 38px;">
                <span id="todoAssigneeText">Unassigned / Me</span>
                <span style="font-size: 12px; color: var(--text-muted);">▼</span>
              </div>
              <div id="todoAssigneeDropdown" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); max-height: 200px; overflow-y: auto; z-index: 100; box-shadow: var(--shadow-md); padding: 0.5rem; flex-direction: column; gap: 0.25rem; margin-top: 4px;">
                <!-- Dynamic Checkboxes -->
              </div>
            </div>
          </div>

          <div style="margin-bottom: 1rem; display: flex; gap: 1rem;">
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Status</label>
              <select id="todoStatus" class="input">
                <option value="TODO" selected>TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
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

    <!-- Task Modal -->
    <div id="taskModal" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <button class="modal-close" id="closeTaskModal">&times;</button>
        <h2 id="taskModalTitle" class="section-title">New Task</h2>
        <form id="taskForm" style="margin-top: 1.5rem;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Title *</label>
            <input type="text" id="taskTitle" class="input" required>
          </div>
          
          <div style="margin-bottom: 1rem; position: relative;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Assigned To</label>
            <div id="taskAssigneeBtn" class="input" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; min-height: 38px;">
              <span id="taskAssigneeText">Unassigned</span>
              <span style="font-size: 12px; color: var(--text-muted);">▼</span>
            </div>
            <div id="taskAssigneeDropdown" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); max-height: 200px; overflow-y: auto; z-index: 100; box-shadow: var(--shadow-md); padding: 0.5rem; flex-direction: column; gap: 0.25rem; margin-top: 4px;">
              <!-- Dynamic Checkboxes -->
            </div>
          </div>

          <div style="margin-bottom: 1rem; display: flex; gap: 1rem;">
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Priority</label>
              <select id="taskPriority" class="input">
                <option value="LOW">LOW</option>
                <option value="MEDIUM" selected>MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Status</label>
              <select id="taskStatus" class="input">
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS">IN PROGRESS</option>
              </select>
            </div>
          </div>

          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Description</label>
            <textarea id="taskDesc" class="input" rows="2"></textarea>
          </div>
          
          <button type="submit" class="btn btn-primary" style="width: 100%;">Save Task</button>
        </form>
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#searchWork');
  const filterStatus = container.querySelector('#filterStatus');
  const filterType = container.querySelector('#filterType');
  const tbody = container.querySelector('#work-list');

  // Todo Modal Elements
  const todoModal = container.querySelector('#todoModal');
  const addTodoBtn = container.querySelector('#addTodoBtn');
  const closeTodoBtn = container.querySelector('#closeTodoModal');
  const todoForm = container.querySelector('#todoForm');
  const todoModalTitle = container.querySelector('#todoModalTitle');
  const todoTypeSelect = container.querySelector('#todoType');
  const todoAssigneeBtn = container.querySelector('#todoAssigneeBtn');
  const todoAssigneeDropdown = container.querySelector('#todoAssigneeDropdown');
  const todoAssigneeText = container.querySelector('#todoAssigneeText');

  // Task Modal Elements
  const taskModal = container.querySelector('#taskModal');
  const addTaskBtn = container.querySelector('#addTaskBtn');
  const closeTaskBtn = container.querySelector('#closeTaskModal');
  const taskForm = container.querySelector('#taskForm');
  const taskModalTitle = container.querySelector('#taskModalTitle');
  const taskAssigneeBtn = container.querySelector('#taskAssigneeBtn');
  const taskAssigneeDropdown = container.querySelector('#taskAssigneeDropdown');
  const taskAssigneeText = container.querySelector('#taskAssigneeText');

  // --- Assignee Dropdown Logic ---
  const setupDropdown = (btn, dropdown, textEl, defaultText) => {
    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isVisible = dropdown.style.display === 'flex';
      dropdown.style.display = isVisible ? 'none' : 'flex';
    });
    document.addEventListener('click', (e) => {
      if (!btn.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });
    return () => {
      const checked = Array.from(dropdown.querySelectorAll('.assignee-checkbox:checked'));
      if (checked.length === 0) textEl.textContent = defaultText;
      else if (checked.length === 1) textEl.textContent = checked[0].nextElementSibling.textContent;
      else textEl.textContent = `${checked.length} employees selected`;
    };
  };

  const updateTodoAssigneeText = setupDropdown(todoAssigneeBtn, todoAssigneeDropdown, todoAssigneeText, 'Unassigned / Me');
  const updateTaskAssigneeText = setupDropdown(taskAssigneeBtn, taskAssigneeDropdown, taskAssigneeText, 'Unassigned');

  todoTypeSelect.addEventListener('change', async (e) => {
    if (e.target.value === 'TEAM') {
      await loadUsers(todoAssigneeDropdown, updateTodoAssigneeText);
    } else {
      todoAssigneeDropdown.innerHTML = '';
      updateTodoAssigneeText();
    }
  });

  const loadUsers = async (dropdown, updateTextFn) => {
    try {
      const token = localStorage.getItem('aotms_token');
      const res = await fetch(`${API_BASE_URL}/users`, { headers: { 'Authorization': 'Bearer ' + token } });
      const users = await res.json();
      dropdown.innerHTML = '';
      users.forEach(u => {
        const label = document.createElement('label');
        label.style = 'display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border-radius: var(--radius-sm); transition: background 0.2s;';
        label.onmouseover = () => label.style.background = 'var(--bg-primary)';
        label.onmouseout = () => label.style.background = 'transparent';
        label.innerHTML = `<input type="checkbox" value="${u._id}" class="assignee-checkbox" style="cursor: pointer;"><span>${u.name}</span>`;
        label.querySelector('.assignee-checkbox').addEventListener('change', updateTextFn);
        dropdown.appendChild(label);
      });
      updateTextFn();
    } catch (e) { console.error(e); }
  };

  // --- Modal Openers ---
  addTodoBtn.addEventListener('click', async () => {
    editingTodoId = null;
    todoModalTitle.textContent = "Add Todo";
    todoForm.reset();
    todoAssigneeDropdown.innerHTML = '';
    updateTodoAssigneeText();
    todoModal.style.display = 'flex';
  });

  addTaskBtn.addEventListener('click', async () => {
    editingTaskId = null;
    taskModalTitle.textContent = "New Task";
    taskForm.reset();
    await loadUsers(taskAssigneeDropdown, updateTaskAssigneeText);
    Array.from(taskAssigneeDropdown.querySelectorAll('.assignee-checkbox')).forEach(cb => cb.checked = false);
    updateTaskAssigneeText();
    taskModal.style.display = 'flex';
  });

  closeTodoBtn.addEventListener('click', () => todoModal.style.display = 'none');
  closeTaskBtn.addEventListener('click', () => taskModal.style.display = 'none');

  container.openEditTodoModal = async (todoData) => {
    editingTodoId = todoData._id;
    todoModalTitle.textContent = "Edit Todo";
    todoForm.reset();
    
    if (todoData.type === 'TEAM') {
      await loadUsers(todoAssigneeDropdown, updateTodoAssigneeText);
    } else {
      todoAssigneeDropdown.innerHTML = '';
    }
    
    todoForm.querySelector('#todoTitle').value = todoData.title || '';
    todoForm.querySelector('#todoType').value = todoData.type || 'PERSONAL';
    todoForm.querySelector('#todoStatus').value = todoData.status || 'TODO';
    todoForm.querySelector('#todoPriority').value = todoData.priority || 'MEDIUM';
    todoForm.querySelector('#todoDesc').value = todoData.description || '';
    
    Array.from(todoAssigneeDropdown.querySelectorAll('.assignee-checkbox')).forEach(cb => cb.checked = false);
    if (todoData.assignedTo && todoData.assignedTo.length > 0) {
      const assignedIds = todoData.assignedTo.map(a => a._id);
      Array.from(todoAssigneeDropdown.querySelectorAll('.assignee-checkbox')).forEach(cb => {
        if (assignedIds.includes(cb.value)) cb.checked = true;
      });
    }
    updateTodoAssigneeText();
    todoModal.style.display = 'flex';
  };

  container.openEditTaskModal = async (taskData) => {
    editingTaskId = taskData._id;
    taskModalTitle.textContent = "Edit Task";
    taskForm.reset();
    await loadUsers(taskAssigneeDropdown, updateTaskAssigneeText);

    taskForm.querySelector('#taskTitle').value = taskData.title || '';
    taskForm.querySelector('#taskStatus').value = taskData.status || 'TODO';
    taskForm.querySelector('#taskPriority').value = taskData.priority || 'MEDIUM';
    taskForm.querySelector('#taskDesc').value = taskData.description || '';
    
    Array.from(taskAssigneeDropdown.querySelectorAll('.assignee-checkbox')).forEach(cb => cb.checked = false);
    if (taskData.assignedTo && taskData.assignedTo.length > 0) {
      const assignedIds = taskData.assignedTo.map(a => a._id);
      Array.from(taskAssigneeDropdown.querySelectorAll('.assignee-checkbox')).forEach(cb => {
        if (assignedIds.includes(cb.value)) cb.checked = true;
      });
    }
    updateTaskAssigneeText();
    taskModal.style.display = 'flex';
  };

  // --- Submissions ---
  todoForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('aotms_token');
    
    const body = {
      title: todoForm.querySelector('#todoTitle').value,
      type: todoForm.querySelector('#todoType').value,
      status: todoForm.querySelector('#todoStatus').value,
      priority: todoForm.querySelector('#todoPriority').value,
      description: todoForm.querySelector('#todoDesc').value
    };

    const assigneeIds = Array.from(todoAssigneeDropdown.querySelectorAll('.assignee-checkbox:checked')).map(cb => cb.value).filter(val => val !== "");
    body.assignedTo = assigneeIds.length > 0 ? assigneeIds : [];

    try {
      const url = editingTodoId ? `${API_BASE_URL}/todos/${editingTodoId}` : `${API_BASE_URL}/todos`;
      const method = editingTodoId ? 'PUT' : 'POST';
      await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(body)
      });
      todoModal.style.display = 'none';
      todoForm.reset();
      editingTodoId = null;
      fetchData();
    } catch (err) { console.error(err); }
  });

  taskForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('aotms_token');
    
    const body = {
      title: taskForm.querySelector('#taskTitle').value,
      priority: taskForm.querySelector('#taskPriority').value,
      status: taskForm.querySelector('#taskStatus').value,
      description: taskForm.querySelector('#taskDesc').value,
      type: 'TASK'
    };

    const assigneeIds = Array.from(taskAssigneeDropdown.querySelectorAll('.assignee-checkbox:checked')).map(cb => cb.value).filter(val => val !== "");
    body.assignedTo = assigneeIds.length > 0 ? assigneeIds : [];

    try {
      const url = editingTaskId ? `${API_BASE_URL}/tasks/${editingTaskId}` : `${API_BASE_URL}/tasks`;
      const method = editingTaskId ? 'PUT' : 'POST';
      await fetch(url, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token },
        body: JSON.stringify(body)
      });
      taskModal.style.display = 'none';
      taskForm.reset();
      editingTaskId = null;
      fetchData();
    } catch (err) { console.error(err); }
  });

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
    currentStatusFilter = filterStatus.value;
    currentTypeFilter = filterType.value;
    const searchTerm = searchInput.value.toLowerCase();

    let filtered = allWork.filter(item => {
      if (currentStatusFilter && item.status !== currentStatusFilter) return false;
      if (currentTypeFilter && item.itemType !== currentTypeFilter) return false;
      if (searchTerm && !item.title.toLowerCase().includes(searchTerm)) return false;
      return true;
    });

    renderTable(filtered);
  };

  searchInput.addEventListener('input', applyFiltersAndRender);
  filterStatus.addEventListener('change', applyFiltersAndRender);
  filterType.addEventListener('change', applyFiltersAndRender);

  const fetchData = async () => {
    tbody.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">Loading...</div>';
    try {
      const token = localStorage.getItem('aotms_token');
      const [todosRes, tasksRes] = await Promise.all([
        fetch(`${API_BASE_URL}/todos`, { headers: { 'Authorization': 'Bearer ' + token } }),
        fetch(`${API_BASE_URL}/tasks?type=TASK`, { headers: { 'Authorization': 'Bearer ' + token } })
      ]);
      const todosData = await todosRes.json();
      const tasksData = await tasksRes.json();

      allWork = [
        ...todosData.map(t => ({...t, itemType: 'TODO'})),
        ...tasksData.map(t => ({...t, itemType: 'TASK'}))
      ].filter(item => item.status === 'TODO'); // Filter to show ONLY TODO

      // Sort by updated time or something if needed, for now just render
      applyFiltersAndRender();
    } catch (err) {
      console.error(err);
    }
  };

  const renderTable = (items) => {
    tbody.innerHTML = '';
    if (items.length === 0) {
      tbody.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">No pending work found!</div>';
      return;
    }

    items.forEach(item => {
      let badgeClass = 'badge-todo';
      if (item.status === 'IN_PROGRESS') badgeClass = 'badge-inprogress';
      else if (item.status === 'BLOCKED') badgeClass = 'badge-blocked';
      
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
      const svgEye = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor: pointer; vertical-align: middle; margin-right: 4px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;

      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title" style="font-size: 18px;">${item.title}</h3>
          <div style="display: flex; gap: -8px;">${avatarsHtml}</div>
        </div>
        <div class="card-body">
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
            <span class="badge" style="border: 1px solid var(--border-color);">${item.itemType === 'TODO' ? (item.type || 'PERSONAL') + ' TODO' : 'TASK'}</span>
            <span class="badge ${prioClass}">${item.priority || 'MEDIUM'}</span>
            <span class="badge ${badgeClass}">${(item.status || 'TODO').replace('_', ' ')}</span>
          </div>
          <div style="background: var(--bg-surface); padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <div class="desc-reveal-btn" style="color: var(--accent-primary); cursor: pointer; display: flex; align-items: center;">
              ${svgEye} <span style="font-size: 13px; font-weight: 500;">View Description</span>
            </div>
            <div class="desc-text" style="display: none; margin-top: 8px; font-size: 13px; color: var(--text-secondary); white-space: pre-wrap;">${item.description || 'No description provided.'}</div>
          </div>
        </div>
        <div class="card-footer">
          <button class="btn btn-secondary edit-btn" style="padding: 0.25rem 0.5rem; font-size: 12px;">Edit</button>
          <button class="btn btn-secondary del-btn" style="padding: 0.25rem 0.5rem; font-size: 12px; color: #ef4444; border-color: #fca5a5;">Delete</button>
        </div>
      `;
      
      card.querySelector('.desc-reveal-btn').addEventListener('click', () => {
        const descText = card.querySelector('.desc-text');
        descText.style.display = descText.style.display === 'none' ? 'block' : 'none';
      });

      card.querySelector('.edit-btn').addEventListener('click', () => {
        if (item.itemType === 'TODO') container.openEditTodoModal(item);
        else container.openEditTaskModal(item);
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
