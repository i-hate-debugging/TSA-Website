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
    const confirmPasswordToggle = document.getElementById('confirmPasswordToggle');
    const passwordInput = document.getElementById('password');
    const confirmPasswordInput = document.getElementById('confirmPassword');
    
    if (passwordToggle && passwordInput) {
        passwordToggle.addEventListener('click', function() {
            const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            passwordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? 
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>' :
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
        });
    }
    
    if (confirmPasswordToggle && confirmPasswordInput) {
        confirmPasswordToggle.addEventListener('click', function() {
            const type = confirmPasswordInput.getAttribute('type') === 'password' ? 'text' : 'password';
            confirmPasswordInput.setAttribute('type', type);
            this.innerHTML = type === 'password' ? 
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/></svg>' :
                '<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 7c2.76 0 5 2.24 5 5 0 .65-.13 1.26-.36 1.83l2.92 2.92c1.51-1.26 2.7-2.89 3.43-4.75-1.73-4.39-6-7.5-11-7.5-1.4 0-2.74.25-3.98.7l2.16 2.16C10.74 7.13 11.35 7 12 7zM2 4.27l2.28 2.28.46.46C3.08 8.3 1.78 10.02 1 12c1.73 4.39 6 7.5 11 7.5 1.55 0 3.03-.3 4.38-.84l.42.42L19.73 22 21 20.73 3.27 3 2 4.27zM7.53 9.8l1.55 1.55c-.05.21-.08.43-.08.65 0 1.66 1.34 3 3 3 .22 0 .44-.03.65-.08l1.55 1.55c-.67.33-1.41.53-2.2.53-2.76 0-5-2.24-5-5 0-.79.2-1.53.53-2.2zm4.31-.78l3.15 3.15.02-.16c0-1.66-1.34-3-3-3l-.17.01z"/></svg>';
        });
    }
    
    // Password strength indicator
    if (passwordInput) {
        passwordInput.addEventListener('input', function() {
            updatePasswordStrength(this.value);
        });
    }
    
    // Form validation and submission
    const signupForm = document.getElementById('signupForm');
    
    if (signupForm) {
        // Real-time validation
        const firstNameInput = document.getElementById('firstName');
        const lastNameInput = document.getElementById('lastName');
        const emailInput = document.getElementById('email');
        const gradeInput = document.getElementById('grade');
        const phoneInput = document.getElementById('phone');
        const parentEmailInput = document.getElementById('parentEmail');
        const parentPhoneInput = document.getElementById('parentPhone');
        
        // First name validation
        firstNameInput.addEventListener('blur', function() {
            validateFirstName(this);
        });
        
        firstNameInput.addEventListener('input', function() {
            clearError(this);
        });
        
        // Last name validation
        lastNameInput.addEventListener('blur', function() {
            validateLastName(this);
        });
        
        lastNameInput.addEventListener('input', function() {
            clearError(this);
        });
        
        // Email validation
        emailInput.addEventListener('blur', function() {
            validateEmail(this);
        });
        
        emailInput.addEventListener('input', function() {
            clearError(this);
        });
        
        // Grade validation
        gradeInput.addEventListener('change', function() {
            validateGrade(this);
        });
        
        // Phone validation
        phoneInput.addEventListener('blur', function() {
            validatePhone(this);
        });
        
        phoneInput.addEventListener('input', function() {
            clearError(this);
        });
        
        // Parent email validation
        parentEmailInput.addEventListener('blur', function() {
            validateParentEmail(this);
        });
        
        parentEmailInput.addEventListener('input', function() {
            clearError(this);
        });
        
        // Parent phone validation
        parentPhoneInput.addEventListener('blur', function() {
            validateParentPhone(this);
        });
        
        parentPhoneInput.addEventListener('input', function() {
            clearError(this);
        });
        
        // Password validation
        passwordInput.addEventListener('blur', function() {
            validatePassword(this);
        });
        
        passwordInput.addEventListener('input', function() {
            clearError(this);
        });
        
        // Confirm password validation
        confirmPasswordInput.addEventListener('blur', function() {
            validateConfirmPassword(this);
        });
        
        confirmPasswordInput.addEventListener('input', function() {
            clearError(this);
        });
        
        // Form submission with Supabase integration
        signupForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            console.log('Form submitted, starting validation...');
            
            // Validate all fields
            const isFirstNameValid = validateFirstName(firstNameInput);
            const isLastNameValid = validateLastName(lastNameInput);
            const isEmailValid = validateEmail(emailInput);
            const isGradeValid = validateGrade(gradeInput);
            const isPhoneValid = validatePhone(phoneInput);
            const isParentEmailValid = validateParentEmail(parentEmailInput);
            const isParentPhoneValid = validateParentPhone(parentPhoneInput);
            const isPasswordValid = validatePassword(passwordInput);
            const isConfirmPasswordValid = validateConfirmPassword(confirmPasswordInput);
            
            console.log('Validation results:', {
                isFirstNameValid,
                isLastNameValid,
                isEmailValid,
                isGradeValid,
                isPhoneValid,
                isParentEmailValid,
                isParentPhoneValid,
                isPasswordValid,
                isConfirmPasswordValid
            });
            
            if (isFirstNameValid && isLastNameValid && isEmailValid && isGradeValid && 
                isPhoneValid && isParentEmailValid && isParentPhoneValid && 
                isPasswordValid && isConfirmPasswordValid) {
                
                console.log('All validation passed, preparing user data...');
                
                // Show loading state
                const submitBtn = this.querySelector('.signup-btn');
                const btnText = submitBtn.querySelector('.btn-text');
                const btnLoader = submitBtn.querySelector('.btn-loader');
                
                btnText.style.display = 'none';
                btnLoader.style.display = 'flex';
                submitBtn.classList.add('loading');
                
                try {
                    // Prepare user data
                    const userData = {
                        firstName: firstNameInput.value.trim(),
                        lastName: lastNameInput.value.trim(),
                        email: emailInput.value.trim(),
                        grade: gradeInput.value,
                        phone: phoneInput.value.trim(),
                        parentEmail: parentEmailInput.value.trim(),
                        parentPhone: parentPhoneInput.value.trim(),
                        password: passwordInput.value
                    };
                    
                    console.log('User data prepared:', userData);
                    console.log('Supabase auth object:', supabaseAuth);
                    
                    // Sign up with Supabase
                    console.log('Calling supabaseAuth.signUp...');
                    const { data, error } = await supabaseAuth.signUp(userData);
                    
                    console.log('SignUp response:', { data, error });
                    
                    if (error) {
                        throw error;
                    }
                    
                    if (data.user) {
                        console.log('User created successfully:', data.user);
                        
                        // Insert user profile into database
                        console.log('Inserting user profile...');
                        const profileResult = await supabaseDB.insertUserProfile(data.user.id, userData);
                        
                        console.log('Profile insertion result:', profileResult);
                        
                        if (profileResult.error) {
                            console.error('Profile creation error:', profileResult.error);
                            // Don't throw here as the user account was created successfully
                        }
                        
                        // Show success message
                        supabaseUtils.showNotification('Account created successfully! Please check your email to verify your account.', 'success');
                        
                        // Redirect to home page after a short delay
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 3000);
                    } else {
                        console.log('No user data returned from signup');
                        supabaseUtils.showNotification('Account created but no user data returned. Please check your email.', 'warning');
                    }
                    
                } catch (error) {
                    console.error('Signup error:', error);
                    
                    let errorMessage = 'An error occurred during signup. Please try again.';
                    
                    if (error.message) {
                        if (error.message.includes('already registered')) {
                            errorMessage = 'An account with this email already exists. Please sign in instead.';
                        } else if (error.message.includes('password')) {
                            errorMessage = 'Password must be at least 6 characters long.';
                        } else if (error.message.includes('email')) {
                            errorMessage = 'Please enter a valid email address.';
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
            } else {
                console.log('Validation failed, not proceeding with signup');
            }
        });
    }
    
    // Social sign-up buttons
    const googleBtn = document.querySelector('.google-btn');
    const microsoftBtn = document.querySelector('.microsoft-btn');
    
    if (googleBtn) {
        googleBtn.addEventListener('click', function() {
            supabaseUtils.showNotification('Google sign-up functionality would be implemented here', 'info');
        });
    }
    
    if (microsoftBtn) {
        microsoftBtn.addEventListener('click', function() {
            supabaseUtils.showNotification('Microsoft sign-up functionality would be implemented here', 'info');
        });
    }
    
    // Validation functions
    function validateFirstName(input) {
        const firstName = input.value.trim();
        
        if (!firstName) {
            showError(input, 'First name is required');
            return false;
        }
        
        if (firstName.length < 2) {
            showError(input, 'First name must be at least 2 characters long');
            return false;
        }
        
        if (!/^[a-zA-Z\s]+$/.test(firstName)) {
            showError(input, 'First name can only contain letters and spaces');
            return false;
        }
        
        clearError(input);
        return true;
    }
    
    function validateLastName(input) {
        const lastName = input.value.trim();
        
        if (!lastName) {
            showError(input, 'Last name is required');
            return false;
        }
        
        if (lastName.length < 2) {
            showError(input, 'Last name must be at least 2 characters long');
            return false;
        }
        
        if (!/^[a-zA-Z\s]+$/.test(lastName)) {
            showError(input, 'Last name can only contain letters and spaces');
            return false;
        }
        
        clearError(input);
        return true;
    }
    
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
    
    function validateGrade(input) {
        const grade = input.value;
        
        if (!grade) {
            showError(input, 'Please select your grade level');
            return false;
        }
        
        clearError(input);
        return true;
    }
    
    function validatePhone(input) {
        const phone = input.value.trim();
        
        if (!phone) {
            showError(input, 'Phone number is required');
            return false;
        }
        
        if (!supabaseUtils.isValidPhone(phone)) {
            showError(input, 'Please enter a valid phone number');
            return false;
        }
        
        clearError(input);
        return true;
    }
    
    function validateParentEmail(input) {
        const parentEmail = input.value.trim();
        
        if (!parentEmail) {
            showError(input, 'Parent email is required');
            return false;
        }
        
        if (!supabaseUtils.isValidEmail(parentEmail)) {
            showError(input, 'Please enter a valid parent email address');
            return false;
        }
        
        clearError(input);
        return true;
    }
    
    function validateParentPhone(input) {
        const parentPhone = input.value.trim();
        
        if (!parentPhone) {
            showError(input, 'Parent phone number is required');
            return false;
        }
        
        if (!supabaseUtils.isValidPhone(parentPhone)) {
            showError(input, 'Please enter a valid parent phone number');
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
        
        if (password.length < 6) {
            showError(input, 'Password must be at least 6 characters long');
            return false;
        }
        
        const hasUpperCase = /[A-Z]/.test(password);
        const hasLowerCase = /[a-z]/.test(password);
        const hasNumbers = /\d/.test(password);
        
        if (!hasUpperCase || !hasLowerCase || !hasNumbers) {
            showError(input, 'Password must contain uppercase, lowercase, and numbers');
            return false;
        }
        
        clearError(input);
        return true;
    }
    
    function validateConfirmPassword(input) {
        const confirmPassword = input.value;
        const password = document.getElementById('password').value;
        
        if (!confirmPassword) {
            showError(input, 'Please confirm your password');
            return false;
        }
        
        if (confirmPassword !== password) {
            showError(input, 'Passwords do not match');
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
    
    // Password strength indicator
    function updatePasswordStrength(password) {
        const strengthFill = document.getElementById('strengthFill');
        const strengthText = document.getElementById('strengthText');
        
        if (!strengthFill || !strengthText) return;
        
        let strength = 0;
        let strengthLabel = '';
        let strengthClass = '';
        
        // Length check
        if (password.length >= 6) strength += 25;
        if (password.length >= 8) strength += 25;
        
        // Character variety checks
        if (/[A-Z]/.test(password)) strength += 25;
        if (/[a-z]/.test(password)) strength += 25;
        if (/\d/.test(password)) strength += 25;
        if (/[^A-Za-z0-9]/.test(password)) strength += 25;
        
        // Cap at 100%
        strength = Math.min(strength, 100);
        
        // Determine strength level
        if (strength < 25) {
            strengthLabel = 'Very Weak';
            strengthClass = 'weak';
        } else if (strength < 50) {
            strengthLabel = 'Weak';
            strengthClass = 'weak';
        } else if (strength < 75) {
            strengthLabel = 'Fair';
            strengthClass = 'fair';
        } else if (strength < 100) {
            strengthLabel = 'Good';
            strengthClass = 'good';
        } else {
            strengthLabel = 'Strong';
            strengthClass = 'strong';
        }
        
        // Update UI
        strengthFill.className = `strength-fill ${strengthClass}`;
        strengthText.textContent = strengthLabel;
    }
    
    // Add keyboard navigation
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && document.activeElement.tagName === 'INPUT') {
            const form = document.getElementById('signupForm');
            if (form) {
                form.dispatchEvent(new Event('submit'));
            }
        }
    });
}); 