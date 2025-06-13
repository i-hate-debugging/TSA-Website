// Environment Configuration
// This file loads environment variables for Supabase configuration

(function() {
    'use strict';
    
    // Function to load environment variables from .env file
    async function loadEnvFile() {
        try {
            const response = await fetch('/.env');
            if (response.ok) {
                const envContent = await response.text();
                const envVars = {};
                
                // Parse .env file content
                envContent.split('\n').forEach(line => {
                    const trimmedLine = line.trim();
                    if (trimmedLine && !trimmedLine.startsWith('#')) {
                        const [key, ...valueParts] = trimmedLine.split('=');
                        if (key && valueParts.length > 0) {
                            envVars[key.trim()] = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
                        }
                    }
                });
                
                return envVars;
            }
        } catch (error) {
            console.warn('Could not load .env file:', error.message);
        }
        return {};
    }
    
    // Function to get environment variable with fallback
    function getEnvVar(key, fallback = null) {
        // Try to get from window object first (for development)
        if (window[key]) {
            return window[key];
        }
        
        // Try to get from loaded env vars
        if (window.envVars && window.envVars[key]) {
            return window.envVars[key];
        }
        
        // Return fallback
        return fallback;
    }
    
    // Initialize environment variables
    async function initEnv() {
        // Load .env file
        window.envVars = await loadEnvFile();
        
        // Set up Supabase configuration
        window.SUPABASE_URL = getEnvVar('SUPABASE_URL', 'https://riovrrxkeieujbjrwiwq.supabase.co');
        window.SUPABASE_ANON_KEY = getEnvVar('SUPABASE_ANON_KEY', 'YOUR_SUPABASE_ANON_KEY_HERE');
        
        console.log('Environment configuration loaded');
        console.log('SUPABASE_URL:', window.SUPABASE_URL);
        console.log('SUPABASE_ANON_KEY:', window.SUPABASE_ANON_KEY ? '***' + window.SUPABASE_ANON_KEY.slice(-4) : 'Not set');
        
        // Check if we have valid configuration
        if (window.SUPABASE_ANON_KEY === 'YOUR_SUPABASE_ANON_KEY_HERE') {
            console.warn('⚠️  Supabase configuration not found. Please set up your environment variables.');
            console.warn('📝 Create a .env file in the root directory with:');
            console.warn('   SUPABASE_URL=your_supabase_url');
            console.warn('   SUPABASE_ANON_KEY=your_supabase_anon_key');
        }
    }
    
    // Initialize when DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initEnv);
    } else {
        initEnv();
    }
    
    // Export for use in other files
    window.getEnvVar = getEnvVar;
    window.initEnv = initEnv;
})(); 