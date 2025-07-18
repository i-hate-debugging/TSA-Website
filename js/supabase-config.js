// Supabase Configuration and Helper Functions - Optimized with Singleton Pattern

(function() {
    'use strict';
    
    // Check if Supabase is already initialized (singleton pattern)
    if (window.supabaseInitialized) {
        console.log('Supabase already initialized, skipping...');
        return;
    }
    
    // Wait for environment configuration
    function waitForEnvConfig(callback, maxRetries = 50) {
        if (window.SUPABASE_URL && window.SUPABASE_ANON_KEY && window.envReady) {
            callback();
        } else if (maxRetries > 0) {
            requestAnimationFrame(() => waitForEnvConfig(callback, maxRetries - 1));
        } else {
            console.error('Supabase configuration timeout. Environment variables not available.');
        }
    }
    
    waitForEnvConfig(() => {
        // Initialize Supabase client only once
        if (!window.supabase) {
            if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
                console.error('Supabase not properly configured. Please check your environment variables.');
                return;
            }
            
            console.log('Creating Supabase client...');
            window.supabase = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        }
        
        // Authentication helper functions (singleton)
        if (!window.supabaseAuth) {
            window.supabaseAuth = {
                // Sign up a new user
    async signUp(userData) {
                    console.log('Signing up user:', { email: userData.email, ...userData });
                    
                    const { data, error } = await window.supabase.auth.signUp({
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

                    return { data, error };
                },
                
                // Sign in an existing user
    async signIn(email, password) {
                    console.log('Signing in user:', email);
                    
                    const { data, error } = await window.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

                    return { data, error };
                },
                
                // Sign out current user
    async signOut() {
                    console.log('Signing out user');
                    
                    const { error } = await window.supabase.auth.signOut();
            return { error };
    },

    // Get current user
    async getCurrentUser() {
                    const { data: { user }, error } = await window.supabase.auth.getUser();
                    return { user, error };
                },
                
                // Listen for auth state changes
                onAuthStateChange(callback) {
                    return window.supabase.auth.onAuthStateChange(callback);
                }
            };
        }
        
        // Database helper functions (singleton)
        if (!window.supabaseDB) {
            window.supabaseDB = {
                // Insert user profile
    async insertUserProfile(userId, userData) {
                    console.log('Inserting user profile:', { userId, userData });
                    
                    const { data, error } = await window.supabase
                .from('user_profiles')
                        .insert([{
                        user_id: userId,
                        first_name: userData.firstName,
                        last_name: userData.lastName,
                        email: userData.email,
                            grade: parseInt(userData.grade),
                        phone: userData.phone,
                        parent_email: userData.parentEmail,
                            parent_phone: userData.parentPhone
                        }])
                        .select();
                    
                    return { data, error };
    },

    // Get user profile
    async getUserProfile(userId) {
                    const { data, error } = await window.supabase
                .from('user_profiles')
                .select('*')
                .eq('user_id', userId)
                .single();

                    return { data, error };
    },

    // Update user profile
    async updateUserProfile(userId, updates) {
                    const { data, error } = await window.supabase
                .from('user_profiles')
                .update(updates)
                        .eq('user_id', userId)
                        .select();
                    
                    return { data, error };
                },
                
                // Get all users (admin function)
                async getAllUsers() {
                    const { data, error } = await window.supabase
                        .from('user_profiles')
                        .select('*')
                        .order('created_at', { ascending: false });
                    
                    return { data, error };
                },
                
                // Delete user (admin function)
                async deleteUser(userId) {
                    const { data, error } = await window.supabase
                        .from('user_profiles')
                        .delete()
                        .eq('user_id', userId);
                    
                    return { data, error };
                },
                
                // Event functions
                async getAllEvents() {
                    const { data, error } = await window.supabase
                        .from('events')
                        .select('*')
                        .order('event_date', { ascending: true });
                    
                    return { data, error };
                },
                
                async createEvent(eventData) {
                    const { data, error } = await window.supabase
                        .from('events')
                        .insert([eventData])
                        .select();
                    
                    return { data, error };
                },
                
                async updateEvent(eventId, updates) {
                    const { data, error } = await window.supabase
                        .from('events')
                        .update(updates)
                        .eq('id', eventId)
                        .select();
                    
                    return { data, error };
                },
                
                async deleteEvent(eventId) {
                    const { data, error } = await window.supabase
                        .from('events')
                        .delete()
                        .eq('id', eventId);
                    
                    return { data, error };
                },
                
                // Event registration functions
                async registerForEvent(eventId, userId) {
                    const { data, error } = await window.supabase
                        .from('event_registrations')
                        .insert([{
                            event_id: eventId,
                            user_id: userId
                        }])
                        .select();
                    
                    return { data, error };
                },
                
                async unregisterFromEvent(eventId, userId) {
                    const { data, error } = await window.supabase
                        .from('event_registrations')
                        .delete()
                        .eq('event_id', eventId)
                        .eq('user_id', userId);
                    
                    return { data, error };
                },
                
                async getEventRegistrations(eventId) {
                    const { data, error } = await window.supabase
                        .from('event_registrations')
                        .select(`
                            *,
                            user_profiles (
                                first_name,
                                last_name,
                                email,
                                grade
                            )
                        `)
                        .eq('event_id', eventId);
                    
                    return { data, error };
                },
                
                async getUserRegistrations(userId) {
                    const { data, error } = await window.supabase
                        .from('event_registrations')
                        .select(`
                            *,
                            events (
                                title,
                                description,
                                event_date,
                                location
                            )
                        `)
                .eq('user_id', userId);

                    return { data, error };
                }
            };
        }
        
        // Utility functions (singleton)
        if (!window.supabaseUtils) {
            window.supabaseUtils = {
                // Email validation
                isValidEmail(email) {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    return emailRegex.test(email);
                },
                
                // Phone validation
                isValidPhone(phone) {
                    const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/;
                    const cleanPhone = phone.replace(/[\s\-\(\)\.]/g, '');
                    return cleanPhone.length >= 10 && phoneRegex.test(cleanPhone);
                },
                
                // Format date
                formatDate(dateString) {
                    return new Date(dateString).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                    });
                },
                
                // Format date and time
                formatDateTime(dateString) {
                    return new Date(dateString).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit'
                    });
                },
                
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
                    const colors = {
                        success: '#4caf50',
                        error: '#f44336',
                        info: '#2196f3',
                        warning: '#ff9800'
                    };
                    
        notification.style.cssText = `
            position: fixed;
            top: 100px;
            right: 20px;
                        background: ${colors[type] || colors.info};
            color: white;
            padding: 1rem 1.5rem;
            border-radius: 8px;
            box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
            z-index: 10000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            max-width: 400px;
                        font-size: 0.9rem;
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

                // Debounce function
                debounce(func, wait) {
                    let timeout;
                    return function executedFunction(...args) {
                        const later = () => {
                            clearTimeout(timeout);
                            func(...args);
                        };
                        clearTimeout(timeout);
                        timeout = setTimeout(later, wait);
                    };
                },
                
                // Generate UUID
                generateUUID() {
                    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                        const r = Math.random() * 16 | 0;
                        const v = c == 'x' ? r : (r & 0x3 | 0x8);
                        return v.toString(16);
                    });
                }
            };
        }
        
        // Mark as initialized to prevent re-initialization
        window.supabaseInitialized = true;
        
        console.log('Supabase configuration loaded successfully (singleton)');
        console.log('Available functions:', {
            auth: Object.keys(window.supabaseAuth),
            db: Object.keys(window.supabaseDB),
            utils: Object.keys(window.supabaseUtils)
        });
    });
    
})(); 