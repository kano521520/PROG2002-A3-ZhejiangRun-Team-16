document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000/api';

    const eventsGrid = document.getElementById('events-grid');
    const categorySelect = document.getElementById('category-select');
    const searchLocationInput = document.getElementById('search-location');
    const btnReset = document.getElementById('btn-reset');
    const countBadge = document.getElementById('event-count-badge');

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

    // Fetch All Categories for Dropdown
    function loadCategories() {
        fetch(`${API_BASE_URL}/categories`)
            .then(res => res.json())
            .then(categories => {
                if (categorySelect) {
                    categorySelect.innerHTML = '<option value="">All Categories</option>';
                    categories.forEach(cat => {
                        const opt = document.createElement('option');
                        opt.value = cat.category_id;
                        opt.textContent = cat.category_name;
                        categorySelect.appendChild(opt);
                    });
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
            eventsGrid.innerHTML = '<p class="no-results-msg">No charity events found matching your search criteria.</p>';
            return;
        }

        eventsGrid.innerHTML = events.map(event => `
            <div class="event-card">
                <div class="card-image-wrapper">
                    <span class="category-badge-floating">${event.category_name || 'Charity Run'}</span>
                    <img src="${event.image_url}" alt="${event.title}" class="card-image" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=800&q=80';" />
                </div>
                <div class="card-body">
                    <h3 class="card-title">${event.title}</h3>
                    <div class="card-info">
                        <span>📍</span>
                        <span>Location: ${event.location}</span>
                    </div>
                    <div class="card-info">
                        <span>📅</span>
                        <span>Date: ${event.date}</span>
                    </div>
                    <div class="card-footer">
                        <a href="details.html?id=${event.event_id}" class="btn-view-details">View Details &rarr;</a>
                    </div>
                </div>
            </div>
        `).join('');
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