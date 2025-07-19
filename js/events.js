
// Events Page JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize calendar
    initializeCalendar();
    
    // Initialize mobile menu
    initializeMobileMenu();
    
    // Initialize smooth scrolling
    initializeSmoothScrolling();
    
    // Initialize header scroll effect
    initializeHeaderScroll();
});

// Calendar functionality
function initializeCalendar() {
    const calendarDays = document.getElementById('calendarDays');
    const currentMonthElement = document.getElementById('currentMonth');
    const prevMonthBtn = document.getElementById('prevMonth');
    const nextMonthBtn = document.getElementById('nextMonth');
    
    let currentDate = new Date();
    let currentMonth = currentDate.getMonth();
    let currentYear = currentDate.getFullYear();
    
    // Event dates (you can populate this from a database)
    const eventDates = [
        { date: '2024-12-15', title: 'Winter Competition Prep' },
        { date: '2025-01-20', title: 'Regional Competition' },
        { date: '2025-02-10', title: 'Guest Speaker Series' },
        { date: '2025-03-05', title: 'Spring Hackathon' },
        { date: '2025-04-12', title: 'State Championship' },
        { date: '2025-05-08', title: 'End of Year Celebration' }
    ];
    
    function renderCalendar() {
        const firstDay = new Date(currentYear, currentMonth, 1);
        const lastDay = new Date(currentYear, currentMonth + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const monthNames = [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
        
        currentMonthElement.textContent = `${monthNames[currentMonth]} ${currentYear}`;
        
        calendarDays.innerHTML = '';
        
        for (let i = 0; i < 42; i++) {
            const date = new Date(startDate);
            date.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = date.getDate();
            
            // Check if it's the current month
            if (date.getMonth() !== currentMonth) {
                dayElement.classList.add('other-month');
            }
            
            // Check if it's today
            if (date.toDateString() === new Date().toDateString()) {
                dayElement.style.background = 'linear-gradient(135deg, #ff6b6b, #ee5a24)';
                dayElement.style.color = 'white';
                dayElement.style.fontWeight = '600';
            }
            
            // Check if it has an event
            const dateString = date.toISOString().split('T')[0];
            const event = eventDates.find(e => e.date === dateString);
            if (event) {
                dayElement.classList.add('has-event');
                dayElement.title = event.title;
            }
            
            dayElement.addEventListener('click', () => {
                if (event) {
                    showEventModal(event);
                }
            });
            
            calendarDays.appendChild(dayElement);
        }
    }
    
    function showEventModal(event) {
        // Create modal for event details
        const modal = document.createElement('div');
        modal.className = 'event-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-modal">&times;</span>
                <h3>${event.title}</h3>
                <p>Date: ${new Date(event.date).toLocaleDateString()}</p>
                <p>This is a placeholder for event details. You can add more information here.</p>
                <button class="btn btn-primary">Register</button>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Close modal functionality
        const closeBtn = modal.querySelector('.close-modal');
        closeBtn.onclick = () => {
            document.body.removeChild(modal);
        };
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                document.body.removeChild(modal);
            }
        };
    }
    
    prevMonthBtn.addEventListener('click', () => {
        currentMonth--;
        if (currentMonth < 0) {
            currentMonth = 11;
            currentYear--;
        }
        renderCalendar();
    });
    
    nextMonthBtn.addEventListener('click', () => {
        currentMonth++;
        if (currentMonth > 11) {
            currentMonth = 0;
            currentYear++;
        }
        renderCalendar();
    });
    
    // Initial render
    renderCalendar();
}

// Mobile menu functionality
function initializeMobileMenu() {
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    hamburger.addEventListener('click', () => {
        hamburger.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
    
    // Close menu when clicking on a link
    document.querySelectorAll('.nav-link').forEach(link => {
        link.addEventListener('click', () => {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
        });
    });
}

// Smooth scrolling for anchor links
function initializeSmoothScrolling() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const target = document.querySelector(this.getAttribute('href'));
            if (target) {
                target.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }
        });
    });
}

// Header scroll effect
function initializeHeaderScroll() {
    const header = document.querySelector('.header');
    
    window.addEventListener('scroll', () => {
        if (window.scrollY > 100) {
            header.classList.add('scrolled');
        } else {
            header.classList.remove('scrolled');
        }
    });
}

// Newsletter form submission
document.addEventListener('DOMContentLoaded', function() {
    const newsletterForm = document.querySelector('.newsletter-form');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', function(e) {
            e.preventDefault();
            const email = this.querySelector('input[type="email"]').value;
            
            // Show success message
            showNotification('Thank you for subscribing!', 'success');
            
            // Clear form
            this.reset();
        });
    }
});

// Event registration buttons
document.addEventListener('DOMContentLoaded', function() {
    document.querySelectorAll('.event-card .btn').forEach(button => {
        button.addEventListener('click', function(e) {
            e.preventDefault();
            const eventTitle = this.closest('.event-card').querySelector('h3').textContent;
            showNotification(`Registration for "${eventTitle}" is not yet available.`, 'info');
        });
    });
});

// Notification system
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <span class="notification-message">${message}</span>
            <button class="notification-close">&times;</button>
        </div>
    `;
    
    // Add styles
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'success' ? '#48bb78' : type === 'error' ? '#f56565' : '#4299e1'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 8px;
        box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        transform: translateX(100%);
        transition: transform 0.3s ease;
        max-width: 300px;
    `;
    
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Close button functionality
    const closeBtn = notification.querySelector('.notification-close');
    closeBtn.onclick = () => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    };
    
    // Auto remove after 5 seconds
    setTimeout(() => {
        if (document.body.contains(notification)) {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => {
                if (document.body.contains(notification)) {
                    document.body.removeChild(notification);
                }
            }, 300);
        }
    }, 5000);
}

// Add CSS for modal
const modalStyles = `
    .event-modal {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.5);
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 10000;
    }
    
    .modal-content {
        background: white;
        padding: 2rem;
        border-radius: 16px;
        max-width: 500px;
        width: 90%;
        position: relative;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
    }
    
    .close-modal {
        position: absolute;
        top: 1rem;
        right: 1.5rem;
        font-size: 1.5rem;
        cursor: pointer;
        color: #718096;
        transition: color 0.3s ease;
    }
    
    .close-modal:hover {
        color: #2d3748;
    }
    
    .modal-content h3 {
        margin-bottom: 1rem;
        color: #2d3748;
    }
    
    .modal-content p {
        margin-bottom: 1rem;
        color: #718096;
    }
`;

// Inject modal styles
const styleSheet = document.createElement('style');
styleSheet.textContent = modalStyles;
document.head.appendChild(styleSheet); 
