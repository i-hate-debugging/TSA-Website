// Simple TSA Sign In
document.addEventListener('DOMContentLoaded', function() {
    // Mobile menu
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            hamburger.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
    }
    
    // Password toggle
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            this.innerHTML = type === 'password' ? 
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>' :
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
        });
    }
    
    // Form submission
    const signinForm = document.getElementById('signinForm');
    
    if (signinForm) {
        signinForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            // Simple validation
            if (!email) {
                window.notify('Please enter your email', 'error');
                return;
            }
            
            if (!password) {
                window.notify('Please enter your password', 'error');
                return;
            }
            
            // Show loading
            const submitBtn = this.querySelector('.signin-btn');
            const btnText = submitBtn.querySelector('.btn-text');
            const btnLoader = submitBtn.querySelector('.btn-loader');
            
            btnText.style.display = 'none';
            btnLoader.style.display = 'flex';
            submitBtn.disabled = true;
            
            try {
                // Wait for auth to be ready
                let attempts = 0;
                while (!window.auth && attempts < 50) {
                    await new Promise(resolve => setTimeout(resolve, 100));
                    attempts++;
                }
                
                if (!window.auth) {
                    throw new Error('Authentication system not ready. Please refresh the page.');
                }
                
                // Sign in
                const { data, error } = await window.auth.signIn(email, password);
                
                if (error) {
                    throw error;
                }
                
                if (data.user) {
                    // Check if user is admin
                    if (window.isAdmin && window.isAdmin(data.user)) {
                        window.notify('Welcome back, Admin! Redirecting to dashboard...', 'success');
                        setTimeout(() => {
                            window.location.href = 'admin.html';
                        }, 1000);
                    } else {
                        window.notify('Welcome back! Redirecting...', 'success');
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 1000);
                    }
                } else {
                    throw new Error('Sign in failed');
                }
                
            } catch (error) {
                console.error('Sign in error:', error);
                
                let message = 'Sign in failed. Please try again.';
                if (error.message.includes('Invalid login credentials')) {
                    message = 'Invalid email or password.';
                } else if (error.message.includes('Email not confirmed')) {
                    message = 'Please check your email and confirm your account.';
                } else if (error.message.includes('Authentication system not ready')) {
                    message = error.message;
                }
                
                window.notify(message, 'error');
            } finally {
                // Reset button
                btnText.style.display = 'inline';
                btnLoader.style.display = 'none';
                submitBtn.disabled = false;
            }
        });
    }
}); 