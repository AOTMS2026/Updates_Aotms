import { API_BASE_URL } from '../config.js';
export function renderIssueDetail(issueId) {
  const container = document.createElement('div');
  
  container.innerHTML = `
    <div id="issue-header" style="margin-bottom: 2rem;">
      <h1 class="page-title">Loading Issue...</h1>
    </div>

    <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 2rem;">
      <div>
        <div class="card" style="margin-bottom: 2rem;">
          <h3 class="card-title">Description</h3>
          <p class="body-text" id="issue-desc" style="margin-top: 1rem;"></p>
        </div>

        <div class="card">
          <h3 class="card-title">Timeline</h3>
          <div id="issue-timeline" style="margin-top: 1.5rem; display: flex; flex-direction: column; gap: 1rem;">
          </div>
          
          <div style="margin-top: 2rem; border-top: 1px solid var(--border-color); padding-top: 1.5rem;">
            <select id="update-status" class="input" style="margin-bottom: 1rem; width: 200px;">
              <option value="">Don't change status</option>
              <option value="OPEN">OPEN</option>
              <option value="IN_PROGRESS">IN PROGRESS</option>
              <option value="BLOCKED">BLOCKED</option>
              <option value="RESOLVED">RESOLVED</option>
              <option value="CLOSED">CLOSED</option>
            </select>
            <textarea id="update-text" class="input" placeholder="Write an update..." rows="3" style="margin-bottom: 1rem; resize: vertical;"></textarea>
            <button id="add-comment-btn" class="btn btn-primary">Add Update</button>
          </div>
        </div>
      </div>

      <div>
        <div class="card">
          <h3 class="card-title">Details</h3>
          <ul style="list-style: none; margin-top: 1rem; display: flex; flex-direction: column; gap: 1rem;">
            <li style="display: flex; justify-content: space-between;">
              <span class="metadata">Status</span>
              <span id="issue-status" class="badge"></span>
            </li>
            <li style="display: flex; justify-content: space-between;">
              <span class="metadata">Priority</span>
              <span id="issue-priority" class="body-text"></span>
            </li>
            <li style="display: flex; justify-content: space-between;">
              <span class="metadata">Severity</span>
              <span id="issue-severity" class="body-text"></span>
            </li>
            <li style="display: flex; justify-content: space-between;">
              <span class="metadata">Assigned</span>
              <span id="issue-assigned" class="body-text"></span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  `;

  fetchIssueData(container, issueId);

  return container;
}

async function fetchIssueData(container, id) {
  try {
    const token = localStorage.getItem('aotms_token');
    const res = await fetch(`${API_BASE_URL}/issues/${id}`, {
      headers: { 'Authorization': 'Bearer ' + token }
    });
    
    if (!res.ok) {
      container.innerHTML = '<h2 class="section-title">Issue not found</h2>';
      return;
    }

    const issue = await res.json();
    
    container.querySelector('h1').textContent = `# ${issue.title}`;
    container.querySelector('#issue-desc').textContent = issue.description || 'No description provided.';
    
    const statusSpan = container.querySelector('#issue-status');
    statusSpan.textContent = issue.status.replace('_', ' ');
    if (issue.status === 'IN_PROGRESS') statusSpan.className = 'badge badge-inprogress';
    else if (issue.status === 'RESOLVED' || issue.status === 'CLOSED') statusSpan.className = 'badge badge-completed';
    else if (issue.status === 'BLOCKED') statusSpan.className = 'badge badge-blocked';
    else statusSpan.className = 'badge badge-todo';

    container.querySelector('#issue-priority').textContent = issue.priority;
    container.querySelector('#issue-severity').textContent = issue.severity;
    container.querySelector('#issue-assigned').textContent = issue.assignedTo ? issue.assignedTo.name : 'Unassigned';

    const timelineContainer = container.querySelector('#issue-timeline');
    timelineContainer.innerHTML = '';
    issue.timeline.forEach(event => {
      const el = document.createElement('div');
      el.innerHTML = `
        <div class="metadata" style="margin-bottom: 2px;">${new Date(event.date).toLocaleString()}</div>
        <div class="body-text"><strong>${event.user ? event.user.name : 'System'}</strong>: ${event.action}</div>
      `;
      timelineContainer.appendChild(el);
    });

    const commentBtn = container.querySelector('#add-comment-btn');
    commentBtn.onclick = async () => {
      const text = container.querySelector('#update-text').value;
      const newStatus = container.querySelector('#update-status').value;
      
      if (!text && !newStatus) return;

      const body = { action: text || `Changed status to ${newStatus}` };
      if (newStatus) body.status = newStatus;

      try {
        await fetch(`${API_BASE_URL}/issues/${id}/timeline`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body: JSON.stringify(body)
        });
        container.querySelector('#update-text').value = '';
        container.querySelector('#update-status').value = '';
        fetchIssueData(container, id); // reload
      } catch (e) {
        console.error(e);
      }
    };

  } catch (err) {
    console.error(err);
  }
}
