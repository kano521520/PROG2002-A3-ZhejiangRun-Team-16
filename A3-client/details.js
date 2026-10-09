document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000/api';
    const detailContainer = document.getElementById('event-detail-container');

    // Extract event ID from URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id');

    if (!eventId) {
        detailContainer.innerHTML = '<p class="error-msg">No event ID specified. <a href="index.html">Return to events list</a>.</p>';
        return;
    }

    // Fetch single event details via GET request
    fetch(`${API_BASE_URL}/events/${eventId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Event not found');
            }
            return res.json();
        })
        .then(event => {
            renderEventDetails(event);
        })
        .catch(err => {
            console.error('Error loading event details:', err);
            detailContainer.innerHTML = `<p class="error-msg">Failed to load event details. ${err.message}</p>`;
        });

    function renderEventDetails(event) {
        detailContainer.innerHTML = `
            <div class="detail-card">
                <img src="${event.image_url}" alt="${event.title}" class="detail-image" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=800&q=80';" />
                <div class="detail-content">
                    <span class="badge">${event.category_name || 'Charity Run'}</span>
                    <h2>${event.title}</h2>
                    <p class="card-info">📍 <strong>Location:</strong> ${event.location}</p>
                    <p class="card-info">📅 <strong>Date:</strong> ${event.date}</p>
                    <p class="card-info">🏢 <strong>Organizer:</strong> ${event.organizer || 'Zhejiang Sports Association'}</p>
                    <div class="description">
                        <h3>Event Overview</h3>
                        <p>${event.description || 'Join us for this exciting community charity run in Zhejiang Province! Promote health, active living, and support local community welfare initiatives.'}</p>
                    </div>
                </div>
            </div>
        `;
    }
});