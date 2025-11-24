// API Base URL
const API_URL = '/api';

// State
let currentEvents = [];
let currentFilters = {
    type: '',
    severity: '',
    status: '',
    search: ''
};

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    loadDashboardStats();
    loadEvents();
});

// Load dashboard statistics
async function loadDashboardStats() {
    try {
        const response = await fetch(`${API_URL}/stats`);
        const result = await response.json();

        if (result.success) {
            const stats = result.data;

            // Update type counts
            const incidentCount = stats.byType.find(t => t.type === 'incident')?.count || 0;
            const maintenanceCount = stats.byType.find(t => t.type === 'maintenance')?.count || 0;
            const safetyCount = stats.byType.find(t => t.type === 'safety')?.count || 0;

            document.getElementById('stat-incidents').textContent = incidentCount;
            document.getElementById('stat-maintenance').textContent = maintenanceCount;
            document.getElementById('stat-safety').textContent = safetyCount;
            document.getElementById('stat-critical').textContent = stats.criticalOpen;

            // Render severity stats
            renderStatsBars('severity-stats', stats.bySeverity, 'severity');

            // Render status stats
            renderStatsBars('status-stats', stats.byStatus, 'status');
        }
    } catch (error) {
        console.error('Error loading dashboard stats:', error);
        showToast('Failed to load dashboard statistics', 'error');
    }
}

