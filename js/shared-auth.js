// Shared Authentication Module - Loads Once, Works Everywhere

(function() {
    'use strict';
    
    // Singleton pattern - prevent multiple initializations
    if (window.TSAAuth) {
        console.log('TSA Auth already initialized');
        return;
    }
    
    // Authentication state cache
    const AUTH_CACHE_KEY = 'tsa_auth_state';
    const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes
    
    class TSAAuth {
        constructor() {
            this.initialized = false;
            this.authStateListeners = [];
            this.currentUser = null;
            this.supabaseReady = false;
        }
        
        // Initialize only once
        async init() {
            if (this.initialized) return;
            
            try {
                // Wait for dependencies
                await this.waitForDependencies();
                
                // Load cached auth state
                this.loadCachedAuthState();
                
                // Set up auth state listener
                this.setupAuthListener();
                
                this.initialized = true;
                console.log('TSA Auth initialized successfully');
                
                // Notify listeners that auth is ready
                this.notifyListeners('auth_ready', { user: this.currentUser });
                
            } catch (error) {
                console.error('Failed to initialize TSA Auth:', error);
            }
        }
        
        // Wait for Supabase dependencies
        waitForDependencies(maxRetries = 100) {
            return new Promise((resolve, reject) => {
                const check = (retries) => {
                    if (window.supabase && window.supabaseAuth && window.SUPABASE_URL) {
                        this.supabaseReady = true;
                        resolve();
                    } else if (retries > 0) {
                        requestAnimationFrame(() => check(retries - 1));
                    } else {
                        reject(new Error('Supabase dependencies not available'));
                    }
                };
                check(maxRetries);
            });
        }
        
        // Load cached authentication state
        loadCachedAuthState() {
            try {
                const cached = localStorage.getItem(AUTH_CACHE_KEY);
                if (cached) {
                    const { user, timestamp } = JSON.parse(cached);
                    if (Date.now() - timestamp < CACHE_DURATION) {
                        this.currentUser = user;
                        console.log('Loaded auth state from cache');
                        return;
                    }
                }
            } catch (error) {
                console.warn('Failed to load cached auth state:', error);
            }
            
            // If no valid cache, check with Supabase
            this.checkAuthState();
        }
        
        // Save auth state to cache
        saveAuthStateToCache(user) {
            try {
                localStorage.setItem(AUTH_CACHE_KEY, JSON.stringify({
                    user: user,
                    timestamp: Date.now()
                }));
            } catch (error) {
                console.warn('Failed to cache auth state:', error);
            }
        }
        
        // Clear auth cache
        clearAuthCache() {
            try {
                localStorage.removeItem(AUTH_CACHE_KEY);
            } catch (error) {
                console.warn('Failed to clear auth cache:', error);
            }
        }
        
        // Check current authentication state
        async checkAuthState() {
            if (!this.supabaseReady) return;
            
            try {
                const { user } = await window.supabaseAuth.getCurrentUser();
                this.currentUser = user;
                this.saveAuthStateToCache(user);
                return user;
            } catch (error) {
                console.error('Failed to check auth state:', error);
                this.currentUser = null;
                this.clearAuthCache();
                return null;
            }
        }
        
        // Set up auth state listener
        setupAuthListener() {
            if (!this.supabaseReady) return;
            
            window.supabase.auth.onAuthStateChange((event, session) => {
                console.log('Auth state changed:', event);
                
                const user = session?.user || null;
                this.currentUser = user;
                
                if (user) {
                    this.saveAuthStateToCache(user);
                } else {
                    this.clearAuthCache();
                }
                
                // Notify all listeners
                this.notifyListeners('auth_change', { event, user, session });
            });
        }
        
        // Add auth state listener
        onAuthChange(callback) {
            this.authStateListeners.push(callback);
            
            // If already initialized, call immediately
            if (this.initialized) {
                callback('auth_ready', { user: this.currentUser });
            }
        }
        
        // Notify all listeners
        notifyListeners(event, data) {
            this.authStateListeners.forEach(callback => {
                try {
                    callback(event, data);
                } catch (error) {
                    console.error('Auth listener error:', error);
                }
            });
        }
        
        // Get current user (from cache if available)
        getCurrentUser() {
            return this.currentUser;
        }
        
        // Check if user is authenticated
        isAuthenticated() {
            return !!this.currentUser;
        }
        
        // Sign out and clear cache
        async signOut() {
            if (!this.supabaseReady) return;
            
            try {
                await window.supabaseAuth.signOut();
                this.currentUser = null;
                this.clearAuthCache();
            } catch (error) {
                console.error('Sign out error:', error);
            }
        }
        
        // Update navigation based on auth state
        updateNavigation() {
            const signInLink = document.querySelector('a[href="signin.html"]');
            const signUpLink = document.querySelector('a[href="signup.html"]');
            
            if (this.isAuthenticated()) {
                // User is signed in
                if (signInLink) {
                    signInLink.textContent = 'Admin';
                    signInLink.href = 'admin.html';
                }
                if (signUpLink) {
                    signUpLink.textContent = 'Sign Out';
                    signUpLink.href = '#';
                    signUpLink.onclick = async (e) => {
                        e.preventDefault();
                        await this.signOut();
                        window.location.reload();
                    };
                }
            } else {
                // User is signed out
                if (signInLink) {
                    signInLink.textContent = 'Sign In';
                    signInLink.href = 'signin.html';
                }
                if (signUpLink) {
                    signUpLink.textContent = 'Sign Up';
                    signUpLink.href = 'signup.html';
                    signUpLink.onclick = null;
                }
            }
        }
        
        // Require authentication (redirect if not authenticated)
        requireAuth() {
            if (!this.isAuthenticated()) {
                console.log('Authentication required, redirecting...');
                window.location.href = 'signin.html';
                return false;
            }
            return true;
        }
    }
    
    // Create singleton instance
    window.TSAAuth = new TSAAuth();
    
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => window.TSAAuth.init());
    } else {
        window.TSAAuth.init();
    }
    
    // Set up navigation updates
    window.TSAAuth.onAuthChange((event, data) => {
        if (event === 'auth_ready' || event === 'auth_change') {
            window.TSAAuth.updateNavigation();
        }
    });
    
    console.log('TSA Shared Auth module loaded');
    
})(); 