/**
 * StateFest - Student Dashboard JavaScript
 */

let myRegistrationsData = [];

document.addEventListener('DOMContentLoaded', () => {
  // Check auth
  if (!Auth.isLoggedIn()) {
    showToast('Please log in to access your student dashboard.', 'error');
    window.location.href = 'login.html';
    return;
  }

  if (Auth.isAdmin()) {
    window.location.href = 'admin-dashboard.html';
    return;
  }

  loadStudentProfile();
  loadMyRegistrations();

  // Attach profile edit form handler
  const editProfileForm = document.getElementById('editProfileForm');
  if (editProfileForm) {
    editProfileForm.addEventListener('submit', handleProfileUpdate);
  }
});

function loadStudentProfile() {
  const user = Auth.getUser();
  if (!user) return;

  const nameEls = document.querySelectorAll('.student-name');
  nameEls.forEach(el => el.innerText = user.name);

  const emailEls = document.querySelectorAll('.student-email');
  emailEls.forEach(el => el.innerText = user.email);

  const collegeEls = document.querySelectorAll('.student-college');
  collegeEls.forEach(el => el.innerText = user.college);

  const courseEls = document.querySelectorAll('.student-course');
  courseEls.forEach(el => el.innerText = `${user.course} (${user.academicYear})`);

  const phoneEls = document.querySelectorAll('.student-phone');
  phoneEls.forEach(el => el.innerText = user.phone);

  // Fill edit form
  const editName = document.getElementById('editName');
  if (editName) editName.value = user.name;

  const editPhone = document.getElementById('editPhone');
  if (editPhone) editPhone.value = user.phone;

  const editCollege = document.getElementById('editCollege');
  if (editCollege) editCollege.value = user.college;

  const editCourse = document.getElementById('editCourse');
  if (editCourse) editCourse.value = user.course;

  const editYear = document.getElementById('editAcademicYear');
  if (editYear) editYear.value = user.academicYear;
}

async function loadMyRegistrations() {
  const tableBody = document.getElementById('registrationsTableBody');
  const emptyState = document.getElementById('emptyRegistrationsNotice');

  try {
    const res = await fetch(`${API_BASE}/registrations/my`, {
      headers: {
        'Authorization': `Bearer ${Auth.getToken()}`
      }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      myRegistrationsData = data.registrations;

      // Calculate statistics
      const total = data.registrations.length;
      const today = new Date();

      const upcoming = data.registrations.filter(r =>
        r.status === 'confirmed' && r.eventId && new Date(r.eventId.date) >= today
      ).length;

      const past = data.registrations.filter(r =>
        r.eventId && new Date(r.eventId.date) < today
      ).length;

      document.getElementById('statTotalRegistrations').innerText = total;
      document.getElementById('statUpcomingEvents').innerText = upcoming;
      document.getElementById('statPastEvents').innerText = past;

      if (total === 0) {
        if (emptyState) emptyState.classList.remove('d-none');
        if (tableBody) tableBody.innerHTML = '';
      } else {
        if (emptyState) emptyState.classList.add('d-none');
        renderRegistrationsTable(data.registrations, tableBody);
      }
    } else {
      showToast(data.message || 'Unable to fetch your registrations', 'error');
    }
  } catch (err) {
    showToast('Failed to connect to backend server.', 'error');
  }
}

function renderRegistrationsTable(registrations, container) {
  if (!container) return;

  container.innerHTML = registrations.map(reg => {
    const ev = reg.eventId;
    if (!ev) {
      return `
        <tr>
          <td colspan="6" class="text-muted">Event information is no longer available.</td>
        </tr>
      `;
    }

    const isUpcoming = new Date(ev.date) >= new Date();
    const isCancelled = reg.status === 'cancelled';

    let statusBadge = '';
    if (isCancelled) {
      statusBadge = '<span class="custom-badge badge-cancelled"><i class="fa-solid fa-ban"></i> Cancelled</span>';
    } else if (reg.status === 'attended') {
      statusBadge = '<span class="custom-badge badge-attended"><i class="fa-solid fa-check-double"></i> Attended</span>';
    } else {
      statusBadge = '<span class="custom-badge badge-confirmed"><i class="fa-solid fa-circle-check"></i> Confirmed</span>';
    }

    return `
      <tr>
        <td>
          <span class="badge bg-light text-primary border font-monospace px-2 py-1">
            ${reg.registrationId}
          </span>
          <div class="small text-muted mt-1">Booked: ${formatDate(reg.registeredAt)}</div>
        </td>
        <td>
          <div class="fw-bold text-dark">${ev.title}</div>
          <div class="small text-muted"><i class="fa-solid fa-building-columns me-1"></i>${ev.organizerCollege}</div>
          <span class="badge bg-secondary-subtle text-secondary small">${ev.category}</span>
        </td>
        <td>
          <div><i class="fa-regular fa-calendar me-1 text-primary"></i> ${formatDate(ev.date)}</div>
          <div class="small text-muted">${ev.startTime} - ${ev.endTime}</div>
        </td>
        <td>
          <div class="text-truncate" style="max-width: 180px;" title="${ev.venue}">${ev.venue}</div>
          <span class="badge bg-info-subtle text-info border">${ev.city}</span>
        </td>
        <td>${statusBadge}</td>
        <td>
          <div class="d-flex align-items-center gap-2">
            ${!isCancelled ? `
              <button class="btn btn-outline-primary btn-sm" onclick="viewTicketPass('${reg._id}')" title="View / Print Entry Pass">
                <i class="fa-solid fa-ticket"></i> Pass
              </button>
              <button class="btn btn-outline-danger btn-sm" onclick="confirmCancelRegistration('${reg._id}', '${reg.registrationId}', '${ev.title.replace(/'/g, "\\'")}')" title="Cancel Registration">
                <i class="fa-solid fa-xmark"></i>
              </button>
            ` : `
              <span class="text-muted small">No actions</span>
            `}
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

// Cancel Registration Flow
let targetCancelId = null;

function confirmCancelRegistration(regId, regCode, eventTitle) {
  targetCancelId = regId;
  document.getElementById('cancelRegCodeSpan').innerText = regCode;
  document.getElementById('cancelEventTitleSpan').innerText = eventTitle;

  const modal = new bootstrap.Modal(document.getElementById('cancelRegistrationModal'));
  modal.show();
}

async function executeCancellation() {
  if (!targetCancelId) return;

  const btn = document.getElementById('confirmCancelBtn');
  btn.disabled = true;
  btn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Cancelling...';

  try {
    const res = await fetch(`${API_BASE}/registrations/${targetCancelId}`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${Auth.getToken()}`
      }
    });

    const data = await res.json();

    if (res.ok && data.success) {
      showToast('Registration cancelled successfully.', 'info');
      const modalEl = document.getElementById('cancelRegistrationModal');
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();

      loadMyRegistrations();
    } else {
      showToast(data.message || 'Failed to cancel registration.', 'error');
    }
  } catch (err) {
    showToast('Communication error with server.', 'error');
  } finally {
    btn.disabled = false;
    btn.innerHTML = 'Yes, Cancel Registration';
    targetCancelId = null;
  }
}

