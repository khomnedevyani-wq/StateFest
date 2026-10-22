/**
 * StateFest - Admin Dashboard JavaScript
 */

let adminEventsList = [];
let adminRegistrationsList = [];
let adminStudentsList = [];

document.addEventListener('DOMContentLoaded', () => {
  // Check Admin Authorization
  if (!Auth.isLoggedIn()) {
    showToast('Please login as administrator to access the admin panel.', 'error');
    window.location.href = 'login.html';
    return;
  }

  if (!Auth.isAdmin()) {
    showToast('Access denied: Administrator privileges required.', 'error');
    window.location.href = 'student-dashboard.html';
    return;
  }

  loadAdminStats();
  loadAdminEvents();
  loadAdminRegistrations();
  loadAdminStudents();
  loadContactMessages();

  // Attach Create/Edit Event Form Handlers
  const createEventForm = document.getElementById('createEventForm');
  if (createEventForm) createEventForm.addEventListener('submit', handleCreateEvent);

  const editEventForm = document.getElementById('editEventForm');
  if (editEventForm) editEventForm.addEventListener('submit', handleUpdateEvent);

  // Search in registrations
  const regSearchInput = document.getElementById('adminRegSearch');
  if (regSearchInput) {
    regSearchInput.addEventListener('input', debounce(() => {
      filterRegistrationsTable();
    }, 250));
  }

  const regStatusFilter = document.getElementById('adminRegStatusFilter');
  if (regStatusFilter) {
    regStatusFilter.addEventListener('change', () => {
      filterRegistrationsTable();
    });
  }

  // Student Search
  const studentSearchInput = document.getElementById('adminStudentSearch');
  if (studentSearchInput) {
    studentSearchInput.addEventListener('input', debounce(() => {
      filterStudentsTable();
    }, 250));
  }
});

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

