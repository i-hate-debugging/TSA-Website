// Simple TSA App Initialization - Always Works
(function() {
    'use strict';
    
    // ⚠️ REPLACE THESE WITH YOUR ACTUAL SUPABASE CREDENTIALS ⚠️
    // Get these from: https://supabase.com/dashboard → Your Project → Settings → API
    window.SUPABASE_URL = 'https://riovrrxkeieujbjrwiwq.supabase.co'; // e.g., 'https://xxxxx.supabase.co'
    window.SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJpb3ZycnhrZWlldWpianJ3aXdxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk2MTg5MTksImV4cCI6MjA2NTE5NDkxOX0.w7otW-sRcUh2mc_O1FejOhcPW81YDM0s1aPtO2yIaOo'; // The anon/public key from your dashboard
    
    // Admin configuration
    const ADMIN_EMAIL = 'bothellhstsa@gmail.com';
    
    // Simple initialization check
    if (window.TSA_INITIALIZED) {
        return;
    }
    
    console.log('Initializing TSA App...');
    
    // Wait for Supabase to load, then setup everything
    function init() {
        if (typeof supabase === 'undefined') {
            setTimeout(init, 50);
            return;
        }
        
        // Validate credentials before creating client
        if (window.SUPABASE_URL === 'YOUR_SUPABASE_PROJECT_URL' || 
            window.SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY') {
            console.error('❌ Please update your Supabase credentials in js/app-init.js');
            console.error('📚 Get them from: https://supabase.com/dashboard → Your Project → Settings → API');
            
            if (window.notify) {
                window.notify('Please configure Supabase credentials. Check console for instructions.', 'error');
            }
            return;
        }
        
        // Create Supabase client
        window.supabase = supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);
        
        // Admin role checking
        window.isAdmin = function(user) {
            return user && user.email === ADMIN_EMAIL;
        };
        
        // Simple auth helpers
        window.auth = {
            async getCurrentUser() {
                const { data: { user }, error } = await window.supabase.auth.getUser();
                return { user, error };
            },
            
            async signIn(email, password) {
                return await window.supabase.auth.signInWithPassword({ email, password });
            },
            
            async signUp(email, password, userData) {
                return await window.supabase.auth.signUp({
                    email,
                    password,
                    options: { data: userData }
                });
            },
            
            async signOut() {
                return await window.supabase.auth.signOut();
            },
            
            async requireAdmin() {
                const { user } = await this.getCurrentUser();
                if (!window.isAdmin(user)) {
                    window.notify('Access denied. Admin privileges required.', 'error');
                    window.location.href = 'index.html';
                    return false;
                }
                return true;
            }
        };
        
        // Simple database helpers
        window.db = {
            async createProfile(userId, data) {
                return await window.supabase
                    .from('user_profiles')
                    .insert([{ user_id: userId, ...data }]);
            },
            
            async getUsers() {
                return await window.supabase
                    .from('user_profiles')
                    .select('*')
                    .order('created_at', { ascending: false });
            },
            
            async getEvents() {
                return await window.supabase
                    .from('events')
                    .select('*')
                    .order('event_date', { ascending: true });
            }
        };
        
        // Simple notification system
        window.notify = function(message, type = 'info') {
            const colors = {
                success: '#4caf50',
                error: '#f44336', 
                info: '#2196f3',
                warning: '#ff9800'
            };
            
            // Remove existing notifications
            document.querySelectorAll('.tsa-notification').forEach(n => n.remove());
            
            const notification = document.createElement('div');
            notification.className = 'tsa-notification';
            notification.innerHTML = `
                <span>${message}</span>
                <button onclick="this.parentElement.remove()" style="background:none;border:none;color:white;font-size:18px;cursor:pointer;margin-left:10px;">&times;</button>
            `;
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${colors[type]};
                color: white;
                padding: 15px 20px;
                border-radius: 5px;
                box-shadow: 0 2px 10px rgba(0,0,0,0.2);
                z-index: 10000;
                font-family: Inter, sans-serif;
                display: flex;
                align-items: center;
            `;
            
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 5000);
        };
        
        // Simple navigation update with admin role checking
        function updateNav() {
            window.auth.getCurrentUser().then(({ user }) => {
                const signInLink = document.querySelector('a[href="signin.html"]');
                const signUpLink = document.querySelector('a[href="signup.html"]');
                
                if (user) {
                    // User is signed in
                    if (window.isAdmin(user)) {
                        // Admin user - show Admin link
                        if (signInLink) {
                            signInLink.textContent = 'Admin';
                            signInLink.href = 'admin.html';
                        }
                    } else {
                        // Regular user - show Dashboard or Profile link
                        if (signInLink) {
                            signInLink.textContent = 'Profile';
                            signInLink.href = '#';
                            signInLink.onclick = (e) => {
                                e.preventDefault();
                                window.notify('Profile page coming soon!', 'info');
                            };
                        }
                    }
                    
                    // Update sign up to sign out for all authenticated users
                    if (signUpLink) {
                        signUpLink.textContent = 'Sign Out';
                        signUpLink.href = '#';
                        signUpLink.onclick = async (e) => {
                            e.preventDefault();
                            await window.auth.signOut();
                            window.location.href = 'index.html';
                        };
                    }
                } else {
                    // User not signed in - show default links
                    if (signInLink) {
                        signInLink.textContent = 'Sign In';
                        signInLink.href = 'signin.html';
                        signInLink.onclick = null;
                    }
                    if (signUpLink) {
                        signUpLink.textContent = 'Sign Up';
                        signUpLink.href = 'signup.html';
                        signUpLink.onclick = null;
                    }
                }
            }).catch(() => {
                // User not signed in, keep default links
            });
        }
        
        // Listen for auth changes
        window.supabase.auth.onAuthStateChange((event, session) => {
            updateNav();
        });
        
        // Initial nav update
        updateNav();
        
        // Mark as initialized
        window.TSA_INITIALIZED = true;
        console.log('✅ TSA App initialized successfully');
    }
    
    // Start initialization
    init();
})(); 