// Render statistics bars
function renderStatsBars(elementId, data, type) {
    const container = document.getElementById(elementId);
    const maxCount = Math.max(...data.map(item => item.count), 1);

    container.innerHTML = data.map(item => {
        const percentage = (item.count / maxCount) * 100;
        const label = item[type].replace('_', ' ');

        return `
            <div class="bar-item">
                <div class="bar-label">${label}</div>
                <div class="bar-container">
                    <div class="bar-fill ${type}-${item[type]}" style="width: ${percentage}%">
                        ${item.count}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Load events
async function loadEvents() {
    try {
        const params = new URLSearchParams();

        if (currentFilters.type) params.append('type', currentFilters.type);
        if (currentFilters.severity) params.append('severity', currentFilters.severity);
        if (currentFilters.status) params.append('status', currentFilters.status);
        if (currentFilters.search) params.append('search', currentFilters.search);

        const response = await fetch(`${API_URL}/events?${params}`);
        const result = await response.json();

        if (result.success) {
            currentEvents = result.data;
            renderEvents(currentEvents);
        }
    } catch (error) {
        console.error('Error loading events:', error);
        showToast('Failed to load events', 'error');
        document.getElementById('events-list').innerHTML = '<div class="loading">Failed to load events</div>';
    }
}

// Render events list
function renderEvents(events) {
    const container = document.getElementById('events-list');

    if (events.length === 0) {
        container.innerHTML = `
            <div class="empty-state">
                <div class="empty-state-icon">📋</div>
                <div class="empty-state-text">No events found</div>
            </div>
        `;
        return;
    }

    container.innerHTML = events.map(event => `
        <div class="event-card type-${event.type}" onclick="showEventDetail(${event.id})">
            <div class="event-header">
                <div class="event-title-section">
                    <div class="event-title">${escapeHtml(event.title)}</div>
                    <div class="event-meta">
                        <span>📍 ${escapeHtml(event.location)}</span>
                        <span>👤 ${escapeHtml(event.reporter)}</span>
                        <span>🕐 ${formatDate(event.created_at)}</span>
                    </div>
                </div>
                <div class="event-badges">
                    <span class="badge badge-type type-${event.type}">${event.type}</span>
                    <span class="badge badge-severity severity-${event.severity}">${event.severity}</span>
                    <span class="badge badge-status status-${event.status}">${event.status.replace('_', ' ')}</span>
                </div>
            </div>
            <div class="event-description">
                ${escapeHtml(event.description.substring(0, 200))}${event.description.length > 200 ? '...' : ''}
            </div>
            <div class="event-footer">
                <span>ID: #${event.id}</span>
                <span>Updated: ${formatDate(event.updated_at)}</span>
            </div>
        </div>
    `).join('');
}

// Show event detail modal
async function showEventDetail(eventId) {
    try {
        const response = await fetch(`${API_URL}/events/${eventId}`);
        const result = await response.json();

        if (result.success) {
            const event = result.data;
            const content = document.getElementById('event-detail-content');

            content.innerHTML = `
                <div class="event-detail">
                    <div class="event-detail-header">
                        <div class="event-detail-title">${escapeHtml(event.title)}</div>
                        <div class="event-badges">
                            <span class="badge badge-type type-${event.type}">${event.type}</span>
                            <span class="badge badge-severity severity-${event.severity}">${event.severity}</span>
                            <span class="badge badge-status status-${event.status}">${event.status.replace('_', ' ')}</span>
                        </div>
                    </div>

                    <div class="event-detail-section">
                        <h3>Description</h3>
                        <p>${escapeHtml(event.description)}</p>
                    </div>

                    <div class="event-detail-section">
                        <h3>Location</h3>
                        <p>${escapeHtml(event.location)}</p>
                    </div>

                    <div class="event-detail-section">
                        <h3>Reporter</h3>
                        <p>${escapeHtml(event.reporter)}</p>
                    </div>

                    ${event.resolution ? `
                        <div class="event-detail-section">
                            <h3>Resolution</h3>
                            <p>${escapeHtml(event.resolution)}</p>
                        </div>
                    ` : ''}

                    <div class="event-detail-section">
                        <h3>Timeline</h3>
                        <p><strong>Created:</strong> ${formatDate(event.created_at)}</p>
                        <p><strong>Last Updated:</strong> ${formatDate(event.updated_at)}</p>
                    </div>

                    <div class="event-detail-actions">
                        <button class="btn btn-primary" onclick="showUpdateStatus(${event.id}, '${event.status}', '${escapeHtml(event.resolution || '')}')">
                            Update Status
                        </button>
                        <button class="btn btn-secondary" onclick="closeEventDetail()">Close</button>
                    </div>
                </div>
            `;

            document.getElementById('event-detail-modal').classList.add('active');
        }
    } catch (error) {
        console.error('Error loading event detail:', error);
        showToast('Failed to load event details', 'error');
    }
}

// Close event detail modal
function closeEventDetail() {
    document.getElementById('event-detail-modal').classList.remove('active');
}

// Show new event form
function showNewEventForm() {
    document.getElementById('new-event-form').reset();
    document.getElementById('new-event-modal').classList.add('active');
}

// Close new event form
function closeNewEventForm() {
    document.getElementById('new-event-modal').classList.remove('active');
}

// Submit new event
async function submitNewEvent(e) {
    e.preventDefault();

    const formData = {
        type: document.getElementById('event-type').value,
        title: document.getElementById('event-title').value,
        severity: document.getElementById('event-severity').value,
        location: document.getElementById('event-location').value,
        reporter: document.getElementById('event-reporter').value,
        description: document.getElementById('event-description').value
    };

    try {
        const response = await fetch(`${API_URL}/events`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(formData)
        });

        const result = await response.json();

        if (result.success) {
            showToast('Event created successfully', 'success');
            closeNewEventForm();
            loadEvents();
            loadDashboardStats();
        } else {
            showToast(result.error || 'Failed to create event', 'error');
        }
    } catch (error) {
        console.error('Error creating event:', error);
        showToast('Failed to create event', 'error');
    }
}

// Show update status modal
function showUpdateStatus(eventId, currentStatus, currentResolution) {
    document.getElementById('update-event-id').value = eventId;
    document.getElementById('update-status').value = currentStatus;
    document.getElementById('update-resolution').value = currentResolution.replace(/&#x27;/g, "'");

    closeEventDetail();
    document.getElementById('update-status-modal').classList.add('active');
}

// Close update status modal
function closeUpdateStatus() {
    document.getElementById('update-status-modal').classList.remove('active');
}

// Submit status update
async function submitStatusUpdate(e) {
    e.preventDefault();

    const eventId = document.getElementById('update-event-id').value;
    const updateData = {
        status: document.getElementById('update-status').value,
        resolution: document.getElementById('update-resolution').value
    };

    try {
        const response = await fetch(`${API_URL}/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateData)
        });

        const result = await response.json();

        if (result.success) {
            showToast('Event status updated successfully', 'success');
            closeUpdateStatus();
            loadEvents();
            loadDashboardStats();
        } else {
            showToast(result.error || 'Failed to update event', 'error');
        }
    } catch (error) {
        console.error('Error updating event:', error);
        showToast('Failed to update event', 'error');
    }
}

// Apply filters
function applyFilters() {
    currentFilters = {
        type: document.getElementById('filter-type').value,
        severity: document.getElementById('filter-severity').value,
        status: document.getElementById('filter-status').value,
        search: document.getElementById('search-input').value
    };

    loadEvents();
}

// Utility: Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.className = `toast show ${type}`;

    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Utility: Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;

    return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
}

// Utility: Escape HTML
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// Close modals on backdrop click
document.addEventListener('click', (e) => {
    if (e.target.classList.contains('modal')) {
        e.target.classList.remove('active');
    }
});

// Close modals on Escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        document.querySelectorAll('.modal.active').forEach(modal => {
            modal.classList.remove('active');
        });
    }
});
