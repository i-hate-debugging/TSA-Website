// Mobile Navigation Toggle
document.addEventListener('DOMContentLoaded', function() {
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
    
    // Password toggle functionality
    const passwordToggle = document.getElementById('passwordToggle');
    const passwordInput = document.getElementById('password');
    
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? 
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>' :
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
        });
    }
    
    // Form validation and submission
    const signinForm = document.getElementById('signinForm');
    
    if (signinForm) {
        // Real-time validation
        const emailInput = document.getElementById('email');
        const passwordInput = document.getElementById('password');
        
        // Email validation
        emailInput.addEventListener('blur', function() {
            validateEmail(this);
        });
        
        emailInput.addEventListener('input', function() {
            clearError(this);
        });
        
        // Password validation
        passwordInput.addEventListener('blur', function() {
            validatePassword(this);
        });
        
        passwordInput.addEventListener('input', function() {
            clearError(this);
        });
        
        // Form submission with Supabase integration
        signinForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Validate all fields
            const isEmailValid = validateEmail(emailInput);
            const isPasswordValid = validatePassword(passwordInput);
            
            if (isEmailValid && isPasswordValid) {
                // Show loading state
                const submitBtn = this.querySelector('.signin-btn');
                const btnText = submitBtn.querySelector('.btn-text');
                const btnLoader = submitBtn.querySelector('.btn-loader');
                
                btnText.style.display = 'none';
                btnLoader.style.display = 'flex';
                submitBtn.classList.add('loading');
                
                try {
                    // Sign in with Supabase
                    const { data, error } = await supabaseAuth.signIn(emailInput.value.trim(), passwordInput.value);
                    
                    if (error) {
                        throw error;
                    }
                    
                    if (data.user) {
                        // Show success message
                        supabaseUtils.showNotification('Welcome back! Signing you in...', 'success');
                        
                        // Redirect to home page after a short delay
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 2000);
                    }
                    
                } catch (error) {
                    console.error('Signin error:', error);
                    
                    let errorMessage = 'An error occurred during sign in. Please try again.';
                    
                    if (error.message) {
                        if (error.message.includes('Invalid login credentials')) {
                            errorMessage = 'Invalid email or password. Please try again.';
                        } else if (error.message.includes('Email not confirmed')) {
                            errorMessage = 'Please check your email and confirm your account before signing in.';
                        } else {
                            errorMessage = error.message;
                        }
                    }
                    
                    supabaseUtils.showNotification(errorMessage, 'error');
                } finally {
                    // Reset button state
                    btnText.style.display = 'inline';
                    btnLoader.style.display = 'none';
                    submitBtn.classList.remove('loading');
                }
            }
        });
    }
    
    // Social sign-in buttons
    const googleBtn = document.querySelector('.google-btn');
    const microsoftBtn = document.querySelector('.microsoft-btn');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            supabaseUtils.showNotification('Google sign-in functionality would be implemented here', 'info');
        });
    }
    
    if (microsoftBtn) {
        microsoftBtn.addEventListener('click', function() {
            supabaseUtils.showNotification('Microsoft sign-in functionality would be implemented here', 'info');
        });
    }
    
    // Forgot password functionality
    const forgotPasswordLink = document.querySelector('.forgot-password');
    if (forgotPasswordLink) {
        forgotPasswordLink.addEventListener('click', function(e) {
            e.preventDefault();
            supabaseUtils.showNotification('Password reset functionality would be implemented here', 'info');
        });
    }
    
    // Validation functions
    function validateEmail(input) {
        const email = input.value.trim();
        
        if (!email) {
            showError(input, 'Email is required');
            return false;
        }
        
        if (!supabaseUtils.isValidEmail(email)) {
            showError(input, 'Please enter a valid email address');
            return false;
        }
        
        clearError(input);
        return true;
    }
    
    function validatePassword(input) {
        const password = input.value;
        
        if (!password) {
            showError(input, 'Password is required');
            return false;
        }
        
        clearError(input);
        return true;
    }
    
    function showError(input, message) {
        const errorElement = document.getElementById(input.id + 'Error');
        if (errorElement) {
            errorElement.textContent = message;
            input.classList.add('error');
        }
    }
    
    function clearError(input) {
        const errorElement = document.getElementById(input.id + 'Error');
        if (errorElement) {
            errorElement.textContent = '';
            input.classList.remove('error');
        }
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
            const form = document.getElementById('signinForm');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    });
}); 