import { API_BASE_URL } from '../config.js';
export function renderTeamMembers() {
  const container = document.createElement('div');
  
  let allMembers = [];
  let currentRoleFilter = "";

  container.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem;">
      <div style="display: flex; gap: 1rem;">
        <input type="text" id="searchMember" class="input" placeholder="Search by name or email..." style="width: 250px;">
        <select id="filterRole" class="input" style="width: 150px;">
          <option value="">All Roles</option>
          <option value="ADMIN">ADMIN</option>
          <option value="MANAGER">MANAGER</option>
          <option value="TEAM_MEMBER">TEAM MEMBER</option>
        </select>
      </div>
      <button class="btn btn-secondary" style="background-color: var(--card-bg); color: var(--text-primary); border-color: var(--border-color);" disabled>Invite Member (Coming Soon)</button>
    </div>

    <div id="members-list" class="grid-container">
      <div style="text-align: center; color: var(--text-muted); width: 100%;">Loading...</div>
    </div>

    <!-- Manage Role Modal -->
    <div id="roleModal" class="modal-overlay" style="display: none;">
      <div class="modal-content">
        <button class="modal-close" id="closeRoleModal">&times;</button>
        <h2 class="section-title">Manage Team Member</h2>
        <form id="roleForm" style="margin-top: 1.5rem;">
          <input type="hidden" id="editMemberId">
          <div style="margin-bottom: 1rem;">
            <p class="metadata" id="editMemberName" style="font-size: 14px; margin-bottom: 1rem;"></p>
            <label style="display: block; margin-bottom: 0.25rem; font-weight: 500;">Role *</label>
            <select id="editMemberRole" class="input" required>
              <option value="EMPLOYEE">EMPLOYEE</option>
              <option value="ADMIN">ADMIN</option>
            </select>
          </div>
          <button type="submit" class="btn btn-primary" style="width: 100%;">Update Role</button>
        </form>
      </div>
    </div>
  `;

  const searchInput = container.querySelector('#searchMember');
  const filterRole = container.querySelector('#filterRole');

  const modal = container.querySelector('#roleModal');
  const closeBtn = container.querySelector('#closeRoleModal');
  const form = container.querySelector('#roleForm');
  const tbody = container.querySelector('#members-list');

  const applyFiltersAndRender = () => {
    currentRoleFilter = filterRole.value;
    const searchTerm = searchInput.value.toLowerCase();

    let filtered = allMembers.filter(m => {
      if (currentRoleFilter && m.role !== currentRoleFilter) return false;
      if (searchTerm && !(m.name.toLowerCase().includes(searchTerm) || m.email.toLowerCase().includes(searchTerm))) return false;
      return true;
    });

    renderTable(filtered);
  };

  searchInput.addEventListener('input', applyFiltersAndRender);
  filterRole.addEventListener('change', applyFiltersAndRender);

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
  });

  container.openRoleModal = (member) => {
    container.querySelector('#editMemberId').value = member._id;
    container.querySelector('#editMemberName').textContent = `Editing role for ${member.name} (${member.email})`;
    container.querySelector('#editMemberRole').value = member.role || 'EMPLOYEE';
    modal.style.display = 'flex';
  };

  container.deleteMember = async (id) => {
    if (!confirm('Are you absolutely sure you want to remove this team member from the system? This cannot be undone.')) return;
    try {
      const token = localStorage.getItem('aotms_token');
      await fetch(`${API_BASE_URL}/users/${id}`, {
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
    const id = container.querySelector('#editMemberId').value;
    const role = container.querySelector('#editMemberRole').value;

    try {
      const res = await fetch(`${API_BASE_URL}/users/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer ' + token
        },
        body: JSON.stringify({ role })
      });
      
      if (res.ok) {
        modal.style.display = 'none';
        form.reset();
        fetchData();
      } else {
        const error = await res.json();
        alert("Failed to update role: " + (error.error || "Unknown error"));
      }
    } catch (err) {
      console.error(err);
      alert("Network error updating role.");
    }
  });

  const fetchData = async () => {
    tbody.innerHTML = '<tr><td colspan="5" style="text-align: center; color: var(--text-muted);">Loading...</td></tr>';
    try {
      const token = localStorage.getItem('aotms_token');
      const res = await fetch(`${API_BASE_URL}/users`, {
        headers: { 'Authorization': 'Bearer ' + token }
      });
      allMembers = await res.json();
      applyFiltersAndRender();
    } catch (err) {
      console.error(err);
    }
  };

  const renderTable = (members) => {
    tbody.innerHTML = '';
    if (members.length === 0) {
      tbody.innerHTML = '<div style="text-align: center; color: var(--text-muted); width: 100%;">No team members found.</div>';
      return;
    }

    members.forEach(u => {
      let roleBadge = 'badge-todo';
      if (u.role === 'ADMIN') roleBadge = 'badge-blocked';
      else if (u.role === 'EMPLOYEE') roleBadge = 'badge-inprogress';

      const d = new Date(u.createdAt || Date.now());
      const initials = u.name ? u.name.substring(0,2).toUpperCase() : '??';
      
      const card = document.createElement('div');
      card.className = 'card';
      card.innerHTML = `
        <div class="card-header">
          <h3 class="card-title" style="font-size: 18px;">${u.name}</h3>
          <div class="avatar" title="${u.name}">${initials}</div>
        </div>
        <div class="card-body">
          <p class="body-text" style="margin-bottom: 0.5rem;">${u.email}</p>
          <span class="badge ${roleBadge}">${u.role.replace('_', ' ')}</span>
        </div>
        <div class="card-footer">
          <span class="metadata">Joined ${d.toLocaleDateString()}</span>
          <div style="display: flex; gap: 0.5rem;">
            <button class="btn btn-secondary edit-btn" style="padding: 0.25rem 0.5rem; font-size: 12px;" title="Manage Role">⚙️</button>
            <button class="btn btn-secondary del-btn" style="padding: 0.25rem 0.5rem; font-size: 12px; color: #ef4444; border-color: #fca5a5;" title="Remove">🗑️</button>
          </div>
        </div>
      `;
      
      const editBtn = card.querySelector('.edit-btn');
      editBtn.addEventListener('click', () => container.openRoleModal(u));

      const delBtn = card.querySelector('.del-btn');
      delBtn.addEventListener('click', () => container.deleteMember(u._id));
      
      tbody.appendChild(card);
    });
  };

  fetchData();

  return container;
}
