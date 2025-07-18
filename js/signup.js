// Simple TSA Sign Up
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
    
    // Password toggles
    const passwordToggle = document.getElementById('passwordToggle');
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.type === 'password' ? 'text' : 'password';
            passwordInput.type = type;
            this.innerHTML = type === 'password' ? 
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>' :
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
        });
    }
    
    if (confirmPasswordToggle && confirmPasswordInput) {
        confirmPasswordToggle.addEventListener('click', function() {
            const type = confirmPasswordInput.type === 'password' ? 'text' : 'password';
            confirmPasswordInput.type = type;
            this.innerHTML = type === 'password' ? 
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>' :
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
        });
    }
    
    // Simple validation helpers
    function isValidEmail(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    }
    
    function isValidPhone(phone) {
        const clean = phone.replace(/[\s\-\(\)\.]/g, '');
        return clean.length >= 10 && /^\d+$/.test(clean);
    }
    
    // Form submission
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            // Get form values
            const firstName = document.getElementById('firstName').value.trim();
            const lastName = document.getElementById('lastName').value.trim();
            const email = document.getElementById('email').value.trim();
            const grade = document.getElementById('grade').value;
            const phone = document.getElementById('phone').value.trim();
            const parentEmail = document.getElementById('parentEmail').value.trim();
            const parentPhone = document.getElementById('parentPhone').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirmPassword').value;
            
            // Simple validation
            if (!firstName || firstName.length < 2) {
                window.notify('Please enter a valid first name', 'error');
                return;
            }
            
            if (!lastName || lastName.length < 2) {
                window.notify('Please enter a valid last name', 'error');
                return;
            }
            
            if (!email || !isValidEmail(email)) {
                window.notify('Please enter a valid email address', 'error');
                return;
            }
            
            if (!grade) {
                window.notify('Please select your grade level', 'error');
                return;
            }
            
            if (!phone || !isValidPhone(phone)) {
                window.notify('Please enter a valid phone number', 'error');
                return;
            }
            
            if (!parentEmail || !isValidEmail(parentEmail)) {
                window.notify('Please enter a valid parent email address', 'error');
                return;
            }
            
            if (!parentPhone || !isValidPhone(parentPhone)) {
                window.notify('Please enter a valid parent phone number', 'error');
                return;
            }
            
            if (!password || password.length < 6) {
                window.notify('Password must be at least 6 characters long', 'error');
                return;
            }
            
            if (password !== confirmPassword) {
                window.notify('Passwords do not match', 'error');
                return;
            }
            
            // Show loading
            const submitBtn = this.querySelector('.signup-btn');
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
                
                // Sign up user
                const userData = {
                    first_name: firstName,
                    last_name: lastName,
                    grade: parseInt(grade),
                    phone: phone,
                    parent_email: parentEmail,
                    parent_phone: parentPhone
                };
                
                const { data, error } = await window.auth.signUp(email, password, userData);
                
                if (error) {
                    throw error;
                }
                
                if (data.user) {
                    // Create profile in database
                    if (window.db) {
                        try {
                            await window.db.createProfile(data.user.id, {
                                first_name: firstName,
                                last_name: lastName,
                                email: email,
                                grade: parseInt(grade),
                                phone: phone,
                                parent_email: parentEmail,
                                parent_phone: parentPhone
                            });
                        } catch (profileError) {
                            console.error('Profile creation error:', profileError);
                        }
                    }
                    
                    window.notify('Account created successfully! Please check your email to verify your account.', 'success');
                    setTimeout(() => {
                        window.location.href = 'index.html';
                    }, 2000);
                } else {
                    throw new Error('Account creation failed');
                }
                
            } catch (error) {
                console.error('Sign up error:', error);
                
                let message = 'Account creation failed. Please try again.';
                if (error.message.includes('already registered')) {
                    message = 'An account with this email already exists. Please sign in instead.';
                } else if (error.message.includes('password')) {
                    message = 'Password must be at least 6 characters long.';
                } else if (error.message.includes('email')) {
                    message = 'Please enter a valid email address.';
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