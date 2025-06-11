// Supabase Configuration
const SUPABASE_URL = 'https://riovrrxkeieujbjrwiwq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpb3ZycnhrZWlldWpianJ3aXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTg5MTksImV4cCI6MjA2NTE5NDkxOX0.w7otW-sRcUh2mc_O1FejOhcPW81YDM0s1aPtO2yIaOo';

// Initialize Supabase client
const supabase = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

console.log('Supabase client initialized:', supabase);

// Test Supabase connection
async function testSupabaseConnection() {
    try {
        console.log('Testing Supabase connection...');
        const { data, error } = await supabase.from('user_profiles').select('count').limit(1);
        if (error) {
            console.error('Supabase connection test failed:', error);
        } else {
            console.log('Supabase connection test successful');
        }
    } catch (err) {
        console.error('Supabase connection test error:', err);
    }
}

// Run connection test
testSupabaseConnection();

// Authentication functions
const auth = {
    // Sign up new user
    async signUp(userData) {
        console.log('Auth.signUp called with:', userData);
        try {
            const { data, error } = await supabase.auth.signUp({
                email: userData.email,
                password: userData.password,
                options: {
                    data: {
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        grade: userData.grade,
                        phone: userData.phone,
                        parent_email: userData.parentEmail,
                        parent_phone: userData.parentPhone
                    }
                }
            });

            console.log('Supabase auth.signUp response:', { data, error });
            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            console.error('Auth.signUp error:', error);
            return { data: null, error };
        }
    },

    // Sign in existing user
    async signIn(email, password) {
        try {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Sign out user
    async signOut() {
        try {
            const { error } = await supabase.auth.signOut();
            if (error) throw error;
            return { error: null };
        } catch (error) {
            return { error };
        }
    },

    // Get current user
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabase.auth.getUser();
            if (error) throw error;
            return { user, error: null };
        } catch (error) {
            return { user: null, error };
        }
    },

    // Check if user is authenticated
    async isAuthenticated() {
        const { user } = await this.getCurrentUser();
        return !!user;
    }
};

// Database functions
const database = {
    // Insert user profile data
    async insertUserProfile(userId, userData) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .insert([
                    {
                        user_id: userId,
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        email: userData.email,
                        grade: userData.grade,
                        phone: userData.phone,
                        parent_email: userData.parentEmail,
                        parent_phone: userData.parentPhone,
                        created_at: new Date().toISOString()
                    }
                ]);

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Get user profile
    async getUserProfile(userId) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    },

    // Update user profile
    async updateUserProfile(userId, updates) {
        try {
            const { data, error } = await supabase
                .from('user_profiles')
                .update(updates)
                .eq('user_id', userId);

            if (error) throw error;
            return { data, error: null };
        } catch (error) {
            return { data: null, error };
        }
    }
};

// Utility functions
const utils = {
    // Show notification
    showNotification(message, type = 'info') {
        // Remove existing notifications
        const existingNotifications = document.querySelectorAll('.notification');
        existingNotifications.forEach(notification => notification.remove());
        
        // Create notification element
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
            top: 100px;
            right: 20px;
            background: ${type === 'success' ? '#4caf50' : type === 'error' ? '#f44336' : '#2196f3'};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
        `;
        
        notification.querySelector('.notification-content').style.cssText = `
            display: flex;
            align-items: center;
            justify-content: space-between;
            gap: 1rem;
        `;
        
        notification.querySelector('.notification-close').style.cssText = `
            background: none;
            border: none;
            color: white;
            font-size: 1.5rem;
            cursor: pointer;
            padding: 0;
            line-height: 1;
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Animate in
        setTimeout(() => {
            notification.style.transform = 'translateX(0)';
        }, 100);
        
        // Close button functionality
        notification.querySelector('.notification-close').addEventListener('click', () => {
            notification.style.transform = 'translateX(100%)';
            setTimeout(() => notification.remove(), 300);
        });
        
        // Auto remove after 5 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                notification.style.transform = 'translateX(100%)';
                setTimeout(() => notification.remove(), 300);
            }
        }, 5000);
    },

    // Validate email format
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    },

    // Validate phone format
    isValidPhone(phone) {
        const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
        return phoneRegex.test(phone.replace(/\s/g, ''));
    }
};

// Export for use in other files
window.supabaseAuth = auth;
window.supabaseDB = database;
window.supabaseUtils = utils; 