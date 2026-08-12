import { API_BASE_URL } from '../config.js';
export function renderFeatures() {
  const container = document.createElement('div');
  
  let editingFeatureId = null;
  let allFeatures = [];
  
  let currentStatusFilter = "";

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem;">
        <input type="text" id="searchFeature" class="input" placeholder="Search features..." style="width: 250px;">
        <select id="filterStatus" class="input" style="width: 150px;">
          <option value="">All Statuses</option>
          <option value="PLANNED">PLANNED</option>
          <option value="IN_PROGRESS">IN PROGRESS</option>
          <option value="COMPLETED">COMPLETED</option>
        </select>
      </div>
      <button id="addFeatureBtn" class="btn btn-primary">+ New Feature</button>
    </div>

    <div id="features-list" class="grid-container">
      <div style="text-align: center; color: var(--text-muted); width: 100%;">Loading...</div>
    </div>

    <!-- Modal Template -->
    <div id="featureModal" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <button class="modal-close" id="closeFeatureModal">&times;</button>
        <h2 id="modalTitle" class="section-title">New Feature</h2>
        <form id="featureForm" style="margin-top: 1.5rem;">
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Title *</label>
            <input type="text" id="featureTitle" class="input" required>
          </div>
          <div style="margin-bottom: 1rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Status</label>
            <select id="featureStatus" class="input">
              <option value="PLANNED" selected>PLANNED</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="COMPLETED">COMPLETED</option>
            </select>
          </div>
          <div style="margin-bottom: 1.5rem;">
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Description</label>
            <textarea id="featureDesc" class="input" rows="3"></textarea>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Save Feature</button>
        </form>
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#searchFeature');
  const filterStatus = container.querySelector('#filterStatus');

  const modal = container.querySelector('#featureModal');
  const addBtn = container.querySelector('#addFeatureBtn');
  const closeBtn = container.querySelector('#closeFeatureModal');
  const form = container.querySelector('#featureForm');
  const modalTitle = container.querySelector('#modalTitle');
  const tbody = container.querySelector('#features-list');

  const applyFiltersAndRender = () => {
    currentStatusFilter = filterStatus.value;
    const searchTerm = searchInput.value.toLowerCase();

    let filtered = allFeatures.filter(f => {
      if (currentStatusFilter && f.status !== currentStatusFilter) return false;
      if (searchTerm && !f.title.toLowerCase().includes(searchTerm)) return false;
      return true;
    });

    renderTable(filtered);
  };

  searchInput.addEventListener('input', applyFiltersAndRender);
  filterStatus.addEventListener('change', applyFiltersAndRender);

  addBtn.addEventListener('click', () => {
    editingFeatureId = null;
    modalTitle.textContent = "New Feature";
    form.reset();
    modal.style.display = 'flex';
  });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  container.openEditModal = (featureData) => {
    editingFeatureId = featureData._id;
    modalTitle.textContent = "Edit Feature";
    form.reset();
    
    form.querySelector('#featureTitle').value = featureData.title || '';
    form.querySelector('#featureStatus').value = featureData.status || 'PLANNED';
    form.querySelector('#featureDesc').value = featureData.description || '';
    
    modal.style.display = 'flex';
  };

  container.deleteFeature = async (id) => {
    if (!confirm('Are you sure you want to delete this feature?')) return;
    try {
      const token = localStorage.getItem('aotms_token');
      await fetch(`${API_BASE_URL}/tasks/features/${id}`, {
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
      title: form.querySelector('#featureTitle').value,
      status: form.querySelector('#featureStatus').value,
      description: form.querySelector('#featureDesc').value
    };

    try {
      const url = editingFeatureId ? `${API_BASE_URL}/tasks/features/${editingFeatureId}` : `${API_BASE_URL}/tasks/features`;
      const method = editingFeatureId ? 'PUT' : 'POST';

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
      editingFeatureId = null;
      fetchData();
    } catch (err) {
      console.error(err);
    }
  });

  const fetchData = async () => {
    tbody.innerHTML = '<tr><td colspan="4" style="text-align: center; color: var(--text-muted);">Loading...</td></tr>';
    try {
      const token = localStorage.getItem('aotms_token');
      const res = await fetch(`${API_BASE_URL}/tasks/features`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      allFeatures = await res.json();
      applyFiltersAndRender();
    } catch (err) {
      console.error(err);
    }
  };

  const renderTable = (features) => {
    tbody.innerHTML = '';
    if (features.length === 0) {
      tbody.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">No features found.</div>';
      return;
    }

    features.forEach(f => {
      let badgeClass = 'badge-todo';
      let statusText = 'PLANNED';
      let cardStyle = '';
      
      if (f.status === 'IN_PROGRESS') { badgeClass = 'badge-inprogress'; statusText = 'IN PROGRESS'; }
      else if (f.status === 'COMPLETED') { 
        badgeClass = 'badge-completed'; 
        statusText = 'COMPLETED'; 
        cardStyle = 'opacity: 0.6; filter: grayscale(1);';
      }

      const card = document.createElement('div');
      card.className = 'card';
      if (cardStyle) card.style = cardStyle;
      
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title" style="font-size: 18px;">${f.title}</h3>
          <div class="avatar" title="System Feature" style="background: var(--bg-surface); border-color: var(--border-color); color: var(--text-secondary);">SYS</div>
        </div>
        <div class="card-body">
          <p class="body-text" style="margin-bottom: 1rem; white-space: pre-wrap;">${f.description || 'No description provided'}</p>
          <span class="badge ${badgeClass}">${statusText}</span>
        </div>
        <div class="card-footer">
          <span class="metadata"></span>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary edit-btn" style="padding: 0.25rem 0.5rem; font-size: 12px;">Edit</button>
            <button class="btn btn-secondary del-btn" style="padding: 0.25rem 0.5rem; font-size: 12px; color: #ef4444; border-color: #fca5a5;">Delete</button>
          </div>
        </div>
      `;
      
      const editBtn = card.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => container.openEditModal(f));

      const delBtn = card.querySelector('.del-btn');
      delBtn.addEventListener('click', () => container.deleteFeature(f._id));
      
      tbody.appendChild(card);
    });
  };

  fetchData();

  return container;
}
