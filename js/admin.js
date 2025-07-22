// Simple TSA Admin Dashboard
document.addEventListener('DOMContentLoaded', function() {
    // Initialize admin functionality
    initializeMobileMenu();
    initializeTabs();
    initializeModals();
    
    // Wait for app initialization then load admin data
    function waitForApp() {
        if (window.auth && window.db) {
            loadAdminData();
        } else {
            setTimeout(waitForApp, 100);
        }
    }
    waitForApp();
});

// ============================================================
// CHATBOT FUNCTIONALITY
// ============================================================

let driveSync;
let chatbot;
let isInitialized = false;

function initializeChatbot() {
    if (isInitialized) return;
    
    console.log('Initializing chatbot...');
    
    // Initialize services
    driveSync = new GoogleDriveSync();
    chatbot = new GeminiChatbot();
    
    // Get DOM elements
    const chatInput = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');
    const syncBtn = document.getElementById('syncNotesBtn');
    
    if (!chatInput || !sendBtn || !syncBtn) {
        console.error('Chatbot elements not found');
        return;
    }
    
    // Event listeners
    sendBtn.addEventListener('click', sendMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
    syncBtn.addEventListener('click', syncMeetingNotes);
    
    // Load meeting stats
    loadMeetingStats();
    
    isInitialized = true;
    console.log('Chatbot initialized successfully');
}

async function sendMessage() {
    const input = document.getElementById('chatInput');
    const sendBtn = document.getElementById('sendChatBtn');
    const message = input.value.trim();
    
    if (!message) return;
    
    // Disable input during processing
    input.disabled = true;
    sendBtn.disabled = true;
    
    // Clear input
    input.value = '';
    
    // Add user message to chat
    addMessageToChat(message, 'user');
    
    // Show typing indicator
    showTypingIndicator();
    
    try {
        // Get response from chatbot
        const response = await chatbot.askQuestion(message);
        
        // Remove typing indicator
        removeTypingIndicator();
        
        if (response.success) {
            addMessageToChat(response.answer, 'bot');
        } else {
            addMessageToChat('Sorry, I encountered an error: ' + response.error, 'bot');
        }
    } catch (error) {
        removeTypingIndicator();
        addMessageToChat('Sorry, something went wrong. Please try again.', 'bot');
        console.error('Chat error:', error);
    } finally {
        // Re-enable input
        input.disabled = false;
        sendBtn.disabled = false;
        input.focus();
    }
}

function formatBotMessage(message) {
    // Sanitize the input to prevent XSS
    const escapeHtml = (text) => {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    };
    
    // Start with escaped HTML to prevent XSS
    let formatted = escapeHtml(message);
    
    // Convert basic markdown-style formatting to HTML
    
    // Bold text (**text** or __text__)
    formatted = formatted.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    formatted = formatted.replace(/__(.*?)__/g, '<strong>$1</strong>');
    
    // Italic text (*text* or _text_)
    formatted = formatted.replace(/\*(.*?)\*/g, '<em>$1</em>');
    formatted = formatted.replace(/_(.*?)_/g, '<em>$1</em>');
    
    // Convert line breaks to proper HTML
    formatted = formatted.replace(/\n/g, '<br>');
    
    // Convert numbered lists (1. item)
    formatted = formatted.replace(/^(\d+\.\s+)(.+)$/gm, '<li>$2</li>');
    
    // Convert bullet points (- item or * item)
    formatted = formatted.replace(/^[\-\*]\s+(.+)$/gm, '<li>$1</li>');
    
    // Wrap consecutive list items in proper list tags
    formatted = formatted.replace(/(<li>.*?<\/li>)(\s*<br>\s*<li>.*?<\/li>)+/gs, (match) => {
        // Check if this looks like a numbered list (contains digits)
        const isNumbered = /^\s*<li>\d+/.test(match);
        const listItems = match.replace(/<br>\s*/g, '');
        
        if (isNumbered) {
            return `<ol>${listItems}</ol>`;
        } else {
            return `<ul>${listItems}</ul>`;
        }
    });
    
    // Handle remaining single list items
    formatted = formatted.replace(/^<li>(.*?)<\/li>$/gm, '<ul><li>$1</li></ul>');
    
    // Convert paragraphs (double line breaks)
    formatted = formatted.replace(/(<br>\s*){2,}/g, '</p><p>');
    
    // Wrap in paragraphs if there are any paragraph breaks
    if (formatted.includes('</p><p>')) {
        formatted = '<p>' + formatted + '</p>';
    }
    
    // Clean up any empty paragraphs
    formatted = formatted.replace(/<p>\s*<\/p>/g, '');
    
    return formatted;
}

function addMessageToChat(message, sender) {
    const chatMessages = document.getElementById('chatMessages');
    
    // Remove welcome message if it exists
    const welcomeMessage = chatMessages.querySelector('.welcome-message');
    if (welcomeMessage && sender === 'user') {
        welcomeMessage.remove();
    }
    
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${sender}`;
    
    const avatar = sender === 'user' ? '👤' : '🤖';
    
    // Format bot messages, keep user messages as plain text
    const formattedMessage = sender === 'bot' ? formatBotMessage(message) : message;
    
    messageDiv.innerHTML = `
        <div class="message-avatar ${sender}">${avatar}</div>
        <div class="message-content ${sender}">${formattedMessage}</div>
    `;
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function showTypingIndicator() {
    const chatMessages = document.getElementById('chatMessages');
    const typingDiv = document.createElement('div');
    typingDiv.className = 'chat-message bot typing-indicator-message';
    typingDiv.innerHTML = `
        <div class="message-avatar bot">🤖</div>
        <div class="typing-indicator">
            <div class="typing-dots">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(typingDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function removeTypingIndicator() {
    const typingIndicator = document.querySelector('.typing-indicator-message');
    if (typingIndicator) {
        typingIndicator.remove();
    }
}

async function syncMeetingNotes() {
    const syncBtn = document.getElementById('syncNotesBtn');
    const originalText = syncBtn.textContent;
    
    syncBtn.textContent = 'Syncing...';
    syncBtn.disabled = true;
    
    try {
        const result = await driveSync.syncMeetingNotes();
        
        if (result.success) {
            window.notify(`Successfully synced ${result.filesProcessed} meeting notes!`, 'success');
            loadMeetingStats();
        } else {
            window.notify('Sync failed: ' + result.error, 'error');
        }
    } catch (error) {
        window.notify('Sync failed: ' + error.message, 'error');
        console.error('Sync error:', error);
    } finally {
        syncBtn.textContent = originalText;
        syncBtn.disabled = false;
    }
}



async function loadMeetingStats() {
    try {
        // Get meeting notes count from database
        const { data: notes, error } = await window.supabase
            .from('meeting_notes')
            .select('created_at')
            .order('created_at', { ascending: false });

        if (error) throw error;

        const totalNotes = notes ? notes.length : 0;
        const lastSync = notes && notes.length > 0 
            ? new Date(notes[0].created_at).toLocaleDateString()
            : 'Never';

        document.getElementById('totalNotes').textContent = totalNotes;
        document.getElementById('lastSync').textContent = lastSync;
        
    } catch (error) {
        console.error('Error loading meeting stats:', error);
        document.getElementById('totalNotes').textContent = '0';
        document.getElementById('lastSync').textContent = 'Never';
    }
}

function askSampleQuestion(question) {
    const input = document.getElementById('chatInput');
    input.value = question;
    sendMessage();
}

// Make function globally available for onclick handlers
window.askSampleQuestion = askSampleQuestion;

// Mobile menu functionality
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', function() {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Close mobile menu when clicking on a link
        document.querySelectorAll('.nav-link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

// Tab functionality
function initializeTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabId = button.getAttribute('data-tab');
            
            // Remove active class from all tabs
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // Add active class to clicked tab
            button.classList.add('active');
            document.getElementById(tabId).classList.add('active');
            
            // Initialize chatbot when chatbot tab is opened
            if (tabId === 'chatbot') {
                setTimeout(initializeChatbot, 100);
            }
        });
    });
}

