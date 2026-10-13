document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000/api';
    const detailContainer = document.getElementById('event-detail-container');
    const registrationsContainer = document.getElementById('registrations-container');
    const registerBtn = document.getElementById('register-btn');
    const deleteEventBtn = document.getElementById('delete-event-btn');
    const deleteEventNote = document.getElementById('delete-event-note');

    // Extract event ID from URL query string (defaults to ID 1 if unspecified)
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('id') || 1;

    // Dynamic link binding for the registration button
    if (registerBtn) {
        registerBtn.href = `registration.html?event_id=${eventId}`;
    }

    // Fetch single event details via GET request (includes associated registrations)
    fetch(`${API_BASE_URL}/events/${eventId}`)
        .then(res => {
            if (!res.ok) {
                throw new Error('Event not found');
            }
            return res.json();
        })
        .then(event => {
            renderEventDetails(event);
            renderRegistrations(event.registrations || []);
            setupDeleteButton(event);
        })
        .catch(err => {
            console.error('Error loading event details:', err);
            if (detailContainer) {
                detailContainer.innerHTML = `<p class="error-msg">Failed to load event details. ${err.message}</p>`;
            }
            if (registrationsContainer) {
                registrationsContainer.innerHTML = `<p class="error-msg">Failed to load registrations. ${err.message}</p>`;
            }
        });

    // Delete action for this event.
    // Rule: an event that already has registrations cannot be deleted.
    function setupDeleteButton(event) {
        const registrations = event.registrations || [];

        if (registrations.length > 0) {
            if (deleteEventBtn) deleteEventBtn.hidden = true;
            showDeleteNote(`This event already has ${registrations.length} registration${registrations.length !== 1 ? 's' : ''}, so it cannot be deleted.`, false);
            return;
        }

        if (deleteEventBtn) {
            deleteEventBtn.hidden = false;
            deleteEventBtn.addEventListener('click', () => {
                if (!window.confirm(`Delete the event "${event.title}"? This action cannot be undone.`)) {
                    return;
                }

                deleteEventBtn.disabled = true;
                deleteEventBtn.textContent = 'Deleting...';

                fetch(`${API_BASE_URL}/events/${eventId}`, { method: 'DELETE' })
                    .then(res => res.json().then(data => ({ ok: res.ok, data })))
                    .then(({ ok, data }) => {
                        if (!ok) {
                            throw new Error(data.error || 'Failed to delete the event');
                        }

                        // The event no longer exists, go back to the event list
                        window.location.href = 'index.html';
                    })
                    .catch(err => {
                        console.error('Error deleting event:', err);
                        showDeleteNote(`Error: ${err.message}`, true);
                        deleteEventBtn.disabled = false;
                        deleteEventBtn.textContent = 'Delete this Event';
                    });
            });
        }
    }

    // Show a note (or an error message) next to the delete button
    function showDeleteNote(message, isError) {
        if (!deleteEventNote) return;

        deleteEventNote.textContent = message;
        deleteEventNote.className = isError ? 'error-msg' : 'form-hint';
        deleteEventNote.hidden = false;
    }

    function renderEventDetails(event) {
        if (!detailContainer) return;

        detailContainer.innerHTML = `
            <div class="detail-card">
                <img src="${event.image_url}" alt="${event.title}" class="detail-image" onerror="this.onerror=null; this.src='https://images.unsplash.com/photo-1530541930197-ff16ac917b0e?auto=format&fit=crop&w=800&q=80';" />
                <div class="detail-content">
                    <span class="badge">${event.category_name || 'Charity Run'}</span>
                    <h2>${event.title}</h2>
                    <p class="card-info"><strong>Location:</strong> ${event.location}</p>
                    <p class="card-info"><strong>Date:</strong> ${event.date}</p>
                    <p class="card-info"><strong>Organizer:</strong> ${event.organizer || 'Zhejiang Sports Association'}</p>
                    <div class="description">
                        <h3>Event Overview</h3>
                        <p>${event.description || 'Join us for this exciting community charity run in Zhejiang Province! Promote health, active living, and support local community welfare initiatives.'}</p>
                    </div>
                </div>
            </div>
        `;
    }

    function renderRegistrations(registrations) {
        if (!registrationsContainer) return;

        if (registrations.length === 0) {
            registrationsContainer.innerHTML = '<p class="no-data-msg">No registrations recorded for this event yet.</p>';
            return;
        }

        let tableHtml = `
            <table class="registrations-table">
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Participant Name</th>
                        <th>Email Address</th>
                        <th>Contact Number</th>
                        <th>Tickets</th>
                        <th>Registration Date</th>
                    </tr>
                </thead>
                <tbody>
        `;

        registrations.forEach((reg, index) => {
            tableHtml += `
                <tr>
                    <td>${index + 1}</td>
                    <td><strong>${reg.user_name}</strong></td>
                    <td>${reg.user_email}</td>
                    <td>${reg.contact_number}</td>
                    <td>${reg.tickets_purchased}</td>
                    <td>${reg.registration_date}</td>
                </tr>
            `;
        });

        tableHtml += `
                </tbody>
            </table>
        `;

        registrationsContainer.innerHTML = tableHtml;
    }
});