// Break the Beet - Main JavaScript

// ===========================
// Mobile Navigation Toggle
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    const navToggle = document.querySelector('.nav-toggle');
    const navMenu = document.querySelector('.nav-menu');

    if (navToggle) {
        navToggle.addEventListener('click', function() {
            navToggle.classList.toggle('active');
            navMenu.classList.toggle('active');
        });

        // Close menu when clicking on a link
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.addEventListener('click', function() {
                navToggle.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }

    // Set active nav link based on current page
    const currentPage = window.location.pathname.split('/').pop() || 'index.html';
    const navLinks = document.querySelectorAll('.nav-link');
    navLinks.forEach(link => {
        const href = link.getAttribute('href');
        if (href === currentPage || (currentPage === '' && href === 'index.html')) {
            link.classList.add('active');
        }
    });
});

// ===========================
// Multi-Step Contact Form
// ===========================
const ContactForm = {
    currentStep: 1,
    totalSteps: 2,
    formData: {},

    init: function() {
        this.form = document.getElementById('contactForm');
        if (!this.form) return;

        this.steps = document.querySelectorAll('.form-step');
        this.indicators = document.querySelectorAll('.step-indicator');
        this.nextBtns = document.querySelectorAll('.btn-next');
        this.prevBtns = document.querySelectorAll('.btn-prev');
        this.submitBtn = document.querySelector('.btn-submit');

        this.bindEvents();
        this.showStep(1);
    },

    bindEvents: function() {
        const self = this;

        // Next button clicks
        this.nextBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                if (self.validateStep(self.currentStep)) {
                    self.saveStepData(self.currentStep);
                    self.nextStep();
                }
            });
        });

        // Previous button clicks
        this.prevBtns.forEach(btn => {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                self.prevStep();
            });
        });

        // Form submission
        if (this.submitBtn) {
            this.submitBtn.addEventListener('click', function(e) {
                e.preventDefault();
                if (self.validateStep(self.currentStep)) {
                    self.saveStepData(self.currentStep);
                    self.submitForm();
                }
            });
        }
    },

    showStep: function(step) {
        // Hide all steps
        this.steps.forEach(s => s.classList.remove('active'));

        // Show current step
        const currentStepElement = document.querySelector(`[data-step="${step}"]`);
        if (currentStepElement) {
            currentStepElement.classList.add('active');
        }

        // Update indicators
        this.indicators.forEach((indicator, index) => {
            indicator.classList.remove('active', 'completed');
            if (index + 1 < step) {
                indicator.classList.add('completed');
            } else if (index + 1 === step) {
                indicator.classList.add('active');
            }
        });

        this.currentStep = step;
    },

    nextStep: function() {
        if (this.currentStep < this.totalSteps) {
            this.showStep(this.currentStep + 1);
        }
    },

    prevStep: function() {
        if (this.currentStep > 1) {
            this.showStep(this.currentStep - 1);
        }
    },

    validateStep: function(step) {
        const currentStepElement = document.querySelector(`[data-step="${step}"]`);
        if (!currentStepElement) return false;

        const inputs = currentStepElement.querySelectorAll('input[required], select[required], textarea[required]');
        let isValid = true;

        inputs.forEach(input => {
            if (!input.value.trim()) {
                isValid = false;
                input.style.borderColor = '#e74c3c';

                // Reset border color on input
                input.addEventListener('input', function() {
                    input.style.borderColor = '';
                }, { once: true });
            }
        });

        // Email validation for step 1
        if (step === 1) {
            const emailInput = currentStepElement.querySelector('input[type="email"]');
            if (emailInput && emailInput.value) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!emailRegex.test(emailInput.value)) {
                    isValid = false;
                    emailInput.style.borderColor = '#e74c3c';
                }
            }
        }

        if (!isValid) {
            this.showError('Please fill in all required fields correctly.');
        }

        return isValid;
    },

    saveStepData: function(step) {
        const currentStepElement = document.querySelector(`[data-step="${step}"]`);
        if (!currentStepElement) return;

        const inputs = currentStepElement.querySelectorAll('input, select, textarea');
        inputs.forEach(input => {
            this.formData[input.name] = input.value;
        });
    },

    submitForm: function() {
        // In a real application, this would send data to a server
        console.log('Form submitted with data:', this.formData);

        // Show success message
        this.form.style.display = 'none';
        const successMessage = document.querySelector('.form-success');
        if (successMessage) {
            successMessage.classList.add('show');
        }

        // Reset form after 3 seconds (optional)
        setTimeout(() => {
            this.resetForm();
        }, 5000);
    },

    resetForm: function() {
        this.form.reset();
        this.formData = {};
        this.showStep(1);

        const successMessage = document.querySelector('.form-success');
        if (successMessage) {
            successMessage.classList.remove('show');
        }
        this.form.style.display = 'block';
    },

    showError: function(message) {
        // Simple alert for now - could be replaced with a nicer notification
        alert(message);
    }
};

// Initialize form when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    ContactForm.init();
});

// ===========================
// Smooth Scroll for Anchor Links
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    const anchorLinks = document.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            if (href !== '#' && href !== '') {
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    const offsetTop = target.offsetTop - 80; // Account for fixed nav
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });
});

// ===========================
// Gallery Image Modal (Optional Enhancement)
// ===========================
const GalleryModal = {
    init: function() {
        const galleryItems = document.querySelectorAll('.gallery-item');

        galleryItems.forEach(item => {
            item.addEventListener('click', function() {
                const img = this.querySelector('img');
                if (img && img.src) {
                    // Simple implementation - could be enhanced with a proper lightbox
                    window.open(img.src, '_blank');
                }
            });
        });
    }
};

document.addEventListener('DOMContentLoaded', function() {
    GalleryModal.init();
});

// ===========================
// Sticky CTA Visibility
// ===========================
document.addEventListener('DOMContentLoaded', function() {
    const stickyCta = document.querySelector('.sticky-cta');
    if (!stickyCta) return;

    let lastScroll = 0;
    const scrollThreshold = 300;

    window.addEventListener('scroll', function() {
        const currentScroll = window.pageYOffset;

        if (currentScroll > scrollThreshold) {
            stickyCta.style.opacity = '1';
            stickyCta.style.pointerEvents = 'auto';
        } else {
            stickyCta.style.opacity = '0';
            stickyCta.style.pointerEvents = 'none';
        }

        lastScroll = currentScroll;
    });

    // Initially hide
    stickyCta.style.opacity = '0';
    stickyCta.style.transition = 'opacity 0.3s ease';
});
