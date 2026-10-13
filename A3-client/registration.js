document.addEventListener('DOMContentLoaded', () => {
    const API_BASE_URL = 'http://localhost:3000/api';
    const form = document.getElementById('registration-form');
    const eventIdInput = document.getElementById('event_id');
    const eventTitleDisplay = document.getElementById('event-title-display');
    const backLink = document.getElementById('back-to-details-link');
    const feedbackMsg = document.getElementById('feedback-msg');
    const submitBtn = document.getElementById('submit-btn');
    const userNameInput = document.getElementById('user_name');

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

    // Early feedback: warn as soon as the typed name is already used in this event
    if (userNameInput) {
        userNameInput.addEventListener('blur', () => {
            const name = userNameInput.value.trim();
            if (!name) return;

            checkNameIsDuplicate(name).then(isDuplicate => {
                if (isDuplicate) {
                    showFeedback(duplicateNameMessage(name), 'error');
                }
            });
        });

        // Hide an old warning again once the participant edits the name
        userNameInput.addEventListener('input', () => {
            if (feedbackMsg && !feedbackMsg.hidden && feedbackMsg.className.includes('error')) {
                feedbackMsg.hidden = true;
            }
        });
    }

    // Handle form submission
    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Construct registration payload
        const payload = {
            event_id: parseInt(eventIdInput.value),
            user_name: userNameInput.value.trim(),
            user_email: document.getElementById('user_email').value.trim(),
            contact_number: document.getElementById('contact_number').value.trim(),
            tickets_purchased: parseInt(document.getElementById('tickets_purchased').value)
        };

        // Basic client-side validation
        if (!payload.user_name || !payload.user_email || !payload.contact_number || !payload.tickets_purchased) {
            showFeedback('Please fill in all required fields.', 'error');
            return;
        }

        // Disable submit button during the duplicate check and the network request
        submitBtn.disabled = true;
        submitBtn.textContent = 'Checking name...';

        // A3 rule: one participant name may only register once per event,
        // so the name is checked before the record is posted.
        checkNameIsDuplicate(payload.user_name)
            .then(isDuplicate => {
                if (isDuplicate) {
                    showFeedback(duplicateNameMessage(payload.user_name), 'error');
                    setSubmitting(false);
                    return null;
                }

                submitBtn.textContent = 'Submitting...';
                return postRegistration(payload);
            })
            .catch(err => {
                // Only reached when the POST request itself fails
                console.error('Error submitting registration:', err);
                showFeedback(`Error: ${err.message}`, 'error');
                setSubmitting(false);
            });
    });

    // Returns true when the same participant name is already registered for this event.
    // If the check cannot be completed, the server still enforces the rule on POST.
    function checkNameIsDuplicate(name) {
        const query = `event_id=${encodeURIComponent(eventId)}&user_name=${encodeURIComponent(name)}`;

        return fetch(`${API_BASE_URL}/registrations/check?${query}`)
            .then(res => {
                if (!res.ok) throw new Error('Duplicate name check failed');
                return res.json();
            })
            .then(data => Boolean(data.duplicate))
            .catch(err => {
                console.warn('Duplicate name check skipped:', err.message);
                return false;
            });
    }

    // POST the registration record to the backend API
    function postRegistration(payload) {
        return fetch(`${API_BASE_URL}/registrations`, {
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
            return data;
        });
    }

    function duplicateNameMessage(name) {
        return `"${name}" has already registered for this event. The same name can only be registered once per event - please use a different name.`;
    }

    function setSubmitting(isSubmitting) {
        submitBtn.disabled = isSubmitting;
        if (!isSubmitting) {
            submitBtn.textContent = 'Submit Registration';
        }
    }

    function showFeedback(message, type) {
        if (!feedbackMsg) return;
        feedbackMsg.textContent = message;
        // Colours come from style.css (.form-response-msg.success / .error)
        feedbackMsg.className = 'form-response-msg ' + (type === 'success' ? 'success' : 'error');
        feedbackMsg.hidden = false;
    }
});