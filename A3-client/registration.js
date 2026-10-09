document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000/api';
    const form = document.getElementById('registration-form');
    const eventIdInput = document.getElementById('event_id');
    const eventTitleDisplay = document.getElementById('event-title-display');
    const backLink = document.getElementById('back-to-details-link');
    const feedbackMsg = document.getElementById('feedback-msg');
    const submitBtn = document.getElementById('submit-btn');

    // Extract event_id from URL query string
    const urlParams = new URLSearchParams(window.location.search);
    const eventId = urlParams.get('event_id') || 1;

    // Set hidden field and back link URL
    eventIdInput.value = eventId;
    if (backLink) {
        backLink.href = `details.html?id=${eventId}`;
    }

    // Fetch target event information to display title
    fetch(`${API_BASE_URL}/events/${eventId}`)
        .then(res => {
            if (!res.ok) throw new Error('Event not found');
            return res.json();
        })
        .then(event => {
            if (eventTitleDisplay) {
                eventTitleDisplay.textContent = `Register for: ${event.title}`;
            }
        })
        .catch(err => {
            console.error('Error fetching event info:', err);
            if (eventTitleDisplay) {
                eventTitleDisplay.textContent = 'Register for Event';
            }
        });

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Construct registration payload
        const payload = {
            event_id: parseInt(eventIdInput.value),
            user_name: document.getElementById('user_name').value.trim(),
            user_email: document.getElementById('user_email').value.trim(),
            contact_number: document.getElementById('contact_number').value.trim(),
            tickets_purchased: parseInt(document.getElementById('tickets_purchased').value)
        };

        // Basic client-side validation
        if (!payload.user_name || !payload.user_email || !payload.contact_number || !payload.tickets_purchased) {
            showFeedback('Please fill in all required fields.', 'error');
            return;
        }

        // Disable submit button during network request
        submitBtn.disabled = true;
        submitBtn.textContent = 'Submitting...';

        // POST registration record to backend API
        fetch(`${API_BASE_URL}/registrations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        })
        .then(res => {
            if (!res.ok) {
                return res.json().then(errData => {
                    throw new Error(errData.error || 'Failed to submit registration');
                });
            }
            return res.json();
        })
        .then(data => {
            showFeedback('Registration submitted successfully! Redirecting back to event details...', 'success');
            // Redirect back to event details page after 1.5 seconds to view updated list
            setTimeout(() => {
                window.location.href = `details.html?id=${eventId}`;
            }, 1500);
        })
        .catch(err => {
            console.error('Error submitting registration:', err);
            showFeedback(`Error: ${err.message}`, 'error');
            submitBtn.disabled = false;
            submitBtn.textContent = 'Submit Registration';
        });
    });

    function showFeedback(message, type) {
        if (!feedbackMsg) return;
        feedbackMsg.textContent = message;
        feedbackMsg.style.display = 'block';

        if (type === 'success') {
            feedbackMsg.style.backgroundColor = '#d4edda';
            feedbackMsg.style.color = '#155724';
            feedbackMsg.style.border = '1px solid #c3e6cb';
        } else {
            feedbackMsg.style.backgroundColor = '#f8d7da';
            feedbackMsg.style.color = '#721c24';
            feedbackMsg.style.border = '1px solid #f5c6cb';
        }
    }
});