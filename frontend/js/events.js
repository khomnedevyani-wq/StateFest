/**
 * StateFest - Explore Events JavaScript (Search, Filters, Sort, Dynamic Cards)
 */

let allEventsData = [];

document.addEventListener('DOMContentLoaded', () => {
  const eventsContainer = document.getElementById('eventsGrid');
  if (!eventsContainer) return;

  // Read search & category query params if coming from homepage
  const urlParams = new URLSearchParams(window.location.search);
  const initialCategory = urlParams.get('category');
  const initialSearch = urlParams.get('search');

  if (initialCategory) {
    const categorySelect = document.getElementById('categoryFilter');
    if (categorySelect) categorySelect.value = initialCategory;
  }

  if (initialSearch) {
    const searchInput = document.getElementById('searchInput');
    if (searchInput) searchInput.value = initialSearch;
  }

  // Load events
  fetchEvents();

  // Attach filter event listeners
  const searchInput = document.getElementById('searchInput');
  const categoryFilter = document.getElementById('categoryFilter');
  const cityFilter = document.getElementById('cityFilter');
  const sortFilter = document.getElementById('sortFilter');
  const resetBtn = document.getElementById('resetFiltersBtn');

  if (searchInput) searchInput.addEventListener('input', debounce(fetchEvents, 300));
  if (categoryFilter) categoryFilter.addEventListener('change', fetchEvents);
  if (cityFilter) cityFilter.addEventListener('change', fetchEvents);
  if (sortFilter) sortFilter.addEventListener('change', fetchEvents);

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (searchInput) searchInput.value = '';
      if (categoryFilter) categoryFilter.value = 'All';
      if (cityFilter) cityFilter.value = 'All';
      if (sortFilter) sortFilter.value = 'date_asc';
      fetchEvents();
    });
  }
});

function debounce(func, delay) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), delay);
  };
}

async function fetchEvents() {
  const container = document.getElementById('eventsGrid');
  const countBadge = document.getElementById('eventsCountBadge');
  const emptyState = document.getElementById('emptyEventsState');

  const search = document.getElementById('searchInput')?.value || '';
  const category = document.getElementById('categoryFilter')?.value || 'All';
  const city = document.getElementById('cityFilter')?.value || 'All';
  const sort = document.getElementById('sortFilter')?.value || 'date_asc';

  container.innerHTML = `
    <div class="col-12 text-center py-5">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Loading events...</span>
      </div>
      <p class="text-muted mt-2">Loading upcoming collegiate events across Maharashtra...</p>
    </div>
  `;

  try {
    const queryParams = new URLSearchParams({
      search,
      category,
      city,
      sort
    });

    const response = await fetch(`${API_BASE}/events?${queryParams.toString()}`);
    const data = await response.json();

    if (response.ok && data.success) {
      allEventsData = data.events;

      if (countBadge) {
        countBadge.innerText = `${data.events.length} Events Found`;
      }

      if (data.events.length === 0) {
        container.innerHTML = '';
        if (emptyState) emptyState.classList.remove('d-none');
      } else {
        if (emptyState) emptyState.classList.add('d-none');
        renderEventCards(data.events, container);
      }
    } else {
      container.innerHTML = `<div class="col-12 alert alert-danger">Error: ${data.message || 'Could not fetch events'}</div>`;
    }
  } catch (error) {
    container.innerHTML = `
      <div class="col-12 text-center py-5">
        <div class="alert alert-warning d-inline-block">
          <i class="fa-solid fa-triangle-exclamation me-2"></i>
          Unable to connect to the backend server. Please make sure the server is running on port 5000.
        </div>
      </div>
    `;
  }
}

function renderEventCards(events, container) {
  container.innerHTML = events.map(event => {
    const remainingSeats = Math.max(0, event.maxParticipants - (event.registeredCount || 0));
    const isFull = remainingSeats === 0;
    const isPastDeadline = new Date(event.registrationDeadline) < new Date();
    const isFree = event.registrationFee === 0;

    const capacityPercent = Math.min(100, Math.round(((event.registeredCount || 0) / event.maxParticipants) * 100));

    let statusPill = '';
    if (isPastDeadline) {
      statusPill = '<span class="badge bg-secondary ms-1">Registration Closed</span>';
    } else if (isFull) {
      statusPill = '<span class="badge bg-danger ms-1">Sold Out</span>';
    }

    return `
      <div class="col-md-6 col-lg-4 mb-4">
        <div class="event-card h-100">
          <div class="event-card-img-wrapper">
            <img src="${event.bannerImage || 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'}"
                 alt="${event.title}"
                 class="event-card-img"
                 onerror="this.src='https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800'">
            <span class="event-badge-category">${event.category}</span>
            <span class="event-badge-fee ${isFree ? 'free' : ''}">
              ${formatCurrency(event.registrationFee)}
            </span>
          </div>

          <div class="event-card-body">
            <div class="event-organizer" title="${event.organizerCollege}">
              <i class="fa-solid fa-building-columns me-1"></i> ${event.organizerCollege}
            </div>

            <h5 class="event-title">
              <a href="event-details.html?id=${event._id}">${event.title}</a>
            </h5>

            <ul class="event-meta">
              <li>
                <i class="fa-regular fa-calendar"></i>
                <span>${formatDate(event.date)} &bull; ${event.startTime}</span>
              </li>
              <li>
                <i class="fa-solid fa-location-dot"></i>
                <span class="text-truncate">${event.venue}, <strong>${event.city}</strong></span>
              </li>
              <li>
                <i class="fa-solid fa-users"></i>
                <span>${event.registeredCount || 0} / ${event.maxParticipants} Registered ${statusPill}</span>
              </li>
            </ul>

            <div class="mb-3">
              <div class="d-flex justify-content-between text-muted small mb-1">
                <span>Capacity filled</span>
                <span>${capacityPercent}%</span>
              </div>
              <div class="capacity-meter">
                <div class="capacity-meter-fill" style="width: ${capacityPercent}%;"></div>
              </div>
            </div>

            <div class="event-card-footer">
              <div class="text-muted small">
                Deadline: <strong>${formatDate(event.registrationDeadline)}</strong>
              </div>
              <a href="event-details.html?id=${event._id}" class="btn btn-statefest-primary btn-sm">
                View & Register <i class="fa-solid fa-arrow-right ms-1"></i>
              </a>
            </div>
          </div>
        </div>
      </div>
    `;
  }).join('');
}