// 1. Load Stats
async function loadAdminStats() {
  try {
    const res = await fetch(`${API_BASE}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
    });
    const data = await res.json();

    if (res.ok && data.success) {
      document.getElementById('statTotalEvents').innerText = data.stats.totalEvents;
      document.getElementById('statTotalStudents').innerText = data.stats.totalStudents;
      document.getElementById('statTotalRegistrations').innerText = data.stats.totalRegistrations;
      document.getElementById('statTotalColleges').innerText = data.stats.participatingColleges;
    }
  } catch (err) {
    console.error('Error fetching admin stats:', err);
  }
}

// 2. Load Events List
async function loadAdminEvents() {
  const tableBody = document.getElementById('adminEventsTableBody');
  if (!tableBody) return;

  try {
    const res = await fetch(`${API_BASE}/events?sort=date_asc`);
    const data = await res.json();

    if (res.ok && data.success) {
      adminEventsList = data.events;
      renderAdminEventsTable(data.events, tableBody);
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Failed to load events.</td></tr>`;
  }
}

function renderAdminEventsTable(events, container) {
  if (events.length === 0) {
    container.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No events created yet. Click "+ Create Event" to add one.</td></tr>`;
    return;
  }

  container.innerHTML = events.map((ev, index) => {
    const remaining = Math.max(0, ev.maxParticipants - (ev.registeredCount || 0));
    const isCancelled = ev.status === 'cancelled';

    return `
      <tr>
        <td>${index + 1}</td>
        <td>
          <div class="fw-bold">${ev.title}</div>
          <div class="small text-muted">${ev.organizerCollege}</div>
        </td>
        <td>
          <span class="badge bg-purple-subtle text-primary border">${ev.category}</span>
        </td>
        <td>
          <div>${formatDate(ev.date)}</div>
          <div class="small text-muted">${ev.city}</div>
        </td>
        <td>
          <strong>${formatCurrency(ev.registrationFee)}</strong>
        </td>
        <td>
          <div class="fw-bold ${remaining === 0 ? 'text-danger' : 'text-success'}">
            ${ev.registeredCount || 0} / ${ev.maxParticipants}
          </div>
          <div class="small text-muted">${remaining} seats left</div>
        </td>
        <td>
          <div class="d-flex align-items-center gap-1">
            <button class="btn btn-sm btn-outline-primary" onclick="openEditEventModal('${ev._id}')" title="Edit Event">
              <i class="fa-solid fa-pen-to-square"></i>
            </button>
            <button class="btn btn-sm btn-outline-danger" onclick="confirmDeleteEvent('${ev._id}', '${ev.title.replace(/'/g, "\\'")}')" title="Delete Event">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// 3. Create Event Handler
async function handleCreateEvent(e) {
  e.preventDefault();

  const title = document.getElementById('newTitle').value.trim();
  const category = document.getElementById('newCategory').value;
  const organizerCollege = document.getElementById('newOrganizerCollege').value.trim();
  const city = document.getElementById('newCity').value.trim();
  const venue = document.getElementById('newVenue').value.trim();
  const date = document.getElementById('newDate').value;
  const startTime = document.getElementById('newStartTime').value.trim();
  const endTime = document.getElementById('newEndTime').value.trim();
  const registrationFee = document.getElementById('newFee').value;
  const maxParticipants = document.getElementById('newCapacity').value;
  const registrationDeadline = document.getElementById('newDeadline').value;
  const bannerImage = document.getElementById('newBanner').value.trim();
  const description = document.getElementById('newDescription').value.trim();

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Publishing...';

  try {
    const res = await fetch(`${API_BASE}/events`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Auth.getToken()}`
      },
      body: JSON.stringify({
        title,
        category,
        organizerCollege,
        city,
        venue,
        date,
        startTime,
        endTime,
        registrationFee: Number(registrationFee) || 0,
        maxParticipants: Number(maxParticipants) || 100,
        registrationDeadline,
        bannerImage: bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800',
        description
      })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast('Event created successfully!', 'success');
      e.target.reset();
      const modalEl = document.getElementById('createEventModal');
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();

      loadAdminEvents();
      loadAdminStats();
    } else {
      showToast(data.message || 'Failed to create event.', 'error');
    }
  } catch (err) {
    showToast('Server communication error.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Publish Event';
  }
}

// 4. Edit Event Modal & Update Handler
function openEditEventModal(eventId) {
  const ev = adminEventsList.find(e => e._id === eventId);
  if (!ev) return;

  document.getElementById('editEventId').value = ev._id;
  document.getElementById('editTitle').value = ev.title;
  document.getElementById('editCategory').value = ev.category;
  document.getElementById('editOrganizerCollege').value = ev.organizerCollege;
  document.getElementById('editCity').value = ev.city;
  document.getElementById('editVenue').value = ev.venue;
  document.getElementById('editDate').value = ev.date ? new Date(ev.date).toISOString().split('T')[0] : '';
  document.getElementById('editStartTime').value = ev.startTime || '10:00 AM';
  document.getElementById('editEndTime').value = ev.endTime || '05:00 PM';
  document.getElementById('editFee').value = ev.registrationFee;
  document.getElementById('editCapacity').value = ev.maxParticipants;
  document.getElementById('editDeadline').value = ev.registrationDeadline ? new Date(ev.registrationDeadline).toISOString().split('T')[0] : '';
  document.getElementById('editBanner').value = ev.bannerImage || '';
  document.getElementById('editDescription').value = ev.description;
  document.getElementById('editStatus').value = ev.status || 'upcoming';

  const modal = new bootstrap.Modal(document.getElementById('editEventModal'));
  modal.show();
}

async function handleUpdateEvent(e) {
  e.preventDefault();

  const eventId = document.getElementById('editEventId').value;
  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Updating...';

  const payload = {
    title: document.getElementById('editTitle').value.trim(),
    category: document.getElementById('editCategory').value,
    organizerCollege: document.getElementById('editOrganizerCollege').value.trim(),
    city: document.getElementById('editCity').value.trim(),
    venue: document.getElementById('editVenue').value.trim(),
    date: document.getElementById('editDate').value,
    startTime: document.getElementById('editStartTime').value.trim(),
    endTime: document.getElementById('editEndTime').value.trim(),
    registrationFee: Number(document.getElementById('editFee').value) || 0,
    maxParticipants: Number(document.getElementById('editCapacity').value) || 100,
    registrationDeadline: document.getElementById('editDeadline').value,
    bannerImage: document.getElementById('editBanner').value.trim(),
    description: document.getElementById('editDescription').value.trim(),
    status: document.getElementById('editStatus').value
  };

  try {
    const res = await fetch(`${API_BASE}/events/${eventId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Auth.getToken()}`
      },
      body: JSON.stringify(payload)
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast('Event updated successfully.', 'success');
      const modalEl = document.getElementById('editEventModal');
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();

      loadAdminEvents();
    } else {
      showToast(data.message || 'Failed to update event.', 'error');
    }
  } catch (err) {
    showToast('Communication error.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Save Changes';
  }
}

// 5. Delete Event Flow
let targetDeleteEventId = null;

function confirmDeleteEvent(eventId, eventTitle) {
  targetDeleteEventId = eventId;
  document.getElementById('deleteEventTitleSpan').innerText = eventTitle;

  const modal = new bootstrap.Modal(document.getElementById('deleteEventModal'));
  modal.show();
}

async function executeEventDelete() {
  if (!targetDeleteEventId) return;

  const btn = document.getElementById('confirmDeleteEventBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Deleting...';

  try {
    const res = await fetch(`${API_BASE}/events/${targetDeleteEventId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${Auth.getToken()}`
      }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast('Event deleted successfully.', 'info');
      const modalEl = document.getElementById('deleteEventModal');
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();

      loadAdminEvents();
      loadAdminRegistrations();
      loadAdminStats();
    } else {
      showToast(data.message || 'Could not delete event.', 'error');
    }
  } catch (err) {
    showToast('Failed to connect to backend server.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Yes, Delete Event';
    targetDeleteEventId = null;
  }
}

// 6. Registrations Management & Filter
async function loadAdminRegistrations() {
  const tableBody = document.getElementById('adminRegistrationsTableBody');
  if (!tableBody) return;

  try {
    const res = await fetch(`${API_BASE}/registrations`, {
      headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      adminRegistrationsList = data.registrations;
      renderAdminRegistrationsTable(data.registrations, tableBody);
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="7" class="text-danger text-center">Failed to load registrations.</td></tr>`;
  }
}

function filterRegistrationsTable() {
  const search = document.getElementById('adminRegSearch')?.value.toLowerCase().trim() || '';
  const status = document.getElementById('adminRegStatusFilter')?.value || 'all';
  const tableBody = document.getElementById('adminRegistrationsTableBody');

  const filtered = adminRegistrationsList.filter(reg => {
    const matchesStatus = (status === 'all') || (reg.status === status);
    const sName = reg.userId?.name?.toLowerCase() || '';
    const sEmail = reg.userId?.email?.toLowerCase() || '';
    const rCode = reg.registrationId?.toLowerCase() || '';
    const eTitle = reg.eventId?.title?.toLowerCase() || '';

    const matchesSearch = !search ||
      sName.includes(search) ||
      sEmail.includes(search) ||
      rCode.includes(search) ||
      eTitle.includes(search);

    return matchesStatus && matchesSearch;
  });

  renderAdminRegistrationsTable(filtered, tableBody);
}

function renderAdminRegistrationsTable(registrations, container) {
  if (registrations.length === 0) {
    container.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-muted">No registration records found.</td></tr>`;
    return;
  }

  container.innerHTML = registrations.map(reg => {
    const student = reg.userId || { name: 'Unknown', email: 'N/A', college: 'N/A', phone: 'N/A' };
    const event = reg.eventId || { title: 'Unknown Event', category: 'N/A', date: null };

    return `
      <tr>
        <td>
          <span class="badge bg-light text-primary border font-monospace px-2 py-1">${reg.registrationId}</span>
          <div class="small text-muted mt-1">${formatDate(reg.registeredAt)}</div>
        </td>
        <td>
          <div class="fw-bold">${student.name}</div>
          <div class="small text-muted">${student.email}</div>
          <div class="small text-muted"><i class="fa-solid fa-phone me-1"></i>${student.phone}</div>
        </td>
        <td>
          <div class="small fw-semibold text-truncate" style="max-width: 180px;" title="${student.college}">${student.college}</div>
          <div class="small text-muted">${student.course || ''}</div>
        </td>
        <td>
          <div class="fw-bold text-truncate" style="max-width: 200px;" title="${event.title}">${event.title}</div>
          <span class="badge bg-secondary-subtle text-secondary small">${event.category}</span>
        </td>
        <td>
          <select class="form-select form-select-sm" onchange="updateRegStatus('${reg._id}', this.value)">
            <option value="confirmed" ${reg.status === 'confirmed' ? 'selected' : ''}>Confirmed</option>
            <option value="attended" ${reg.status === 'attended' ? 'selected' : ''}>Attended</option>
            <option value="cancelled" ${reg.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
          </select>
        </td>
        <td>
          <button class="btn btn-sm btn-outline-danger" onclick="adminDeleteRegistration('${reg._id}')" title="Delete record">
            <i class="fa-solid fa-trash"></i>
          </button>
        </td>
      </tr>
    `;
  }).join('');
}

async function updateRegStatus(regId, newStatus) {
  try {
    const res = await fetch(`${API_BASE}/registrations/${regId}/status`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Auth.getToken()}`
      },
      body: JSON.stringify({ status: newStatus })
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast(data.message, 'success');
      loadAdminRegistrations();
      loadAdminEvents();
      loadAdminStats();
    } else {
      showToast(data.message || 'Status update failed', 'error');
    }
  } catch (err) {
    showToast('Failed to update status on server.', 'error');
  }
}

async function adminDeleteRegistration(regId) {
  if (!confirm('Are you sure you want to cancel / delete this registration record?')) return;

  try {
    const res = await fetch(`${API_BASE}/registrations/${regId}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
    });

    const data = await res.json();
    if (res.ok && data.success) {
      showToast('Registration deleted successfully.', 'info');
      loadAdminRegistrations();
      loadAdminEvents();
      loadAdminStats();
    } else {
      showToast(data.message || 'Failed to delete registration', 'error');
    }
  } catch (err) {
    showToast('Server communication error.', 'error');
  }
}

// 7. Export CSV
function exportCSV() {
  const token = Auth.getToken();
  window.location.href = `${API_BASE}/admin/export/csv?token=${encodeURIComponent(token)}`;
  showToast('Downloading registrations CSV file...', 'info');
}

// 8. Students List
async function loadAdminStudents() {
  const tableBody = document.getElementById('adminStudentsTableBody');
  if (!tableBody) return;

  try {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      adminStudentsList = data.students;
      renderStudentsTable(data.students, tableBody);
    }
  } catch (err) {
    tableBody.innerHTML = `<tr><td colspan="6" class="text-danger text-center">Failed to load student directory.</td></tr>`;
  }
}