// View / Print Entry Pass
function viewTicketPass(regId) {
  const reg = myRegistrationsData.find(r => r._id === regId);
  if (!reg) return;

  const user = Auth.getUser();
  const ev = reg.eventId;

  document.getElementById('ticketRegId').innerText = reg.registrationId;
  document.getElementById('ticketEventTitle').innerText = ev.title;
  document.getElementById('ticketCollege').innerText = ev.organizerCollege;
  document.getElementById('ticketDate').innerText = `${formatDate(ev.date)} &bull; ${ev.startTime}`;
  document.getElementById('ticketVenue').innerText = `${ev.venue}, ${ev.city}`;
  document.getElementById('ticketFee').innerText = formatCurrency(ev.registrationFee);

  document.getElementById('ticketStudentName').innerText = user.name;
  document.getElementById('ticketStudentCollege').innerText = user.college;
  document.getElementById('ticketStudentCourse').innerText = `${user.course} - ${user.academicYear}`;
  document.getElementById('ticketStudentPhone').innerText = user.phone;

  const modal = new bootstrap.Modal(document.getElementById('ticketPassModal'));
  modal.show();
}

// Handle Profile Update
async function handleProfileUpdate(e) {
  e.preventDefault();

  const name = document.getElementById('editName').value.trim();
  const phone = document.getElementById('editPhone').value.trim();
  const college = document.getElementById('editCollege').value.trim();
  const course = document.getElementById('editCourse').value.trim();
  const academicYear = document.getElementById('editAcademicYear').value;

  const submitBtn = e.target.querySelector('button[type="submit"]');
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Saving...';

  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Auth.getToken()}`
      },
      body: JSON.stringify({ name, phone, college, course, academicYear })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      Auth.setSession(Auth.getToken(), data.user);
      showToast('Profile updated successfully!', 'success');
      loadStudentProfile();

      const modalEl = document.getElementById('editProfileModal');
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();
    } else {
      showToast(data.message || 'Profile update failed.', 'error');
    }
  } catch (err) {
    showToast('Failed to connect to backend.', 'error');
  } finally {
    submitBtn.disabled = false;
    submitBtn.innerHTML = 'Save Changes';
  }
}
