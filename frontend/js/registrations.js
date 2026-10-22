/**
 * StateFest - Event Details & Registration Handler
 */

let currentEvent = null;

document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const eventId = urlParams.get('id');

  if (!eventId) {
    showToast('No event ID specified.', 'error');
    setTimeout(() => { window.location.href = 'events.html'; }, 1500);
    return;
  }

  fetchEventDetails(eventId);

  const registerBtn = document.getElementById('registerActionBtn');
  if (registerBtn) {
    registerBtn.addEventListener('click', handleRegisterClick);
  }

  const confirmModalBtn = document.getElementById('confirmRegistrationSubmitBtn');
  if (confirmModalBtn) {
    confirmModalBtn.addEventListener('click', submitEventRegistration);
  }
});

async function fetchEventDetails(eventId) {
  const loader = document.getElementById('detailsLoader');
  const content = document.getElementById('detailsContent');

  try {
    const res = await fetch(`${API_BASE}/events/${eventId}`);
    const data = await res.json();

    if (res.ok && data.success) {
      currentEvent = data.event;
      if (loader) loader.classList.add('d-none');
      if (content) content.classList.remove('d-none');

      populateEventDetails(data.event);
      renderRelatedEvents(data.relatedEvents || []);
    } else {
      if (loader) loader.innerHTML = `<div class="alert alert-danger">${data.message || 'Event not found.'}</div>`;
    }
  } catch (err) {
    if (loader) {
      loader.innerHTML = `
        <div class="alert alert-danger">
          Could not connect to backend server. Make sure the Node.js server is running on port 5000.
        </div>
      `;
    }
  }
}

function populateEventDetails(event) {
  document.title = `${event.title} — StateFest`;

  // Banners & Titles
  const banner = document.getElementById('eventBanner');
  if (banner) banner.src = event.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=1200';

  const titleEl = document.getElementById('eventTitle');
  if (titleEl) titleEl.innerText = event.title;

  const categoryBadge = document.getElementById('eventCategoryBadge');
  if (categoryBadge) categoryBadge.innerText = event.category;

  const feeBadge = document.getElementById('eventFeeBadge');
  if (feeBadge) feeBadge.innerText = formatCurrency(event.registrationFee);

  const collegeEl = document.getElementById('eventCollege');
  if (collegeEl) collegeEl.innerText = event.organizerCollege;

  const dateEl = document.getElementById('eventDate');
  if (dateEl) dateEl.innerText = `${formatDate(event.date)} (${event.startTime} - ${event.endTime})`;

  const venueEl = document.getElementById('eventVenue');
  if (venueEl) venueEl.innerText = `${event.venue}, ${event.city}`;

  const deadlineEl = document.getElementById('eventDeadline');
  if (deadlineEl) deadlineEl.innerText = formatDate(event.registrationDeadline);

  const descEl = document.getElementById('eventDescription');
  if (descEl) descEl.innerText = event.description;

  const eligibilityEl = document.getElementById('eventEligibility');
  if (eligibilityEl) eligibilityEl.innerText = event.eligibility || 'Open to all recognized college students across Maharashtra.';

  // Rules list
  const rulesList = document.getElementById('eventRulesList');
  if (rulesList && event.rules && event.rules.length > 0) {
    rulesList.innerHTML = event.rules.map(rule => `
      <li class="d-flex align-items-start gap-2 mb-2">
        <i class="fa-solid fa-circle-check text-primary mt-1"></i>
        <span>${rule}</span>
      </li>
    `).join('');
  }

  // Capacity calculations
  const remaining = Math.max(0, event.maxParticipants - (event.registeredCount || 0));
  const capacityPercent = Math.min(100, Math.round(((event.registeredCount || 0) / event.maxParticipants) * 100));

  const seatsBadge = document.getElementById('eventSeatsRemaining');
  if (seatsBadge) {
    seatsBadge.innerText = `${remaining} Seats Available (${event.registeredCount || 0} / ${event.maxParticipants} Registered)`;
  }

  const progressBar = document.getElementById('eventCapacityBar');
  if (progressBar) {
    progressBar.style.width = `${capacityPercent}%`;
  }

  // Check state of registration button
  const registerBtn = document.getElementById('registerActionBtn');
  const isPastDeadline = new Date(event.registrationDeadline) < new Date();
  const isFull = remaining === 0;

  if (registerBtn) {
    if (isPastDeadline) {
      registerBtn.disabled = true;
      registerBtn.className = 'btn btn-secondary w-100 py-3 font-weight-bold';
      registerBtn.innerHTML = '<i class="fa-solid fa-clock-rotate-left me-2"></i>Registration Deadline Expired';
    } else if (isFull) {
      registerBtn.disabled = true;
      registerBtn.className = 'btn btn-danger w-100 py-3 font-weight-bold';
      registerBtn.innerHTML = '<i class="fa-solid fa-ban me-2"></i>Event Fully Booked (Housefull)';
    }
  }
}