function filterStudentsTable() {
  const search = document.getElementById('adminStudentSearch')?.value.toLowerCase().trim() || '';
  const tableBody = document.getElementById('adminStudentsTableBody');

  const filtered = adminStudentsList.filter(s => {
    return !search ||
      s.name.toLowerCase().includes(search) ||
      s.email.toLowerCase().includes(search) ||
      s.college.toLowerCase().includes(search) ||
      s.course.toLowerCase().includes(search);
  });

  renderStudentsTable(filtered, tableBody);
}

function renderStudentsTable(students, container) {
  if (students.length === 0) {
    container.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-muted">No student records found.</td></tr>`;
    return;
  }

  container.innerHTML = students.map((s, index) => `
    <tr>
      <td>${index + 1}</td>
      <td>
        <div class="fw-bold">${s.name}</div>
        <div class="small text-muted">${s.email}</div>
      </td>
      <td>${s.phone || 'N/A'}</td>
      <td>${s.college}</td>
      <td>${s.course} (${s.academicYear})</td>
      <td>${formatDate(s.createdAt)}</td>
    </tr>
  `).join('');
}

// 9. Contact Messages
async function loadContactMessages() {
  const container = document.getElementById('adminContactMessagesBody');
  if (!container) return;

  try {
    const res = await fetch(`${API_BASE}/contact`, {
      headers: { 'Authorization': `Bearer ${Auth.getToken()}` }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      if (data.messages.length === 0) {
        container.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-muted">No inquiries received yet.</td></tr>`;
        return;
      }

      container.innerHTML = data.messages.map(m => `
        <tr>
          <td>
            <div class="fw-bold">${m.name}</div>
            <div class="small text-muted">${m.email}</div>
          </td>
          <td>
            <div class="fw-semibold">${m.subject}</div>
          </td>
          <td>
            <div class="small text-muted" style="max-width: 320px; white-space: normal;">${m.message}</div>
          </td>
          <td>
            <span class="small text-muted">${formatDate(m.createdAt)}</span>
          </td>
          <td>
            <a href="mailto:${m.email}?subject=Re: ${encodeURIComponent(m.subject)}" class="btn btn-sm btn-outline-primary">
              <i class="fa-solid fa-reply"></i> Reply
            </a>
          </td>
        </tr>
      `).join('');
    }
  } catch (err) {
    container.innerHTML = `<tr><td colspan="5" class="text-danger text-center">Failed to load contact inquiries.</td></tr>`;
  }
}
