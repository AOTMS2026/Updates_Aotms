import { API_BASE_URL } from '../config.js';
export function renderWorkToday() {
  const container = document.createElement('div');
  
  let editingTaskId = null;
  let currentDate = new Date();
  let allTasksForDay = []; // Cache to apply filters
  
  // Filter states
  let currentMemberFilter = "";
  let currentFeatureFilter = "";
  let currentStatusFilter = "";

  const getFormattedDateString = (d) => {
    return d.toLocaleDateString('en-US', { day: 'numeric', month: 'short', year: 'numeric' });
  };
  const getApiDateString = (d) => {
    return d.toISOString().split('T')[0];
  };

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 1.5rem;">
      
      <div style="display: flex; flex-direction: column; gap: 0.5rem;">
        <div style="font-weight: 500; font-size: 14px; color: var(--text-muted); display: flex; align-items: center; gap: 0.5rem;">
          <span id="statsLabel">Today's Progress: 0/0 Completed (0%)</span>
          <div style="width: 150px; height: 6px; background: var(--border-color); border-radius: 4px; overflow: hidden;">
            <div id="statsBar" style="height: 100%; width: 0%; background: var(--accent-primary); transition: width 0.3s ease;"></div>
          </div>
        </div>
        <div style="display: flex; gap: 1rem; align-items: center;">
          <button id="prevDateBtn" class="btn btn-secondary" style="padding: 0.25rem 0.75rem;">&lt;</button>
          <div id="dateDisplay" style="font-weight: 500; font-size: 18px; width: 120px; text-align: center;">${getFormattedDateString(currentDate)}</div>
          <button id="nextDateBtn" class="btn btn-secondary" style="padding: 0.25rem 0.75rem;">&gt;</button>
          <button id="todayBtn" class="btn btn-secondary" style="padding: 0.25rem 0.75rem; font-size: 14px;">Go to Today</button>
        </div>
      </div>
      
      <div style="display: flex; gap: 1rem;">
        <select id="filterMember" class="input" style="width: 150px;">
          <option value="">All Members</option>
        </select>
        <select id="filterFeature" class="input" style="width: 150px;">
          <option value="">All Features</option>
        </select>
        <select id="filterStatus" class="input" style="width: 150px;">
          <option value="">All Statuses</option>
          <option value="TODO">TODO</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
        <button id="addExecutionBtn" class="btn btn-primary">+ Add Execution Point</button>
      </div>
      
    </div>

    <div id="worktoday-list" class="grid-container">
      <div style="text-align: center; color: var(--text-muted); width: 100%;">Loading...</div>
    </div>

    <!-- Modal Template -->
    <div id="executionModal" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <button class="modal-close" id="closeExecutionModal">&times;</button>
        <h2 id="modalTitle" class="section-title">Add Execution Point</h2>
        <form id="executionForm" style="margin-top: 1.5rem;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Execution Point / Task *</label>
            <input type="text" id="execTitle" class="input" required>
          </div>
          <div style="margin-bottom: 1rem; position: relative;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Assigned To</label>
            <div id="execAssigneeBtn" class="input" style="cursor: pointer; display: flex; justify-content: space-between; align-items: center; min-height: 38px;">
              <span id="execAssigneeText">Select Assignees...</span>
              <span style="font-size: 12px; color: var(--text-muted);">▼</span>
            </div>
            <div id="execAssigneeDropdown" style="display: none; position: absolute; top: 100%; left: 0; width: 100%; background: var(--bg-surface); border: 1px solid var(--border-color); border-radius: var(--radius-sm); max-height: 200px; overflow-y: auto; z-index: 100; box-shadow: var(--shadow-md); padding: 0.5rem; flex-direction: column; gap: 0.25rem; margin-top: 4px;">
              <!-- Dynamic Checkboxes -->
            </div>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Feature</label>
            <select id="execFeature" class="input">
              <option value="">None</option>
              <option value="other">Others</option>
            </select>
          </div>
          <div id="customFeatureDiv" style="margin-bottom: 1rem; display: none;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500; color: var(--accent-primary);">Custom Feature Message</label>
            <input type="text" id="execCustomFeature" class="input" placeholder="Type custom message or feature name here...">
          </div>
          <div style="margin-bottom: 1rem; display: flex; gap: 1rem;">
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Status</label>
              <select id="execStatus" class="input">
                <option value="TODO">TODO</option>
                <option value="IN_PROGRESS" selected>IN PROGRESS</option>
                <option value="COMPLETED">COMPLETED</option>
              </select>
            </div>
            <div style="flex: 1;">
              <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Priority</label>
              <select id="execPriority" class="input">
                <option value="LOW">LOW</option>
                <option value="MEDIUM" selected>MEDIUM</option>
                <option value="HIGH">HIGH</option>
              </select>
            </div>
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Update / Notes</label>
            <textarea id="execUpdate" class="input" rows="2"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Save Execution Point</button>
        </form>
      </div>
    </div>
  `;

  // UI Elements
  const prevBtn = container.querySelector('#prevDateBtn');
  const nextBtn = container.querySelector('#nextDateBtn');
  const todayBtn = container.querySelector('#todayBtn');
  const dateDisplay = container.querySelector('#dateDisplay');
  const statsLabel = container.querySelector('#statsLabel');
  const statsBar = container.querySelector('#statsBar');

  const filterMember = container.querySelector('#filterMember');
  const filterFeature = container.querySelector('#filterFeature');
  const filterStatus = container.querySelector('#filterStatus');

  const modal = container.querySelector('#executionModal');
  const addBtn = container.querySelector('#addExecutionBtn');
  const closeBtn = container.querySelector('#closeExecutionModal');
  const form = container.querySelector('#executionForm');
  const featureSelect = container.querySelector('#execFeature');
  const customFeatureDiv = container.querySelector('#customFeatureDiv');
  const modalTitle = container.querySelector('#modalTitle');
  const tbody = container.querySelector('#worktoday-list');

  const execAssigneeBtn = container.querySelector('#execAssigneeBtn');
  const execAssigneeDropdown = container.querySelector('#execAssigneeDropdown');
  const execAssigneeText = container.querySelector('#execAssigneeText');

  execAssigneeBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = execAssigneeDropdown.style.display === 'flex';
    execAssigneeDropdown.style.display = isVisible ? 'none' : 'flex';
  });

  document.addEventListener('click', (e) => {
    if (!execAssigneeBtn.contains(e.target) && !execAssigneeDropdown.contains(e.target)) {
      execAssigneeDropdown.style.display = 'none';
    }
  });

  const updateAssigneeText = () => {
    const checked = Array.from(execAssigneeDropdown.querySelectorAll('.assignee-checkbox:checked'));
    if (checked.length === 0) {
      execAssigneeText.textContent = 'Unassigned';
    } else if (checked.length === 1) {
      execAssigneeText.textContent = checked[0].nextElementSibling.textContent;
    } else {
      execAssigneeText.textContent = `${checked.length} employees selected`;
    }
  };

  // Load Dropdowns once on init for top filters
  const loadFilters = async () => {
    try {
      const token = localStorage.getItem('aotms_token');
      const [resF, resU] = await Promise.all([
        fetch(`${API_BASE_URL}/tasks/features`, { headers: { 'Authorization': 'Bearer ' + token } }),
        fetch(`${API_BASE_URL}/users`, { headers: { 'Authorization': 'Bearer ' + token } })
      ]);
      const features = await resF.json();
      const users = await resU.json();

      features.forEach(f => {
        const opt = document.createElement('option');
        opt.value = f._id;
        opt.textContent = f.title;
        filterFeature.appendChild(opt);
      });
      users.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u._id;
        opt.textContent = u.name;
        filterMember.appendChild(opt);
      });
    } catch (e) { console.error(e); }
  };
  loadFilters();

  // Date Navigation Logic
  const changeDate = (days) => {
    currentDate.setDate(currentDate.getDate() + days);
    dateDisplay.textContent = getFormattedDateString(currentDate);
    fetchData();
  };
  prevBtn.addEventListener('click', () => changeDate(-1));
  nextBtn.addEventListener('click', () => changeDate(1));
  todayBtn.addEventListener('click', () => {
    currentDate = new Date();
    dateDisplay.textContent = getFormattedDateString(currentDate);
    fetchData();
  });

  // Filter Logic
  const applyFiltersAndRender = () => {
    currentMemberFilter = filterMember.value;
    currentFeatureFilter = filterFeature.value;
    currentStatusFilter = filterStatus.value;

    let filtered = allTasksForDay.filter(task => {
      if (task.status === 'COMPLETED') return false; // Hide completed tasks
      if (currentMemberFilter && (!task.assignedTo || !task.assignedTo.some(a => a._id === currentMemberFilter))) return false;
      if (currentFeatureFilter && (!task.feature || task.feature._id !== currentFeatureFilter)) return false;
      if (currentStatusFilter && task.status !== currentStatusFilter) return false;
      return true;
    });

    renderTable(filtered);
  };
  filterMember.addEventListener('change', applyFiltersAndRender);
  filterFeature.addEventListener('change', applyFiltersAndRender);
  filterStatus.addEventListener('change', applyFiltersAndRender);

  // Fetch Logic
  const fetchData = async () => {
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; color: var(--text-muted);">Loading...</td></tr>';
    try {
      const token = localStorage.getItem('aotms_token');
      const dateStr = getApiDateString(currentDate);
      
      const [epRes, tasksRes, todosRes] = await Promise.all([
        fetch(`${API_BASE_URL}/tasks?type=EXECUTION_POINT&date=${dateStr}`, { headers: { 'Authorization': 'Bearer ' + token } }),
        fetch(`${API_BASE_URL}/tasks`, { headers: { 'Authorization': 'Bearer ' + token } }),
        fetch(`${API_BASE_URL}/todos`, { headers: { 'Authorization': 'Bearer ' + token } })
      ]);
      
      const epData = await epRes.json();
      const allTasks = await tasksRes.json();
      const allTodos = await todosRes.json();

      const inProgressWork = [
        ...allTasks,
        ...allTodos
      ].filter(item => item.status === 'IN_PROGRESS');

      const combined = [...epData, ...inProgressWork];
      const uniqueMap = new Map();
      combined.forEach(item => {
        if (!uniqueMap.has(item._id)) {
          uniqueMap.set(item._id, item);
        }
      });
      allTasksForDay = Array.from(uniqueMap.values());
      
      // Update Stats
      const total = allTasksForDay.length;
      const completed = allTasksForDay.filter(t => t.status === 'COMPLETED').length;
      const pct = total === 0 ? 0 : Math.round((completed / total) * 100);
      statsLabel.textContent = `${dateStr === getApiDateString(new Date()) ? "Today's" : "Day's"} Progress: ${completed}/${total} Completed (${pct}%)`;
      statsBar.style.width = `${pct}%`;
      statsBar.style.background = pct === 100 ? '#10b981' : 'var(--accent-primary)'; // Green if 100%

      applyFiltersAndRender();
    } catch (err) {
      console.error(err);
    }
  };

  const renderTable = (tasks) => {
    tbody.innerHTML = '';
    if (tasks.length === 0) {
      tbody.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">No execution points found.</div>';
      return;
    }

    const svgEye = `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="cursor: pointer; vertical-align: middle; margin-right: 4px;"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle></svg>`;

    tasks.forEach(task => {
      let badgeClass = 'badge-todo';
      let statusText = 'TODO';
      let cardStyle = '';
      
      if (task.status === 'IN_PROGRESS') { badgeClass = 'badge-inprogress'; statusText = 'IN PROGRESS'; }
      else if (task.status === 'COMPLETED') { 
        badgeClass = 'badge-completed'; 
        statusText = 'COMPLETED'; 
        cardStyle = 'opacity: 0.6; filter: grayscale(1);';
      }
      else if (task.status === 'BLOCKED') { badgeClass = 'badge-blocked'; statusText = 'BLOCKED'; }

      let displayFeature = task.feature ? task.feature.title : '-';
      let displayDesc = task.description || '-';
      if (!task.feature && displayDesc.includes('[Custom Feature:')) {
        const match = displayDesc.match(/\\[Custom Feature: (.*?)\\]/);
        if (match) {
          displayFeature = match[1] + ' (Custom)';
          displayDesc = displayDesc.replace(match[0], '').trim();
          if (!displayDesc) displayDesc = '-';
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
      if (cardStyle) card.style = cardStyle;
      
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title" style="font-size: 18px;">${task.title}</h3>
          <div style="display: flex; gap: -8px;">${avatarsHtml}</div>
        </div>
        <div class="card-body">
          <p class="metadata" style="margin-bottom: 0.5rem;">Feature: <span style="color: var(--text-primary);">${displayFeature}</span></p>
          <div style="display: flex; gap: 0.5rem; flex-wrap: wrap; margin-bottom: 1rem;">
            <span class="badge ${badgeClass}">${statusText}</span>
          </div>
          <div style="display: flex; align-items: center; gap: 0.5rem; margin-bottom: 1rem;">
            <div style="flex: 1; height: 6px; background: var(--border-color); border-radius: var(--radius-sm); overflow: hidden;">
              <div style="height: 100%; width: ${task.status === 'COMPLETED' ? 100 : 50}%; background: ${task.status === 'COMPLETED' ? '#9ca3af' : 'var(--accent-primary)'};"></div>
            </div>
            <span class="metadata">${task.status === 'COMPLETED' ? '100%' : '50%'}</span>
          </div>
          <div style="background: var(--bg-surface); padding: 0.5rem; border-radius: var(--radius-sm); border: 1px solid var(--border-color);">
            <div class="update-reveal-btn" style="color: var(--accent-primary); cursor: pointer; display: flex; align-items: center;">
              ${svgEye} <span style="font-size: 13px; font-weight: 500;">View Update</span>
            </div>
            <div class="update-text" style="display: none; margin-top: 8px; font-size: 13px; color: var(--text-secondary); white-space: pre-wrap;">${displayDesc}</div>
          </div>
        </div>
        <div class="card-footer">
          <span class="metadata"></span>
          <button class="btn btn-secondary edit-btn" style="padding: 0.25rem 0.5rem; font-size: 12px;">Edit</button>
        </div>
      `;
      
      const revealBtn = card.querySelector('.update-reveal-btn');
      const updateText = card.querySelector('.update-text');
      revealBtn.addEventListener('click', () => {
        updateText.style.display = updateText.style.display === 'none' ? 'block' : 'none';
      });
      
      const editBtn = card.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => {
        container.openEditModal(task);
      });
      
      tbody.appendChild(card);
    });
  };

  // Modal / Edit Form Logic below
  const loadFormDropdowns = async () => {
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
      execAssigneeDropdown.innerHTML = '';
      users.forEach(u => {
        const label = document.createElement('label');
        label.style = 'display: flex; align-items: center; gap: 0.5rem; cursor: pointer; padding: 0.5rem; border-radius: var(--radius-sm); transition: background 0.2s;';
        label.onmouseover = () => label.style.background = 'var(--bg-primary)';
        label.onmouseout = () => label.style.background = 'transparent';
        
        label.innerHTML = `<input type="checkbox" value="${u._id}" class="assignee-checkbox" style="cursor: pointer;"><span>${u.name}</span>`;
        
        label.querySelector('.assignee-checkbox').addEventListener('change', updateAssigneeText);
        
        execAssigneeDropdown.appendChild(label);
      });
      updateAssigneeText();
    } catch (e) { console.error(e); }
  };

  featureSelect.addEventListener('change', (e) => {
    customFeatureDiv.style.display = e.target.value === 'other' ? 'block' : 'none';
  });

  addBtn.addEventListener('click', async () => {
    editingTaskId = null;
    modalTitle.textContent = "Add Execution Point";
    form.reset();
    customFeatureDiv.style.display = 'none';
    await loadFormDropdowns();
    modal.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  container.openEditModal = async (taskData) => {
    editingTaskId = taskData._id;
    modalTitle.textContent = "Edit Execution Point";
    form.reset();
    await loadFormDropdowns();

    form.querySelector('#execTitle').value = taskData.title || '';
    form.querySelector('#execStatus').value = taskData.status || 'TODO';
    form.querySelector('#execPriority').value = taskData.priority || 'MEDIUM';
    
    // Clear selections first
    Array.from(execAssigneeDropdown.querySelectorAll('.assignee-checkbox')).forEach(cb => cb.checked = false);
    if (taskData.assignedTo && taskData.assignedTo.length > 0) {
      const assignedIds = taskData.assignedTo.map(a => a._id);
      Array.from(execAssigneeDropdown.querySelectorAll('.assignee-checkbox')).forEach(cb => {
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
        form.querySelector('#execCustomFeature').value = match[1];
        rawDesc = rawDesc.replace(match[0], '').trim();
      }
    } else if (taskData.feature && taskData.feature._id) {
      featureSelect.value = taskData.feature._id;
      customFeatureDiv.style.display = 'none';
    } else {
      featureSelect.value = "";
      customFeatureDiv.style.display = 'none';
    }
    
    form.querySelector('#execUpdate').value = rawDesc;
    modal.style.display = 'flex';
  };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const token = localStorage.getItem('aotms_token');
    
    let descriptionText = form.querySelector('#execUpdate').value;
    const featureId = form.querySelector('#execFeature').value;
    const customFeatureText = form.querySelector('#execCustomFeature').value;

    if (featureId === 'other' && customFeatureText) {
      descriptionText = `[Custom Feature: ${customFeatureText}] \n` + descriptionText;
    }

    const body = {
      title: form.querySelector('#execTitle').value,
      priority: form.querySelector('#execPriority').value,
      status: form.querySelector('#execStatus').value,
      description: descriptionText,
      type: 'EXECUTION_POINT'
    };
    
    if (featureId && featureId !== 'other') body.feature = featureId;
    else if (featureId === '') body.feature = null; 

    const assigneeCheckboxes = Array.from(execAssigneeDropdown.querySelectorAll('.assignee-checkbox:checked'));
    const assigneeIds = assigneeCheckboxes.map(cb => cb.value).filter(val => val !== "");
    
    if (assigneeIds.length > 0) body.assignedTo = assigneeIds;
    else body.assignedTo = [];

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
      fetchData(); // re-fetch current date
    } catch (err) {
      console.error(err);
    }
  });

  // Initial load
  fetchData();

  return container;
}