// Modal functionality
function initializeModals() {
    const addEventBtn = document.getElementById('addEventBtn');
    const addEventModal = document.getElementById('addEventModal');
    const closeModal = document.querySelector('.close-modal');
    const cancelAddEvent = document.getElementById('cancelAddEvent');
    const addEventForm = document.getElementById('addEventForm');
    
    // Open modal
    if (addEventBtn) {
        addEventBtn.addEventListener('click', () => {
            addEventModal.style.display = 'flex';
        });
    }
    
    // Close modal
    function closeAddEventModal() {
        addEventModal.style.display = 'none';
        addEventForm.reset();
    }
    
    if (closeModal) {
        closeModal.addEventListener('click', closeAddEventModal);
    }
    
    if (cancelAddEvent) {
        cancelAddEvent.addEventListener('click', closeAddEventModal);
    }
    
    // Close modal when clicking outside
    if (addEventModal) {
        addEventModal.addEventListener('click', (e) => {
            if (e.target === addEventModal) {
                closeAddEventModal();
            }
        });
    }
    
    // Handle form submission
    if (addEventForm) {
        addEventForm.addEventListener('submit', handleAddEvent);
    }
    
    // Export users functionality
    const exportUsersBtn = document.getElementById('exportUsers');
    if (exportUsersBtn) {
        exportUsersBtn.addEventListener('click', exportUsers);
    }
}

