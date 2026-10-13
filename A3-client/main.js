document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000/api';

    const eventsGrid = document.getElementById('events-grid');
    const categorySelect = document.getElementById('category-select');
    const searchLocationInput = document.getElementById('search-location');
    const btnReset = document.getElementById('btn-reset');
    const countBadge = document.getElementById('event-count-badge');

    // Event management (add / delete) elements
    const adminForm = document.getElementById('add-event-form');
    const adminFeedback = document.getElementById('admin-feedback');
    const addEventBtn = document.getElementById('add-event-btn');
    const newCategorySelect = document.getElementById('new-category');

    // Fallback image used when an event has no image_url
    const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=800&q=80';

    // Initial Data Fetch
    loadCategories();
    loadEvents();

    // Event Listeners for Real-time Filtering
    if (categorySelect) {
        categorySelect.addEventListener('change', filterEvents);
    }

    if (searchLocationInput) {
        searchLocationInput.addEventListener('input', debounce(filterEvents, 300));
    }

    if (btnReset) {
        btnReset.addEventListener('click', () => {
            if (categorySelect) categorySelect.value = '';
            if (searchLocationInput) searchLocationInput.value = '';
            loadEvents();
        });
    }

    // Add event form (POST /api/events)
    if (adminForm) {
        adminForm.addEventListener('submit', handleAddEvent);
    }

    // Delete buttons are delegated because the cards are re-rendered on every reload
    if (eventsGrid) {
        eventsGrid.addEventListener('click', (e) => {
            const deleteBtn = e.target.closest('.btn-delete');
            if (!deleteBtn || deleteBtn.disabled) return;
            deleteEvent(deleteBtn.dataset.deleteId, deleteBtn.dataset.deleteTitle);
        });
    }

    // Fetch All Categories for Dropdowns (filter + add event form)
    function loadCategories() {
        fetch(`${API_BASE_URL}/categories`)
            .then(res => res.json())
            .then(categories => {
                const options = categories
                    .map(cat => `<option value="${cat.category_id}">${escapeHtml(cat.category_name)}</option>`)
                    .join('');

                if (categorySelect) {
                    categorySelect.innerHTML = `<option value="">All Categories</option>${options}`;
                }

                if (newCategorySelect) {
                    newCategorySelect.innerHTML = `<option value="">No category</option>${options}`;
                }
            })
            .catch(err => console.error('Error loading categories:', err));
    }

    // Fetch Events (with optional query parameters)
    function loadEvents(categoryId = '', location = '') {
        eventsGrid.innerHTML = '<p class="loading-msg">Loading charity events...</p>';

        let url = `${API_BASE_URL}/events`;
        const params = new URLSearchParams();

        if (categoryId) params.append('category_id', categoryId);
        if (location) params.append('location', location);

        if (params.toString()) {
            url += `?${params.toString()}`;
        }

        fetch(url)
            .then(res => res.json())
            .then(events => {
                renderEvents(events);
            })
            .catch(err => {
                console.error('Error fetching events:', err);
                eventsGrid.innerHTML = '<p class="error-msg">Failed to load events. Please ensure the backend server is running on port 3000.</p>';
                if (countBadge) countBadge.textContent = '0 events';
            });
    }

    // Filter Trigger Function
    function filterEvents() {
        const catId = categorySelect ? categorySelect.value : '';
        const loc = searchLocationInput ? searchLocationInput.value.trim() : '';
        loadEvents(catId, loc);
    }

    // Render Event Cards Grid
    function renderEvents(events) {
        if (countBadge) {
            countBadge.textContent = `${events.length} event${events.length !== 1 ? 's' : ''} found`;
        }

        if (!events || events.length === 0) {
            eventsGrid.innerHTML = '<p class="no-results-msg">No charity events found matching your search criteria. Use the Event Management section above to add one.</p>';
            return;
        }

        eventsGrid.innerHTML = events.map(event => {
            const registrationCount = Number(event.registration_count) || 0;

            // Events with registrations are locked, events without registrations can be deleted
            const deleteButton = registrationCount > 0
                ? `<button class="btn-delete" type="button" disabled title="This event already has registrations and cannot be deleted">Delete</button>`
                : `<button class="btn-delete" type="button" data-delete-id="${event.event_id}" data-delete-title="${escapeHtml(event.title)}">Delete</button>`;

            return `
            <div class="event-card">
                <div class="card-image-wrapper">
                    <span class="category-badge-floating">${escapeHtml(event.category_name || 'Charity Run')}</span>
                    <img src="${escapeHtml(event.image_url || DEFAULT_IMAGE)}" alt="${escapeHtml(event.title)}" class="card-image" onerror="this.onerror=null; this.src='${DEFAULT_IMAGE}';" />
                </div>
                <div class="card-body">
                    <h3 class="card-title">${escapeHtml(event.title)}</h3>
                    <div class="card-info">Location: ${escapeHtml(event.location)}</div>
                    <div class="card-info">Date: ${escapeHtml(event.date)}</div>
                    <div class="card-footer">
                        <span class="reg-count">${registrationCount} registration${registrationCount !== 1 ? 's' : ''}</span>
                        <div class="card-actions">
                            <a href="details.html?id=${event.event_id}" class="btn-view-details">View Details &rarr;</a>
                            ${deleteButton}
                        </div>
                    </div>
                </div>
            </div>
        `;
        }).join('');
    }

    // Create a new event through POST /api/events
    function handleAddEvent(e) {
        e.preventDefault();

        const payload = {
            title: document.getElementById('new-title').value.trim(),
            category_id: newCategorySelect ? newCategorySelect.value : '',
            location: document.getElementById('new-location').value.trim(),
            date: document.getElementById('new-date').value,
            organizer: document.getElementById('new-organizer').value.trim(),
            image_url: document.getElementById('new-image').value.trim(),
            description: document.getElementById('new-description').value.trim()
        };

        if (!payload.title || !payload.location || !payload.date) {
            showAdminFeedback('Please fill in the event title, location and date.', false);
            return;
        }

        if (addEventBtn) {
            addEventBtn.disabled = true;
            addEventBtn.textContent = 'Adding...';
        }

        fetch(`${API_BASE_URL}/events`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        })
            .then(res => res.json().then(data => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                if (!ok) {
                    throw new Error(data.error || 'Failed to create the event');
                }

                adminForm.reset();
                showAdminFeedback(`Event "${data.title}" was added successfully.`, true);
                filterEvents();
            })
            .catch(err => {
                console.error('Error creating event:', err);
                showAdminFeedback(`Error: ${err.message}`, false);
            })
            .then(() => {
                if (addEventBtn) {
                    addEventBtn.disabled = false;
                    addEventBtn.textContent = 'Add Event';
                }
            });
    }

    // Delete an event through DELETE /api/events/:id
    // The server refuses (409) to delete an event that still has registrations
    function deleteEvent(eventId, title) {
        if (!eventId) return;

        if (!window.confirm(`Delete the event "${title}"? This action cannot be undone.`)) {
            return;
        }

        fetch(`${API_BASE_URL}/events/${eventId}`, { method: 'DELETE' })
            .then(res => res.json().then(data => ({ ok: res.ok, data })))
            .then(({ ok, data }) => {
                if (!ok) {
                    throw new Error(data.error || 'Failed to delete the event');
                }

                showAdminFeedback(data.message || 'Event deleted successfully.', true);
                filterEvents();
            })
            .catch(err => {
                console.error('Error deleting event:', err);
                showAdminFeedback(`Error: ${err.message}`, false);
                // Refresh so the registration counts stay in sync with the server
                filterEvents();
            });
    }

    // Display a success / error message in the Event Management card
    function showAdminFeedback(message, isSuccess) {
        if (!adminFeedback) return;

        adminFeedback.textContent = message;
        adminFeedback.className = isSuccess ? 'form-response-msg success' : 'form-response-msg error';
        adminFeedback.hidden = false;
    }

    // Escape text before it is inserted into HTML
    function escapeHtml(value) {
        return String(value === null || value === undefined ? '' : value)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }

    // Debounce Utility Function for Input Search
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
});