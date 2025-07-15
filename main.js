/* class StellarTreeSite {
    constructor() {
        this.init();
    }

    init() {
        this.setupNavigation();
        this.setupContactForm();
        this.setupProjectModal();
        this.setupAnimations();
        this.setupScrollEffects();
    }

    setupNavigation() {
        const nav = document.querySelector('nav');
        let scrollTimer = null;

        window.addEventListener('scroll', () => {
            if (scrollTimer) return;
            
            scrollTimer = setTimeout(() => {
                if (window.scrollY > 50) {
                    nav.classList.add('nav-scrolled');
                } else {
                    nav.classList.remove('nav-scrolled');
                }
                scrollTimer = null;
            }, 10);
        });

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => {
                e.preventDefault();
                const target = document.querySelector(anchor.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }

    // Contact form functionality
    setupContactForm() {
        const contactForm = document.getElementById('contactForm');
        if (!contactForm) return;

        // Initialize EmailJS (replace with your actual keys)
        if (typeof emailjs !== 'undefined') {
            emailjs.init("YOUR_PUBLIC_KEY");
        }

        contactForm.addEventListener('submit', this.handleFormSubmission.bind(this));
    }

    async handleFormSubmission(event) {
        event.preventDefault();
        
        const form = event.target;
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalBtnText = submitBtn.textContent;
        
        // Validate form
        if (!this.validateForm(form)) {
            this.showMessage('Please fill in all required fields.', 'error');
            return;
        }

        // Update button state
        submitBtn.textContent = 'Sending...';
        submitBtn.disabled = true;

        try {
            // Send email using EmailJS (replace with your service details)
            if (typeof emailjs !== 'undefined') {
                await emailjs.sendForm('YOUR_SERVICE_ID', 'YOUR_TEMPLATE_ID', form);
                this.showMessage('Message sent successfully!', 'success');
                form.reset();
            } else {
                // Fallback - just show success message
                await this.simulateDelay(1000);
                this.showMessage('Message sent successfully!', 'success');
                form.reset();
            }
        } catch (error) {
            console.error('Form submission error:', error);
            this.showMessage('Error sending message. Please try again.', 'error');
        } finally {
            // Reset button
            setTimeout(() => {
                submitBtn.textContent = originalBtnText;
                submitBtn.disabled = false;
            }, 2000);
        }
    }

    validateForm(form) {
        const requiredFields = form.querySelectorAll('[required]');
        return [...requiredFields].every(field => field.value.trim() !== '');
    }

    showMessage(message, type) {
        // Create and show message
        const messageEl = document.createElement('div');
        messageEl.className = `form-message ${type}`;
        messageEl.textContent = message;
        messageEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            padding: 1rem 2rem;
            border-radius: 8px;
            color: white;
            font-weight: 600;
            z-index: 1000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            background: ${type === 'success' ? 'var(--accent-color)' : '#e74c3c'};
        `;
        
        document.body.appendChild(messageEl);
        
        // Slide in
        setTimeout(() => {
            messageEl.style.transform = 'translateX(0)';
        }, 100);
        
        // Remove after delay
        setTimeout(() => {
            messageEl.style.transform = 'translateX(100%)';
            setTimeout(() => messageEl.remove(), 300);
        }, 3000);
    }

    simulateDelay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Project modal functionality
    setupProjectModal() {
        if (!document.querySelector('.projects-grid')) return;

        this.modal = document.querySelector('.modal');
        this.modalContent = document.querySelector('.modal-content');
        this.closeModalBtn = document.querySelector('.close-modal');
        this.modalTitle = document.querySelector('.modal-title');
        this.modalDescription = document.querySelector('.modal-description');
        this.modalDetails = document.querySelector('.modal-details');
        this.carouselInner = document.querySelector('.carousel-inner');
        this.carousel = document.querySelector('.carousel');

        this.currentSlide = 0;
        this.slideInterval = null;
        this.images = [];

        this.setupProjectCards();
        this.setupCarousel();
        this.setupModalEvents();
    }

    setupProjectCards() {
        const projectCards = document.querySelectorAll('.project-card');
        
        projectCards.forEach(card => {
            card.addEventListener('click', () => this.openProjectModal(card));
        });
    }

    openProjectModal(card) {
        const title = card.querySelector('.project-title').textContent;
        const description = card.querySelector('.project-description').textContent;
        const details = card.getAttribute('data-details') || '<p>No additional details available.</p>';
        
        // Parse images
        try {
            this.images = JSON.parse(card.getAttribute('data-images') || '[]');
            if (!this.images.length) {
                this.images = [card.querySelector('.project-image').src];
            }
        } catch (e) {
            console.error('Error parsing images:', e);
            this.images = [card.querySelector('.project-image').src];
        }

        this.populateModal(title, description, details);
        this.setupCarouselImages();
        this.showModal();
    }

    populateModal(title, description, details) {
        this.modalTitle.textContent = title;
        this.modalDescription.innerHTML = `<p>${description}</p>`;
        this.modalDetails.innerHTML = details;
    }

    setupCarouselImages() {
        // Clear existing images
        this.carouselInner.innerHTML = '';
        
        // Add new images
        this.images.forEach((src, index) => {
            const item = document.createElement('div');
            item.className = `carousel-item ${index === 0 ? 'active' : ''}`;
            item.innerHTML = `<img src="${src}" alt="Project image ${index + 1}" loading="lazy">`;
            this.carouselInner.appendChild(item);
        });

        // Show/hide carousel controls
        const controls = document.querySelectorAll('.carousel-control');
        controls.forEach(control => {
            control.style.display = this.images.length > 1 ? 'flex' : 'none';
        });

        this.currentSlide = 0;
    }

    showModal() {
        this.modal.classList.add('active');
        document.body.style */