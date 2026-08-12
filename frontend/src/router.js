import { renderLogin } from './pages/Login.js';
import { renderDashboard } from './pages/Dashboard.js';
import { renderSidebar, renderTopHeader } from './components/Sidebar.js';
import { renderWorkToday } from './pages/WorkToday.js';
import { renderTasks } from './pages/Tasks.js';
import { renderFeatures } from './pages/Features.js';
import { renderTodo } from './pages/Todo.js';
import { renderIssues } from './pages/Issues.js';
import { renderIssueDetail } from './pages/IssueDetail.js';
import { renderReminders } from './pages/Reminders.js';
import { renderTeamMembers } from './pages/TeamMembers.js';
import { renderReports } from './pages/Reports.js';
import { renderSettings } from './pages/Settings.js';
import { renderLanding } from './pages/Landing.js';

export function initRouter() {
  const app = document.getElementById('app');

  const navigate = () => {
    const path = window.location.hash || '#/';
    app.innerHTML = ''; // Clear current view

    // Check auth
    const token = localStorage.getItem('aotms_token');
    let userRole = 'EMPLOYEE';
    try {
      const storedUser = localStorage.getItem('aotms_user');
      if (storedUser && storedUser !== 'undefined') {
        userRole = JSON.parse(storedUser).role;
      }
    } catch (e) {}
    
    // Public routes that don't need auth
    if (path === '#/landing') {
      app.appendChild(renderLanding());
      return;
    }

    if (!token && path !== '#/login') {
      window.location.hash = '#/landing'; // Default to landing if not logged in
      return;
    }

    if (token && path === '#/login') {
      window.location.hash = '#/';
      return;
    }

    // Route Guards for Employees
    const isEmployee = !userRole || userRole.toUpperCase() === 'EMPLOYEE';
    if (isEmployee && (path === '#/team' || path === '#/settings')) {
      window.location.hash = '#/';
      return;
    }

    if (path === '#/login') {
      app.appendChild(renderLogin());
    } else {
      // Main layout with sidebar and top header
      const sidebar = renderSidebar();
      
      const mainWrapper = document.createElement('div');
      mainWrapper.className = 'main-wrapper';
      
      let pageTitle = 'Dashboard';
      if (path === '#/work/today') pageTitle = "Today's Work";
      else if (path === '#/work/tasks') pageTitle = "Tasks";
      else if (path === '#/work/features') pageTitle = "Features";
      else if (path === '#/work/todo') pageTitle = "TODO";
      else if (path === '#/tracking/issues') pageTitle = "Issues";
      else if (path.startsWith('#/tracking/issues/')) pageTitle = "Issue Detail";
      else if (path === '#/tracking/reminders') pageTitle = "Reminders";
      else if (path === '#/team') pageTitle = "Team Members";
      else if (path === '#/work/reports') pageTitle = "Reports";
      else if (path === '#/settings') pageTitle = "Settings";
      
      const topHeader = renderTopHeader(pageTitle);
      
      const mainContent = document.createElement('main');
      mainContent.className = 'main-content animate-fade-in';
      
      mainWrapper.appendChild(topHeader);
      mainWrapper.appendChild(mainContent);
      
      app.appendChild(sidebar);
      app.appendChild(mainWrapper);

      if (path === '#/') {
        mainContent.appendChild(renderDashboard());
      } else if (path === '#/work/today') {
        mainContent.appendChild(renderWorkToday());
      } else if (path === '#/work/tasks') {
        mainContent.appendChild(renderTasks());
      } else if (path === '#/work/features') {
        mainContent.appendChild(renderFeatures());
      } else if (path === '#/work/todo') {
        mainContent.appendChild(renderTodo());
      } else if (path === '#/tracking/issues') {
        mainContent.appendChild(renderIssues());
      } else if (path.startsWith('#/tracking/issues/')) {
        const id = path.split('/')[3];
        mainContent.appendChild(renderIssueDetail(id));
      } else if (path === '#/tracking/reminders') {
        mainContent.appendChild(renderReminders());
      } else if (path === '#/team') {
        mainContent.appendChild(renderTeamMembers());
      } else if (path === '#/work/reports') {
        mainContent.appendChild(renderReports());
      } else if (path === '#/settings') {
        mainContent.appendChild(renderSettings());
      } else {
        mainContent.innerHTML = '<div style="display:flex; justify-content:center; padding: 4rem; color: var(--text-muted);">Page under construction</div>';
      }
      
      // Update active sidebar link
      const links = sidebar.querySelectorAll('.sidebar-link');
      links.forEach(link => {
        link.classList.remove('active');
        // Match exact or startsWith for nested routes
        const linkHref = link.getAttribute('href');
        if (linkHref === path || (linkHref !== '#/' && path.startsWith(linkHref))) {
          link.classList.add('active');
        }
      });
    }
  };

  window.addEventListener('hashchange', navigate);
  navigate(); // Initial route
}
