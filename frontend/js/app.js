/**
 * StateFest - Shared Application & Auth Client Utilities
 */

const API_BASE = window.location.origin.includes('5000')
  ? '/api'
  : 'http://localhost:5000/api';

// Auth State Helper
const Auth = {
  getToken() {
    return localStorage.getItem('statefest_token');
  },
  getUser() {
    const raw = localStorage.getItem('statefest_user');
    try {
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  },
  setSession(token, user) {
    localStorage.setItem('statefest_token', token);
    localStorage.setItem('statefest_user', JSON.stringify(user));
  },
  clearSession() {
    localStorage.removeItem('statefest_token');
    localStorage.removeItem('statefest_user');
  },
  isLoggedIn() {
    return !!this.getToken();
  },
  isAdmin() {
    const user = this.getUser();
    return user && user.role === 'admin';
  },
  isStudent() {
    const user = this.getUser();
    return user && user.role === 'student';
  },
  logout() {
    this.clearSession();
    showToast('Logged out successfully.', 'info');
    setTimeout(() => {
      window.location.href = 'index.html';
    }, 600);
  }
};

// UI Toast Notification
function showToast(message, type = 'success') {
  let container = document.getElementById('statefestAlertContainer');
  if (!container) {
    container = document.createElement('div');
    container.id = 'statefestAlertContainer';
    container.className = 'statefest-alert-container';
    document.body.appendChild(container);
  }

  const alertDiv = document.createElement('div');
  const alertClass = type === 'error' ? 'alert-danger' : type === 'info' ? 'alert-primary' : 'alert-success';
  const icon = type === 'error' ? 'fa-circle-exclamation' : type === 'info' ? 'fa-circle-info' : 'fa-circle-check';

  alertDiv.className = `alert ${alertClass} alert-dismissible fade show shadow-md d-flex align-items-center gap-2 mb-2`;
  alertDiv.setAttribute('role', 'alert');
  alertDiv.innerHTML = `
    <i class="fa-solid ${icon}"></i>
    <div class="flex-grow-1">${message}</div>
    <button type="button" class="btn-close ms-2" data-bs-dismiss="alert" aria-label="Close"></button>
  `;

  container.appendChild(alertDiv);

  setTimeout(() => {
    alertDiv.classList.remove('show');
    setTimeout(() => alertDiv.remove(), 250);
  }, 4500);
}

// Formatters
function formatDate(dateStr) {
  if (!dateStr) return 'TBA';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });
}

function formatCurrency(amount) {
  if (amount === 0 || amount === '0') return 'FREE';
  return `₹${Number(amount).toLocaleString('en-IN')}`;
}

// Dynamic Navigation Bar Updater
function updateNavbar() {
  const navContainer = document.getElementById('navbarAuthSection');
  if (!navContainer) return;

  const user = Auth.getUser();

  if (user) {
    const dashboardLink = user.role === 'admin' ? 'admin-dashboard.html' : 'student-dashboard.html';
    const roleBadge = user.role === 'admin'
      ? '<span class="badge bg-danger ms-1">Admin</span>'
      : '<span class="badge bg-primary ms-1">Student</span>';

    navContainer.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <a href="${dashboardLink}" class="btn btn-statefest-outline btn-sm">
          <i class="fa-solid fa-gauge me-1"></i> Dashboard
        </a>
        <div class="dropdown">
          <button class="btn btn-outline-light btn-sm dropdown-toggle d-flex align-items-center gap-2" type="button" data-bs-reset="dropdown" data-bs-toggle="dropdown" aria-expanded="false">
            <i class="fa-solid fa-user-circle"></i>
            <span>${user.name.split(' ')[0]}</span>
            ${roleBadge}
          </button>
          <ul class="dropdown-menu dropdown-menu-end shadow">
            <li><h6 class="dropdown-header text-truncate" style="max-width: 200px;">${user.email}</h6></li>
            <li><a class="dropdown-item" href="${dashboardLink}"><i class="fa-solid fa-columns me-2"></i>Dashboard</a></li>
            ${user.role === 'student' ? '<li><a class="dropdown-item" href="student-dashboard.html#registrations"><i class="fa-solid fa-ticket me-2"></i>My Registrations</a></li>' : ''}
            <li><hr class="dropdown-divider"></li>
            <li><a class="dropdown-item text-danger" href="javascript:void(0)" onclick="Auth.logout()"><i class="fa-solid fa-arrow-right-from-bracket me-2"></i>Logout</a></li>
          </ul>
        </div>
      </div>
    `;
  } else {
    navContainer.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <a href="login.html" class="btn btn-statefest-outline btn-sm">Login</a>
        <a href="register.html" class="btn btn-statefest-primary btn-sm">Register</a>
      </div>
    `;
  }

  // Active link highlighter
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.navbar-nav .nav-link').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

document.addEventListener('DOMContentLoaded', () => {
  updateNavbar();
});