// Load admin data
async function loadAdminData() {
    try {
        console.log('Loading admin data...');
        
        // Double-check admin privileges
        const { user } = await window.auth.getCurrentUser();
        if (!window.isAdmin(user)) {
            window.notify('Access denied. Admin privileges required.', 'error');
            window.location.href = 'index.html';
            return;
        }
        
        // Update admin info display
        const adminEmailElement = document.getElementById('adminEmail');
        if (adminEmailElement) {
            adminEmailElement.textContent = user.email;
        }
        
        // Load stats
        await loadStats();
        
        // Load users
        await loadUsers();
        
        // Load events
        await loadEvents();
        
        // Load analytics
        await loadAnalytics();
        
        console.log('Admin data loaded successfully');
    } catch (error) {
        console.error('Error loading admin data:', error);
        window.notify('Error loading admin data: ' + error.message, 'error');
    }
}

// Load statistics
async function loadStats() {
    try {
        console.log('Loading stats...');
        
        // Get user count
        const { data: users, error: usersError } = await window.db.getUsers();
        
        if (usersError) throw usersError;
        
        // Get event count
        const { data: events, error: eventsError } = await window.db.getEvents();
        
        if (eventsError) throw eventsError;
        
        // Get registrations count
        const { data: registrations, error: registrationsError } = await window.supabase
            .from('event_registrations')
            .select('*');
        
        if (registrationsError) throw registrationsError;
        
        // Update stats in UI
        document.getElementById('totalUsers').textContent = users ? users.length : 0;
        document.getElementById('totalEvents').textContent = events ? events.length : 0;
        document.getElementById('registrations').textContent = registrations ? registrations.length : 0;
        document.getElementById('activeMembers').textContent = users ? Math.floor(users.length * 0.8) : 0; // Mock active members
        
        console.log('Stats loaded:', { users: users?.length, events: events?.length, registrations: registrations?.length });
    } catch (error) {
        console.error('Error loading stats:', error);
        // Set default values
        document.getElementById('totalUsers').textContent = '0';
        document.getElementById('totalEvents').textContent = '0';
        document.getElementById('registrations').textContent = '0';
        document.getElementById('activeMembers').textContent = '0';
    }
}