function renderRelatedEvents(events) {
  const container = document.getElementById('relatedEventsContainer');
  if (!container) return;

  if (events.length === 0) {
    container.innerHTML = '<p class="text-muted small">No other events currently scheduled in this category.</p>';
    return;
  }

  container.innerHTML = events.map(ev => `
    <div class="col-md-4 mb-3">
      <div class="card h-100 shadow-sm border">
        <img src="${ev.bannerImage}" class="card-img-top" style="height: 140px; object-fit: cover;" alt="${ev.title}">
        <div class="card-body p-3">
          <span class="badge bg-light text-primary border mb-1">${ev.city}</span>
          <h6 class="card-title text-truncate mb-2">
            <a href="event-details.html?id=${ev._id}" class="text-dark">${ev.title}</a>
          </h6>
          <p class="small text-muted mb-2">
            <i class="fa-regular fa-calendar me-1"></i>${formatDate(ev.date)}
          </p>
          <a href="event-details.html?id=${ev._id}" class="btn btn-outline-primary btn-sm w-100">
            View Details
          </a>
        </div>
      </div>
    </div>
  `).join('');
}

function handleRegisterClick() {
  if (!Auth.isLoggedIn()) {
    showToast('Please log in with your student account to register for events.', 'info');
    setTimeout(() => {
      window.location.href = `login.html?returnUrl=${encodeURIComponent(window.location.href)}`;
    }, 1200);
    return;
  }

  if (Auth.isAdmin()) {
    showToast('Administrators cannot register for events. Please login as a student.', 'error');
    return;
  }

  const user = Auth.getUser();

  // Populate confirmation modal fields
  document.getElementById('modalStudentName').innerText = user.name;
  document.getElementById('modalStudentEmail').innerText = user.email;
  document.getElementById('modalStudentCollege').innerText = user.college;
  document.getElementById('modalStudentCourse').innerText = `${user.course} (${user.academicYear})`;
  document.getElementById('modalStudentPhone').innerText = user.phone;

  document.getElementById('modalEventTitle').innerText = currentEvent.title;
  document.getElementById('modalEventFee').innerText = formatCurrency(currentEvent.registrationFee);
  document.getElementById('modalEventVenue').innerText = `${currentEvent.venue}, ${currentEvent.city}`;

  const regModal = new bootstrap.Modal(document.getElementById('registrationConfirmModal'));
  regModal.show();
}

async function submitEventRegistration() {
  const confirmBtn = document.getElementById('confirmRegistrationSubmitBtn');
  confirmBtn.disabled = true;
  confirmBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin me-2"></i>Processing Registration...';

  try {
    const res = await fetch(`${API_BASE}/registrations`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${Auth.getToken()}`
      },
      body: JSON.stringify({ eventId: currentEvent._id })
    });

    const data = await res.json();

    if (res.ok && data.success) {
      // Close confirmation modal
      const modalEl = document.getElementById('registrationConfirmModal');
      const modalInstance = bootstrap.Modal.getInstance(modalEl);
      if (modalInstance) modalInstance.hide();

      // Show success modal with Pass details
      document.getElementById('successRegId').innerText = data.registration.registrationId;
      document.getElementById('successEventName').innerText = currentEvent.title;
      document.getElementById('successEventDate').innerText = formatDate(currentEvent.date);
      document.getElementById('successEventVenue').innerText = `${currentEvent.venue}, ${currentEvent.city}`;

      const successModal = new bootstrap.Modal(document.getElementById('registrationSuccessModal'));
      successModal.show();

      // Refresh event count on page
      fetchEventDetails(currentEvent._id);
    } else {
      showToast(data.message || 'Registration could not be completed.', 'error');
    }
  } catch (err) {
    showToast('Server communication error. Please try again.', 'error');
  } finally {
    confirmBtn.disabled = false;
    confirmBtn.innerHTML = '<i class="fa-solid fa-check me-2"></i>Confirm Registration';
  }
}
