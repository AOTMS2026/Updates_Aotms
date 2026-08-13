import { API_BASE_URL } from '../config.js';
export function renderTasks() {
  const container = document.createElement('div');
  
  let editingTaskId = null;

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem;">
        <input type="text" class="input" placeholder="Search tasks..." style="width: 250px;">
        <select class="input" style="width: 150px;">
          <option>All Priorities</option>
          <option>HIGH</option>
          <option>MEDIUM</option>
          <option>LOW</option>
        </select>
        <select class="input" style="width: 150px;">
          <option>All Statuses</option>
          <option>TODO</option>
          <option>IN PROGRESS</option>
          <option>COMPLETED</option>
        </select>
      </div>
      <button id="addTaskBtn" class="btn btn-primary">+ New Task</button>
    </div>

    <div id="tasks-list" class="grid-container">
      <div style="text-align: center; color: var(--text-muted); width: 100%;">Loading...</div>
    </div>

    <!-- Modal Template -->
    <div id="taskModal" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <button class="modal-close" id="closeTaskModal">&times;</button>
        <h2 id="modalTitle" class="section-title">New Task</h2>
        <form id="taskForm" style="margin-top: 1.5rem;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Title *</label>
            <input type="text" id="taskTitle" class="input" required>
          </div>
          <div style="margin-bottom: 1rem; position: relative;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Assigned To</label>
            <div id="taskAssigneeBtn" class="input" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; min-height: 38px;">
              <span id="taskAssigneeText">Select Assignees...</span>
              <span style="font-size: 12px; color: var(--text-muted);">▼</span>
            </div>
            <div id="taskAssigneeDropdown" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); max-height: 200px; overflow-y: auto; z-index: 100; box-shadow: var(--shadow-md); padding: 0.5rem; flex-direction: column; gap: 0.25rem; margin-top: 4px;">
              <!-- Dynamic Checkboxes -->
            </div>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Feature</label>
            <select id="taskFeature" class="input">
              <option value="">None</option>
              <option value="other">Others</option>
            </select>
          </div>
          <div id="customFeatureDiv" style="margin-bottom: 1rem; display: none;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500; color: var(--accent-primary);">Custom Feature Message</label>
            <input type="text" id="taskCustomFeature" class="input" placeholder="Type custom message or feature name here...">
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
                <option value="COMPLETED">COMPLETED</option>
                <option value="BLOCKED">BLOCKED</option>
              </select>
            </div>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Save Task</button>
        </form>
      </div>
    </div>
  `;

  // Modal logic
  const modal = container.querySelector('#taskModal');
  const addBtn = container.querySelector('#addTaskBtn');
  const closeBtn = container.querySelector('#closeTaskModal');
  const form = container.querySelector('#taskForm');
  const featureSelect = container.querySelector('#taskFeature');
  const customFeatureDiv = container.querySelector('#customFeatureDiv');
  const modalTitle = container.querySelector('#modalTitle');

  const taskAssigneeBtn = container.querySelector('#taskAssigneeBtn');
  const taskAssigneeDropdown = container.querySelector('#taskAssigneeDropdown');
  const taskAssigneeText = container.querySelector('#taskAssigneeText');

  taskAssigneeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = taskAssigneeDropdown.style.display === 'flex';
    taskAssigneeDropdown.style.display = isVisible ? 'none' : 'flex';
  });

  document.addEventListener('click', (e) => {
    if (!taskAssigneeBtn.contains(e.target) && !taskAssigneeDropdown.contains(e.target)) {
      taskAssigneeDropdown.style.display = 'none';
    }
  });

  const updateAssigneeText = () => {
    const checked = Array.from(taskAssigneeDropdown.querySelectorAll('.assignee-checkbox:checked'));
    if (checked.length === 0) {
      taskAssigneeText.textContent = 'Unassigned';
    } else if (checked.length === 1) {
      taskAssigneeText.textContent = checked[0].nextElementSibling.textContent;
    } else {
      taskAssigneeText.textContent = `${checked.length} employees selected`;
    }
  };

  featureSelect.addEventListener('change', (e) => {
    if (e.target.value === 'other') {
      customFeatureDiv.style.display = 'block';
    } else {
      customFeatureDiv.style.display = 'none';
    }
  });

  const loadDropdowns = async () => {
    try {
      const token = localStorage.getItem('aotms_token');
      
      const resF = await fetch(`${API_BASE_URL}/tasks/features`, { headers: { 'Authorization': 'Bearer ' + token } });
      const features = await resF.json();
      featureSelect.innerHTML = '<option value="">None</option><option value="other">Others</option>';
      features.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f._id;
        opt.textContent = f.title;
        featureSelect.appendChild(opt);
      });

      const resU = await fetch(`${API_BASE_URL}/users`, { headers: { 'Authorization': 'Bearer ' + token } });
      const users = await resU.json();
      taskAssigneeDropdown.innerHTML = '';
      users.forEach(u => {
        const label = document.createElement('label');
        label.style = 'display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border-radius: var(--radius-sm); transition: background 0.2s;';
        label.onmouseover = () => label.style.background = 'var(--bg-primary)';
        label.onmouseout = () => label.style.background = 'transparent';
        
        label.innerHTML = `<input type="checkbox" value="${u._id}" class="assignee-checkbox" style="cursor: pointer;"><span>${u.name}</span>`;
        
        label.querySelector('.assignee-checkbox').addEventListener('change', updateAssigneeText);
        
        taskAssigneeDropdown.appendChild(label);
      });
      updateAssigneeText();
    } catch (e) { console.error(e); }
  };

  addBtn.addEventListener('click', async () => {
    editingTaskId = null;
    modalTitle.textContent = "New Task";
    form.reset();
    customFeatureDiv.style.display = 'none';
    await loadDropdowns();
    modal.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  container.openEditModal = async (taskData) => {
    editingTaskId = taskData._id;
    modalTitle.textContent = "Edit Task";
    form.reset();
    await loadDropdowns();

    form.querySelector('#taskTitle').value = taskData.title || '';
    form.querySelector('#taskStatus').value = taskData.status || 'TODO';
    form.querySelector('#taskPriority').value = taskData.priority || 'MEDIUM';
    
    // Clear selections first
    Array.from(taskAssigneeDropdown.querySelectorAll('.assignee-checkbox')).forEach(cb => cb.checked = false);
    if (taskData.assignedTo && taskData.assignedTo.length > 0) {
      const assignedIds = taskData.assignedTo.map(a => a._id);
      Array.from(taskAssigneeDropdown.querySelectorAll('.assignee-checkbox')).forEach(cb => {
        if (assignedIds.includes(cb.value)) cb.checked = true;
      });
    }
    updateAssigneeText();

    let rawDesc = taskData.description || '';
    if (!taskData.feature && rawDesc.includes('[Custom Feature:')) {
      featureSelect.value = 'other';
      customFeatureDiv.style.display = 'block';
      const match = rawDesc.match(/\\[Custom Feature: (.*?)\\]/);
      if (match) {
        form.querySelector('#taskCustomFeature').value = match[1];
      }
    } else if (taskData.feature && taskData.feature._id) {
      featureSelect.value = taskData.feature._id;
      customFeatureDiv.style.display = 'none';
    } else {
      featureSelect.value = "";
      customFeatureDiv.style.display = 'none';
    }
    
    modal.style.display = 'flex';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('aotms_token');
    
    let descriptionText = '';
    const featureId = form.querySelector('#taskFeature').value;
    const customFeatureText = form.querySelector('#taskCustomFeature').value;

    if (featureId === 'other' && customFeatureText) {
      descriptionText = `[Custom Feature: ${customFeatureText}]`;
    }

    const body = {
      title: form.querySelector('#taskTitle').value,
      priority: form.querySelector('#taskPriority').value,
      status: form.querySelector('#taskStatus').value,
      description: descriptionText,
      type: 'TASK'
    };
    
    if (featureId && featureId !== 'other') {
      body.feature = featureId;
    } else if (featureId === '') {
      body.feature = null;
    }

    const assigneeCheckboxes = Array.from(taskAssigneeDropdown.querySelectorAll('.assignee-checkbox:checked'));
    const assigneeIds = assigneeCheckboxes.map(cb => cb.value).filter(val => val !== "");

    if (assigneeIds.length > 0) {
      body.assignedTo = assigneeIds;
    } else {
      body.assignedTo = [];
    }

    try {
      const url = editingTaskId ? `${API_BASE_URL}/tasks/${editingTaskId}` : `${API_BASE_URL}/tasks`;
      const method = editingTaskId ? 'PUT' : 'POST';

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
      customFeatureDiv.style.display = 'none';
      editingTaskId = null;
      fetchTasks(container);
    } catch (err) {
      console.error(err);
    }
  });

  fetchTasks(container);

  return container;
}

async function fetchTasks(container) {
  try {
    const token = localStorage.getItem('aotms_token');
    const res = await fetch(`${API_BASE_URL}/tasks?type=TASK`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    const tasks = await res.json();
    
    const tbody = container.querySelector('#tasks-list');
    tbody.innerHTML = '';
    
    if (tasks.length === 0) {
      tbody.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">No tasks found.</div>';
      return;
    }

    tasks.forEach(task => {
      let badgeClass = 'badge-todo';
      let statusText = 'TODO';
      if (task.status === 'IN_PROGRESS') { badgeClass = 'badge-inprogress'; statusText = 'IN PROGRESS'; }
      else if (task.status === 'COMPLETED') { badgeClass = 'badge-completed'; statusText = 'COMPLETED'; }
      else if (task.status === 'BLOCKED') { badgeClass = 'badge-blocked'; statusText = 'BLOCKED'; }

      let displayFeature = task.feature ? task.feature.title : 'No Feature';
      if (!task.feature && task.description && task.description.includes('[Custom Feature:')) {
        const match = task.description.match(/\\[Custom Feature: (.*?)\\]/);
        if (match) {
          displayFeature = match[1] + ' (Custom)';
        }
      }

      let avatarsHtml = '';
      if (task.assignedTo && task.assignedTo.length > 0) {
        task.assignedTo.forEach(assignee => {
          const init = assignee.name ? assignee.name.substring(0, 2).toUpperCase() : '?';
          avatarsHtml += `<div class="avatar" title="Owner: ${assignee.name || 'Unknown'}">${init}</div>`;
        });
      } else {
        avatarsHtml = `<div class="avatar" title="Owner: Unassigned">?</div>`;
      }

      const card = document.createElement('div');
      card.className = 'card';
      if (task.status === 'COMPLETED') card.style = 'opacity: 0.6; filter: grayscale(1);';
      
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title" style="font-size: 18px;">${task.title}</h3>
          <div style="display: flex; gap: -8px;">${avatarsHtml}</div>
        </div>
        <div class="card-body">
          <p class="metadata" style="margin-bottom: 1rem;">Feature: <span style="color: var(--text-primary);">${displayFeature}</span></p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap;">
            <span class="badge" style="border: 1px solid var(--border-color);">${task.priority}</span>
            <span class="badge ${badgeClass}">${statusText}</span>
          </div>
        </div>
        <div class="card-footer">
          <span class="metadata"></span>
          <button class="btn btn-secondary edit-btn" style="padding: 0.25rem 0.5rem; font-size: 12px;">Edit</button>
        </div>
      `;
      
      const editBtn = card.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => {
        container.openEditModal(task);
      });

      tbody.appendChild(card);
    });
  } catch (err) {
    console.error(err);
  }
}