// Load users
async function loadUsers() {
    try {
        console.log('Loading users...');
        
        const { data: users, error } = await window.db.getUsers();
        
        if (error) throw error;
        
        const usersTableBody = document.getElementById('usersTableBody');
        if (!usersTableBody) return;
        
        usersTableBody.innerHTML = '';
        
        if (!users || users.length === 0) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #718096;">
                        No members found. Users will appear here after they sign up.
                    </td>
                </tr>
            `;
            return;
        }
        
        users.forEach(user => {
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${user.first_name} ${user.last_name}</td>
                <td>${user.email}</td>
                <td>${user.grade}</td>
                <td>${user.phone}</td>
                <td>${new Date(user.created_at).toLocaleDateString()}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-secondary btn-sm" onclick="viewUser('${user.id}')">View</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteUser('${user.id}')">Delete</button>
                    </div>
                </td>
            `;
            usersTableBody.appendChild(row);
        });
        
        console.log('Users loaded:', users.length);
    } catch (error) {
        console.error('Error loading users:', error);
        const usersTableBody = document.getElementById('usersTableBody');
        if (usersTableBody) {
            usersTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #e53e3e;">
                        Error loading users: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

// Load events
async function loadEvents() {
    try {
        console.log('Loading events...');
        
        const { data: events, error } = await window.db.getEvents();
        
        if (error) throw error;
        
        const eventsTableBody = document.getElementById('eventsTableBody');
        if (!eventsTableBody) return;
        
        eventsTableBody.innerHTML = '';
        
        if (!events || events.length === 0) {
            eventsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #718096;">
                        No events found. Create your first event using the "Add New Event" button.
                    </td>
                </tr>
            `;
            return;
        }
        
        for (const event of events) {
            // Get registration count for this event
            const { data: registrations } = await window.supabase
                .from('event_registrations')
                .select('*')
                .eq('event_id', event.id);
            
            const registrationCount = registrations ? registrations.length : 0;
            
            const row = document.createElement('tr');
            row.innerHTML = `
                <td>${event.title}</td>
                <td>${new Date(event.event_date).toLocaleDateString()}</td>
                <td>${event.location || 'TBD'}</td>
                <td>${event.max_participants || 'Unlimited'}</td>
                <td>${registrationCount}</td>
                <td>
                    <div class="table-actions">
                        <button class="btn btn-secondary btn-sm" onclick="editEvent('${event.id}')">Edit</button>
                        <button class="btn btn-danger btn-sm" onclick="deleteEvent('${event.id}')">Delete</button>
                    </div>
                </td>
            `;
            eventsTableBody.appendChild(row);
        }
        
        console.log('Events loaded:', events.length);
    } catch (error) {
        console.error('Error loading events:', error);
        const eventsTableBody = document.getElementById('eventsTableBody');
        if (eventsTableBody) {
            eventsTableBody.innerHTML = `
                <tr>
                    <td colspan="6" style="text-align: center; padding: 2rem; color: #e53e3e;">
                        Error loading events: ${error.message}
                    </td>
                </tr>
            `;
        }
    }
}

// Load analytics
async function loadAnalytics() {
    try {
        console.log('Loading analytics...');
        
        // Load grade distribution
        const { data: users, error } = await window.db.getUsers();
        
        if (error) throw error;
        
        if (users) {
            const gradeCounts = {
                9: 0,
                10: 0,
                11: 0,
                12: 0
            };
            
            users.forEach(user => {
                if (gradeCounts.hasOwnProperty(user.grade)) {
                    gradeCounts[user.grade]++;
                }
            });
            
            document.getElementById('grade9Count').textContent = gradeCounts[9];
            document.getElementById('grade10Count').textContent = gradeCounts[10];
            document.getElementById('grade11Count').textContent = gradeCounts[11];
            document.getElementById('grade12Count').textContent = gradeCounts[12];
        }
        
        // Load recent activity
        loadRecentActivity();
        
        console.log('Analytics loaded');
    } catch (error) {
        console.error('Error loading analytics:', error);
        // Set default values
        document.getElementById('grade9Count').textContent = '0';
        document.getElementById('grade10Count').textContent = '0';
        document.getElementById('grade11Count').textContent = '0';
        document.getElementById('grade12Count').textContent = '0';
    }
}

// Load recent activity
function loadRecentActivity() {
    const recentActivity = document.getElementById('recentActivity');
    if (!recentActivity) return;
    
    // Mock recent activity data
    const activities = [
        {
            icon: '👤',
            text: 'New member joined: John Doe',
            time: '2 hours ago'
        },
        {
            icon: '📅',
            text: 'Event created: Spring Hackathon',
            time: '1 day ago'
        },
        {
            icon: '🎯',
            text: 'Competition registration opened',
            time: '2 days ago'
        },
        {
            icon: '📊',
            text: 'Monthly report generated',
            time: '3 days ago'
        }
    ];
    
    recentActivity.innerHTML = '';
    
    activities.forEach(activity => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div class="activity-icon">${activity.icon}</div>
            <div class="activity-content">
                <p>${activity.text}</p>
                <span class="activity-time">${activity.time}</span>
            </div>
        `;
        recentActivity.appendChild(item);
    });
}

// Handle add event form submission
async function handleAddEvent(e) {
    e.preventDefault();
    
    const eventData = {
        title: document.getElementById('eventTitle').value,
        description: document.getElementById('eventDescription').value,
        event_date: document.getElementById('eventDate').value,
        location: document.getElementById('eventLocation').value,
        max_participants: parseInt(document.getElementById('maxParticipants').value)
    };
    
    try {
        console.log('Adding event:', eventData);
        
        const { data, error } = await window.supabase
            .from('events')
            .insert([eventData])
            .select();
        
        if (error) throw error;
        
        window.notify('Event added successfully!', 'success');
        
        // Close modal and reset form
        document.getElementById('addEventModal').style.display = 'none';
        document.getElementById('addEventForm').reset();
        
        // Reload events and stats
        await loadEvents();
        await loadStats();
        
    } catch (error) {
        console.error('Error adding event:', error);
        window.notify('Error adding event: ' + error.message, 'error');
    }
}

// User management functions
function viewUser(userId) {
    window.notify('User details functionality would be implemented here', 'info');
}

async function deleteUser(userId) {
    if (!confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
        return;
    }
    
    try {
        const { error } = await window.supabase
            .from('user_profiles')
            .delete()
            .eq('id', userId);
        
        if (error) throw error;
        
        window.notify('User deleted successfully', 'success');
        await loadUsers();
        await loadStats();
        
    } catch (error) {
        console.error('Error deleting user:', error);
        window.notify('Error deleting user: ' + error.message, 'error');
    }
}

// Event management functions
function editEvent(eventId) {
    window.notify('Edit event functionality would be implemented here', 'info');
}

async function deleteEvent(eventId) {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) {
        return;
    }
    
    try {
        const { error } = await window.supabase
            .from('events')
            .delete()
            .eq('id', eventId);
        
        if (error) throw error;
        
        window.notify('Event deleted successfully', 'success');
        await loadEvents();
        await loadStats();
        
    } catch (error) {
        console.error('Error deleting event:', error);
        window.notify('Error deleting event: ' + error.message, 'error');
    }
}

// Export users to CSV
async function exportUsers() {
    try {
        const { data: users, error } = await window.db.getUsers();
        
        if (error) throw error;
        
        if (!users || users.length === 0) {
            window.notify('No users to export', 'info');
            return;
        }
        
        // Create CSV content
        const headers = ['Name', 'Email', 'Grade', 'Phone', 'Parent Email', 'Parent Phone', 'Join Date'];
        const csvContent = [
            headers.join(','),
            ...users.map(user => [
                `"${user.first_name} ${user.last_name}"`,
                `"${user.email}"`,
                `"${user.grade}"`,
                `"${user.phone}"`,
                `"${user.parent_email}"`,
                `"${user.parent_phone}"`,
                `"${new Date(user.created_at).toLocaleDateString()}"`
            ].join(','))
        ].join('\n');
        
        // Create and download file
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `tsa_members_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
        
        window.notify('Members exported successfully!', 'success');
        
    } catch (error) {
        console.error('Error exporting users:', error);
        window.notify('Error exporting users: ' + error.message, 'error');
    }
}

// Make functions globally available for onclick handlers
window.viewUser = viewUser;
window.deleteUser = deleteUser;
window.editEvent = editEvent;
window.deleteEvent = deleteEvent; 