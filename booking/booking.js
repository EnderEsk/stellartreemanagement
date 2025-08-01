// Booking System JavaScript
class BookingSystem {
    constructor() {
        this.currentStep = 1;
        this.totalSteps = 3; // Reduced from 4 to 3 since time selection is now part of step 2
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedService = null;
        this.bookingData = {};
        this.availabilityData = {};
        this.isSubmitting = false; // Flag to prevent duplicate submissions
        this.listenersSetup = false; // Flag to prevent duplicate event listeners
        
        // Business configuration
        this.businessHours = {
            maxBookingsPerTimeSlot: 1, // Only 1 booking per time slot
            workingDays: [1, 2, 3, 4, 5], // Monday to Friday (0 = Sunday, 6 = Saturday)
            timeSlots: ['8:00 AM', '1:00 PM', '4:00 PM'] // Available time slots
        };
        
        this.init();
    }
    
    async init() {
        this.setupEventListeners();
        this.initializeCalendar();
        this.setupAddressAutocomplete();
        await this.loadExistingBookings();
        await this.loadAvailabilityData();
        this.renderCalendar(); // Re-render calendar with loaded data
        this.updateStepDisplay(); // Ensure initial step is displayed
    }
    
    setupEventListeners() {
        // Prevent duplicate event listener setup
        if (this.listenersSetup) {
            return;
        }
        
        // Step navigation
        document.querySelectorAll('.next-step').forEach(btn => {
            btn.addEventListener('click', () => this.nextStep());
        });
        
        document.querySelectorAll('.prev-step').forEach(btn => {
            btn.addEventListener('click', () => this.prevStep());
        });
        
        // Calendar navigation
        const prevMonthBtn = document.getElementById('prevMonth');
        const nextMonthBtn = document.getElementById('nextMonth');
        
        // Remove existing listeners to prevent duplicates
        prevMonthBtn.removeEventListener('click', this.prevMonthHandler);
        nextMonthBtn.removeEventListener('click', this.nextMonthHandler);
        
        // Create bound handlers
        this.prevMonthHandler = () => this.changeMonth(-1);
        this.nextMonthHandler = () => this.changeMonth(1);
        
        // Add new listeners
        prevMonthBtn.addEventListener('click', this.prevMonthHandler);
        nextMonthBtn.addEventListener('click', this.nextMonthHandler);
        
        // Form submission
        document.getElementById('bookingForm').addEventListener('submit', (e) => {
            e.preventDefault();
            this.showBookingSummary();
        });
        
        // Modal events
        document.getElementById('confirmBooking').addEventListener('click', () => this.submitBooking());
        document.getElementById('cancelBooking').addEventListener('click', () => this.closeModal('bookingModal'));
        document.querySelectorAll('.modal-close').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal.id);
            });
        });
        
        // Mobile menu toggle
        const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
        const navLinks = document.querySelector('.nav-links');
        
        if (mobileMenuToggle && navLinks) {
            mobileMenuToggle.addEventListener('click', () => {
                navLinks.classList.toggle('active');
            });
        }
        
        this.listenersSetup = true; // Mark listeners as setup
        
        // Setup phone number formatting
        this.setupPhoneFormatting();
        
        // Setup image upload functionality
        this.setupImageUpload();
    }
    
    setupPhoneFormatting() {
        const phoneInput = document.getElementById('phone');
        if (!phoneInput) return;
        
        phoneInput.addEventListener('input', (e) => {
            let value = e.target.value.replace(/\D/g, ''); // Remove non-digits
            
            if (value.length > 0) {
                if (value.length <= 3) {
                    value = `(${value}`;
                } else if (value.length <= 6) {
                    value = `(${value.slice(0, 3)}) ${value.slice(3)}`;
                } else {
                    value = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6, 10)}`;
                }
            }
            
            e.target.value = value;
        });
    }
    
    setupImageUpload() {
        const imageInput = document.getElementById('images');
        const uploadArea = document.getElementById('imageUploadArea');
        const previewContainer = document.getElementById('imagePreviewContainer');
        
        if (!imageInput || !uploadArea || !previewContainer) return;
        
        // Store selected files
        this.selectedImages = [];
        
        // Click to upload
        uploadArea.addEventListener('click', () => {
            imageInput.click();
        });
        
        // File selection
        imageInput.addEventListener('change', (e) => {
            this.handleImageSelection(e.target.files);
        });
        
        // Drag and drop
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });
        
        uploadArea.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
        });
        
        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');
            this.handleImageSelection(e.dataTransfer.files);
        });
    }
    
    handleImageSelection(files) {
        const maxFiles = 5;
        const maxSize = 5 * 1024 * 1024; // 5MB
        
        // Check if adding these files would exceed the limit
        if (this.selectedImages.length + files.length > maxFiles) {
            this.showNotification(`You can only upload up to ${maxFiles} images.`, 'error');
            return;
        }
        
        Array.from(files).forEach(file => {
            // Check file type
            if (!file.type.startsWith('image/')) {
                this.showNotification(`${file.name} is not an image file.`, 'error');
                return;
            }
            
            // Check file size
            if (file.size > maxSize) {
                this.showNotification(`${file.name} is too large. Maximum size is 5MB.`, 'error');
                return;
            }
            
            // Check if file is already selected
            if (this.selectedImages.some(img => img.name === file.name && img.size === file.size)) {
                this.showNotification(`${file.name} is already selected.`, 'error');
                return;
            }
            
            // Add to selected images
            this.selectedImages.push(file);
            this.createImagePreview(file);
        });
        
        // Update file input
        this.updateFileInput();
    }
    
    createImagePreview(file) {
        const previewContainer = document.getElementById('imagePreviewContainer');
        const reader = new FileReader();
        
        reader.onload = (e) => {
            const previewItem = document.createElement('div');
            previewItem.className = 'image-preview-item';
            previewItem.dataset.filename = file.name;
            
            previewItem.innerHTML = `
                <img src="${e.target.result}" alt="${file.name}">
                <button type="button" class="remove-image" title="Remove image">
                    <i class="fas fa-times"></i>
                </button>
                <div class="file-name">${file.name}</div>
            `;
            
            // Remove image functionality
            previewItem.querySelector('.remove-image').addEventListener('click', () => {
                this.removeImage(file.name);
                previewItem.remove();
            });
            
            previewContainer.appendChild(previewItem);
        };
        
        reader.readAsDataURL(file);
    }
    
    removeImage(filename) {
        this.selectedImages = this.selectedImages.filter(img => img.name !== filename);
        this.updateFileInput();
    }
    
    updateFileInput() {
        const imageInput = document.getElementById('images');
        
        // Create a new FileList-like object
        const dt = new DataTransfer();
        this.selectedImages.forEach(file => dt.items.add(file));
        imageInput.files = dt.files;
    }
    
    setupAddressAutocomplete() {
        const addressInput = document.getElementById('address');
        const suggestionsContainer = document.getElementById('address-suggestions');
        
        if (!addressInput || !suggestionsContainer) return;
        
        // Check if Geoapify API key is available
        if (!window.GEOAPIFY_API_KEY) {
            console.warn('Geoapify API key not found. Address autocomplete will not work.');
            this.setupSimpleAddressInput(addressInput);
            return;
        }
        
        // Disable browser autocomplete
        addressInput.setAttribute('autocomplete', 'off');
        addressInput.setAttribute('autocorrect', 'off');
        addressInput.setAttribute('autocapitalize', 'off');
        addressInput.setAttribute('spellcheck', 'false');
        
        let searchTimeout;
        let isSelectionMade = false;
        
        addressInput.addEventListener('input', (e) => {
            const query = e.target.value.trim();
            
            // Clear previous timeout
            if (searchTimeout) {
                clearTimeout(searchTimeout);
            }
            
            // Reset selection flag when user starts typing
            isSelectionMade = false;
            
            // Hide suggestions if query is too short
            if (query.length < 3) {
                suggestionsContainer.style.display = 'none';
                addressInput.classList.remove('loading');
                return;
            }
            
            // Add loading indicator
            addressInput.classList.add('loading');
            
            // Debounce the search
            searchTimeout = setTimeout(() => {
                this.fetchAddressSuggestions(query, suggestionsContainer, addressInput);
            }, 300);
        });
        
        // Hide suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!addressInput.contains(e.target) && !suggestionsContainer.contains(e.target)) {
                suggestionsContainer.style.display = 'none';
            }
        });
        
        // Handle keyboard navigation
        addressInput.addEventListener('keydown', (e) => {
            const suggestions = suggestionsContainer.querySelectorAll('.address-suggestion-item');
            const activeSuggestion = suggestionsContainer.querySelector('.address-suggestion-item.active');
            
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                if (!activeSuggestion) {
                    suggestions[0]?.classList.add('active');
                } else {
                    const currentIndex = Array.from(suggestions).indexOf(activeSuggestion);
                    const nextIndex = (currentIndex + 1) % suggestions.length;
                    activeSuggestion.classList.remove('active');
                    suggestions[nextIndex]?.classList.add('active');
                }
            } else if (e.key === 'ArrowUp') {
                e.preventDefault();
                if (activeSuggestion) {
                    const currentIndex = Array.from(suggestions).indexOf(activeSuggestion);
                    const prevIndex = currentIndex === 0 ? suggestions.length - 1 : currentIndex - 1;
                    activeSuggestion.classList.remove('active');
                    suggestions[prevIndex]?.classList.add('active');
                }
            } else if (e.key === 'Enter' && activeSuggestion) {
                e.preventDefault();
                activeSuggestion.click();
            } else if (e.key === 'Escape') {
                suggestionsContainer.style.display = 'none';
                addressInput.blur();
            } else if (e.key === 'Tab') {
                // Hide suggestions on tab
                suggestionsContainer.style.display = 'none';
            }
        });
        
        // Prevent form submission on Enter if suggestions are visible
        addressInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && suggestionsContainer.style.display === 'block') {
                e.preventDefault();
            }
        });
        
        // Store the original click handler for suggestions
        this.addressSuggestionClickHandler = (suggestionItem, input, container) => {
            return () => {
                // Use the formatted address from Geoapify
                const formattedAddress = suggestionItem.dataset.formatted || suggestionItem.textContent;
                input.value = formattedAddress;
                container.style.display = 'none';
                input.classList.remove('loading');
                isSelectionMade = true;
                
                // Trigger a blur event to validate the field
                setTimeout(() => {
                    input.blur();
                }, 100);
            };
        };
    }
    
    async fetchAddressSuggestions(query, container, input) {
        try {
            const apiKey = window.GEOAPIFY_API_KEY;
            const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(query)}&apiKey=${apiKey}&limit=5&country=ca&format=json`;
            
            const response = await fetch(url);
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            input.classList.remove('loading');
            
            if (result.results && result.results.length > 0) {
                this.displayAddressSuggestions(result.results, container, input);
            } else {
                container.style.display = 'none';
            }
        } catch (error) {
            console.error('Address autocomplete error:', error);
            input.classList.remove('loading');
            container.style.display = 'none';
        }
    }
    
    displayAddressSuggestions(results, container, input) {
        container.innerHTML = '';
        
        if (!results || results.length === 0) {
            container.style.display = 'none';
            input.classList.remove('loading');
            return;
        }
        
        results.forEach((result, index) => {
            const suggestionItem = document.createElement('div');
            suggestionItem.className = 'address-suggestion-item';
            
            // Extract address information from Geoapify search response
            const mainText = result.address_line1 || result.street || result.housenumber + ' ' + result.street || '';
            const secondaryText = result.address_line2 || [
                result.city,
                result.state,
                result.postcode
            ].filter(Boolean).join(', ');
            
            // Store the formatted address as data attribute
            const formattedAddress = result.formatted || `${mainText}, ${secondaryText}`;
            suggestionItem.dataset.formatted = formattedAddress;
            
            suggestionItem.innerHTML = `
                <div class="main-text">${mainText}</div>
                <div class="secondary-text">${secondaryText}</div>
            `;
            
            // Use the stored click handler
            suggestionItem.addEventListener('click', this.addressSuggestionClickHandler(suggestionItem, input, container));
            
            container.appendChild(suggestionItem);
        });
        
        container.style.display = 'block';
        input.classList.remove('loading');
    }
    
    setupSimpleAddressInput(addressInput) {
        // Fallback for when Geoapify API is not available
        console.log('Setting up simple address input without autocomplete');
        
        // Add a helpful placeholder
        addressInput.placeholder = 'Enter your full Canadian address (e.g., 123 Main St, Toronto, ON M5V 3A8)';
        
        // Add some basic validation
        addressInput.addEventListener('blur', () => {
            const value = addressInput.value.trim();
            if (value && value.length < 10) {
                this.showNotification('Please enter a complete address', 'warning');
            }
        });
    }
    
    nextStep() {
        if (this.validateCurrentStep()) {
            if (this.currentStep < this.totalSteps) {
                this.currentStep++;
                this.updateStepDisplay();
            }
        }
    }
    
    prevStep() {
        if (this.currentStep > 1) {
            this.currentStep--;
            this.updateStepDisplay();
        }
    }
    
    updateStepDisplay() {
        // Hide all steps
        document.querySelectorAll('.booking-step').forEach(step => {
            step.classList.remove('active');
        });
        
        // Show current step
        const currentStepElement = document.getElementById(`step${this.currentStep}`);
        currentStepElement.classList.add('active');
        
        // Update button text
        const submitBtn = document.querySelector('#step3 .btn-primary');
        if (submitBtn) {
            submitBtn.textContent = this.currentStep === this.totalSteps ? 'Book Appointment' : 'Continue';
        }
        
        // If we're on step 2 (date and time selection), ensure calendar shows selected date
        if (this.currentStep === 2) {
            // Force calendar re-render to ensure selected date is highlighted
            setTimeout(() => {
                this.renderCalendar();
                if (this.selectedDate) {
                    this.updateSelectedDateDisplay();
                    // Show time selection if date is selected
                    const timeSelectionContainer = document.getElementById('timeSelectionContainer');
                    if (timeSelectionContainer) {
                        timeSelectionContainer.style.display = 'block';
                    }
                }
            }, 0);
        }
    }
    
    validateCurrentStep() {
        switch (this.currentStep) {
            case 1:
                return this.validateServiceSelection();
            case 2:
                return this.validateDateAndTimeSelection();
            case 3:
                return this.validateContactInfo();
            default:
                return true;
        }
    }
    
    validateServiceSelection() {
        const selectedService = document.querySelector('input[name="service"]:checked');
        if (!selectedService) {
            this.showNotification('Please select a service', 'error');
            return false;
        }
        this.selectedService = selectedService.value;
        return true;
    }
    
    validateDateAndTimeSelection() {
        if (!this.selectedDate) {
            this.showNotification('Please select a date', 'error');
            return false;
        }
        if (!this.selectedTime) {
            this.showNotification('Please select a time', 'error');
            return false;
        }
        return true;
    }
    
    validateContactInfo() {
        const requiredFields = ['name', 'email', 'phone', 'address'];
        for (const field of requiredFields) {
            const input = document.getElementById(field);
            if (!input.value.trim()) {
                this.showNotification(`Please fill in ${field}`, 'error');
                input.focus();
                return false;
            }
        }
        
        // Validate email format
        const email = document.getElementById('email').value;
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            this.showNotification('Please enter a valid email address', 'error');
            document.getElementById('email').focus();
            return false;
        }
        
        // Validate phone format (basic validation)
        const phone = document.getElementById('phone').value;
        const cleanPhone = phone.replace(/[\s\-\(\)]/g, '');
        if (cleanPhone.length < 10) {
            this.showNotification('Please enter a valid phone number (at least 10 digits)', 'error');
            document.getElementById('phone').focus();
            return false;
        }
        
        // Validate address format (should be a complete Canadian address)
        const address = document.getElementById('address').value;
        if (address.length < 10 || !address.includes(',')) {
            this.showNotification('Please select a complete address from the suggestions', 'error');
            document.getElementById('address').focus();
            return false;
        }
        
        return true;
    }
    
    initializeCalendar() {
        // Set to July 2025 for testing, or use current date for production
        this.currentMonth = new Date(2025, 6, 1); // July 1, 2025
        // Don't render calendar here - it will be rendered after loading data
    }
    
    renderCalendar() {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        
        // Update month display
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        console.log(`Rendering calendar for month: ${month} (${monthNames[month]}) ${year}`);
        
        document.getElementById('currentMonth').textContent = `${monthNames[month]} ${year}`;
        
        // Get first day and last day of month
        const firstDay = new Date(year, month, 1);
        const lastDay = new Date(year, month + 1, 0);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        const calendarDays = document.getElementById('calendarDays');
        calendarDays.innerHTML = '';
        
        // Generate calendar days
        for (let i = 0; i < 42; i++) {
            const currentDate = new Date(startDate);
            currentDate.setDate(startDate.getDate() + i);
            
            const dayElement = document.createElement('div');
            dayElement.className = 'calendar-day';
            dayElement.textContent = currentDate.getDate();
            
            // Check if it's current month
            if (currentDate.getMonth() !== month) {
                dayElement.classList.add('other-month');
            }
            
            // Check if it's today
            const today = new Date();
            if (this.isSameDay(currentDate, today)) {
                dayElement.classList.add('today');
            }
            
            // Check if it's the selected date
            if (this.selectedDate && this.isSameDay(currentDate, this.selectedDate)) {
                dayElement.classList.add('selected');
            }
            
            // Check if date is in the past
            if (currentDate < today) {
                dayElement.classList.add('disabled');
            } else {
                // Check if date has bookings
                const dateString = currentDate.toISOString().split('T')[0];
                const dayBookings = this.availabilityData[dateString] || {};
                
                // Check if it's weekend (automatically blocked)
                const isWeekend = currentDate.getDay() === 0 || currentDate.getDay() === 6;
                
                // Check if date is blocked (from availability data or blocked dates)
                const isBlocked = (this.availabilityData[dateString] && this.availabilityData[dateString].blocked) || 
                                 (this.blockedDates && this.blockedDates.some(blockedDate => 
                                     blockedDate.date === dateString && blockedDate.reason !== 'unblocked_weekend'
                                 ));
                
                // Check if weekend is explicitly unblocked
                const isUnblockedWeekend = this.blockedDates && this.blockedDates.some(blockedDate => 
                    blockedDate.date === dateString && blockedDate.reason === 'unblocked_weekend'
                );
                
                if (isBlocked) {
                    dayElement.classList.add('blocked');
                    dayElement.title = 'This day is blocked';
                } else if (isWeekend && !isUnblockedWeekend) {
                    // Weekends are blocked by default unless explicitly unblocked
                    dayElement.classList.add('blocked');
                    dayElement.title = 'Weekend - blocked by default';
                } else {
                    // Check if all time slots are booked
                    const timeSlots = this.businessHours.timeSlots;
                    const bookedTimeSlots = timeSlots.filter(time => 
                        (dayBookings[time] || 0) >= this.businessHours.maxBookingsPerTimeSlot
                    );
                    
                    if (bookedTimeSlots.length === timeSlots.length) {
                        dayElement.classList.add('booked');
                        dayElement.title = 'All time slots are booked';
                    } else if (bookedTimeSlots.length > 0) {
                        dayElement.classList.add('partially-booked');
                        dayElement.title = `Some time slots booked: ${bookedTimeSlots.join(', ')}`;
                    } else {
                        dayElement.classList.add('available');
                        dayElement.title = 'Available for booking';
                    }
                }
                
                // Add click event listener for selectable dates
                dayElement.addEventListener('click', () => this.selectDate(currentDate));
            }
            
            calendarDays.appendChild(dayElement);
        }
    }
    
    selectDate(date) {
        // Remove previous selection
        document.querySelectorAll('.calendar-day.selected').forEach(day => {
            day.classList.remove('selected');
        });
        
        // Add selection to clicked day
        const dayElements = document.querySelectorAll('.calendar-day');
        const dayIndex = this.getDayIndex(date);
        if (dayElements[dayIndex]) {
            dayElements[dayIndex].classList.add('selected');
        }
        
        this.selectedDate = date;
        this.updateSelectedDateDisplay();
        this.loadTimeSlots();
        
        // Show time selection container
        const timeSelectionContainer = document.getElementById('timeSelectionContainer');
        if (timeSelectionContainer) {
            timeSelectionContainer.style.display = 'block';
        }
    }
    
    getDayIndex(date) {
        const year = this.currentMonth.getFullYear();
        const month = this.currentMonth.getMonth();
        const firstDay = new Date(year, month, 1);
        const startDate = new Date(firstDay);
        startDate.setDate(startDate.getDate() - firstDay.getDay());
        
        return Math.floor((date - startDate) / (1000 * 60 * 60 * 24));
    }
    
    updateSelectedDateDisplay() {
        if (this.selectedDate) {
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            const dateString = this.selectedDate.toLocaleDateString('en-US', options);
            document.getElementById('selectedDateDisplay').textContent = dateString;
        }
    }
    
        loadTimeSlots() {
        if (!this.selectedDate) return;
        
        const timeSlotsContainer = document.getElementById('timeSlots');
        timeSlotsContainer.innerHTML = '';
        
        const dateString = this.selectedDate.toISOString().split('T')[0];
        const dayBookings = this.availabilityData[dateString] || {};
        
        // Check if it's weekend (automatically blocked)
        const isWeekend = this.selectedDate.getDay() === 0 || this.selectedDate.getDay() === 6;
        
        // Check if date is blocked (from availability data or blocked dates)
        const isBlocked = (this.availabilityData[dateString] && this.availabilityData[dateString].blocked) || 
                         (this.blockedDates && this.blockedDates.some(blockedDate => 
                             blockedDate.date === dateString && blockedDate.reason !== 'unblocked_weekend'
                         ));
        
        // Check if weekend is explicitly unblocked
        const isUnblockedWeekend = this.blockedDates && this.blockedDates.some(blockedDate => 
            blockedDate.date === dateString && blockedDate.reason === 'unblocked_weekend'
        );
        
        if (isBlocked) {
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot disabled';
            timeSlot.textContent = 'This day is blocked';
            timeSlot.title = 'This day is blocked and unavailable for booking';
            timeSlotsContainer.appendChild(timeSlot);
        } else if (isWeekend && !isUnblockedWeekend) {
            // Weekends are blocked by default unless explicitly unblocked
            const timeSlot = document.createElement('div');
            timeSlot.className = 'time-slot disabled';
            timeSlot.textContent = 'Weekend - unavailable';
            timeSlot.title = 'Weekends are blocked by default';
            timeSlotsContainer.appendChild(timeSlot);
        } else {
            // Show available time slots
            this.businessHours.timeSlots.forEach(time => {
                const timeSlot = document.createElement('div');
                timeSlot.className = 'time-slot';
                
                const bookingsForTimeSlot = dayBookings[time] || 0;
                const isAvailable = bookingsForTimeSlot < this.businessHours.maxBookingsPerTimeSlot;
                
                if (isAvailable) {
                    timeSlot.textContent = time;
                    timeSlot.title = `Click to select ${time}`;
                    timeSlot.addEventListener('click', () => this.selectTimeSlot(timeSlot, time));
                } else {
                    timeSlot.classList.add('disabled');
                    timeSlot.textContent = `${time} - Booked`;
                    timeSlot.title = `${time} is already booked`;
                }
                
                timeSlotsContainer.appendChild(timeSlot);
            });
        }
    }
    
    selectTimeSlot(element, time) {
        // Remove previous selection
        document.querySelectorAll('.time-slot.selected').forEach(slot => {
            slot.classList.remove('selected');
        });
        
        // Add selection
        element.classList.add('selected');
        this.selectedTime = time;
    }
    
    isWorkingDay(date) {
        // Check if it's a weekday
        const isWeekday = this.businessHours.workingDays.includes(date.getDay());
        
        // If it's a weekday, it's always a working day
        if (isWeekday) {
            return true;
        }
        
        // If it's a weekend, check if it's been unblocked
        const dateString = date.toISOString().split('T')[0];
        const isUnblockedWeekend = this.blockedDates && this.blockedDates.some(blockedDate => 
            blockedDate.date === dateString && blockedDate.reason === 'unblocked_weekend'
        );
        
        return isUnblockedWeekend;
    }
    
    isSameDay(date1, date2) {
        return date1.getDate() === date2.getDate() &&
               date1.getMonth() === date2.getMonth() &&
               date1.getFullYear() === date2.getFullYear();
    }
    
    async changeMonth(direction) {
        // Prevent rapid clicking
        if (this.isChangingMonth) {
            console.log('Month change already in progress, ignoring click');
            return;
        }
        
        this.isChangingMonth = true;
        
        const oldMonth = this.currentMonth.getMonth();
        const oldYear = this.currentMonth.getFullYear();
        
        console.log(`Before change: ${oldMonth}/${oldYear} (${this.currentMonth})`);
        
        // Calculate the target month and year
        let targetMonth = oldMonth + direction;
        let targetYear = oldYear;
        
        // Handle year transitions
        if (targetMonth > 11) {
            targetMonth = 0;
            targetYear++;
        } else if (targetMonth < 0) {
            targetMonth = 11;
            targetYear--;
        }
        
        // Create a new date object for the first day of the target month
        this.currentMonth = new Date(targetYear, targetMonth, 1);
        
        const newMonth = this.currentMonth.getMonth();
        const newYear = this.currentMonth.getFullYear();
        
        console.log(`After change: ${newMonth}/${newYear} (${this.currentMonth})`);
        console.log(`Direction: ${direction}, Target: ${targetMonth}/${targetYear}`);
        
        try {
            await this.loadAvailabilityData();
            this.renderCalendar();
        } finally {
            this.isChangingMonth = false;
        }
    }

    async refreshCalendar() {
        await this.loadAvailabilityData();
        this.renderCalendar();
    }
    
    async loadExistingBookings() {
        try {
            const response = await fetch('/api/bookings');
            if (response.ok) {
                this.existingBookings = await response.json();
            } else {
                this.existingBookings = [];
            }
        } catch (error) {
            console.error('Error loading bookings:', error);
            this.existingBookings = [];
        }
    }
    
    async loadAvailabilityData() {
        try {
            // Get date range for current month
            const startDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth(), 1);
            const endDate = new Date(this.currentMonth.getFullYear(), this.currentMonth.getMonth() + 1, 0);
            
            const startDateStr = startDate.toISOString().split('T')[0];
            const endDateStr = endDate.toISOString().split('T')[0];
            
            const response = await fetch(`/api/availability?start_date=${startDateStr}&end_date=${endDateStr}`);
            if (response.ok) {
                this.availabilityData = await response.json();
            } else {
                this.availabilityData = {};
            }

            // Load blocked dates
            const blockedResponse = await fetch('/api/blocked-dates');
            if (blockedResponse.ok) {
                this.blockedDates = await blockedResponse.json();
            } else {
                this.blockedDates = [];
            }
        } catch (error) {
            console.error('Error loading availability data:', error);
            this.availabilityData = {};
            this.blockedDates = [];
        }
    }
    
    isTimeSlotAvailable(date) {
        if (!this.existingBookings) return true;
        
        const dateString = date.toISOString().split('T')[0];
        const dayBookings = this.availabilityData[dateString] || {};
        
        // Check if any time slot is available
        const timeSlots = this.businessHours.timeSlots;
        const availableTimeSlots = timeSlots.filter(time => 
            (dayBookings[time] || 0) < this.businessHours.maxBookingsPerTimeSlot
        );
        
        return availableTimeSlots.length > 0;
    }
    
    showBookingSummary() {
        // Populate summary
        document.getElementById('summaryService').textContent = this.selectedService;
        document.getElementById('summaryDate').textContent = this.selectedDate.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        document.getElementById('summaryTime').textContent = this.selectedTime;
        document.getElementById('summaryName').textContent = document.getElementById('name').value;
        document.getElementById('summaryEmail').textContent = document.getElementById('email').value;
        document.getElementById('summaryPhone').textContent = document.getElementById('phone').value;
        document.getElementById('summaryAddress').textContent = document.getElementById('address').value;
        
        this.showModal('bookingModal');
    }
    
    async submitBooking() {
        // Prevent duplicate submissions
        if (this.isSubmitting) {
            return;
        }
        
        this.isSubmitting = true;
        this.showLoading(true);
        
        const bookingData = {
            booking_id: this.generateBookingId(),
            service: this.selectedService,
            date: this.selectedDate.toISOString().split('T')[0],
            time: this.selectedTime,
            name: document.getElementById('name').value,
            email: document.getElementById('email').value,
            phone: document.getElementById('phone').value,
            address: document.getElementById('address').value,
            notes: document.getElementById('notes').value
        };
        
        try {
            // Create FormData for file upload
            const formData = new FormData();
            
            // Add booking data
            Object.keys(bookingData).forEach(key => {
                formData.append(key, bookingData[key]);
            });
            
            // Add images if any
            if (this.selectedImages && this.selectedImages.length > 0) {
                this.selectedImages.forEach(image => {
                    formData.append('images', image);
                });
            }
            
            const response = await fetch('/api/bookings', {
                method: 'POST',
                body: formData // Don't set Content-Type header, let browser set it with boundary
            });
            
            if (response.ok) {
                const result = await response.json();
                this.showSuccessModal(result.bookingId);
                await this.resetForm();
            } else {
                const error = await response.json();
                this.showNotification(error.message || 'Booking failed. Please try again.', 'error');
            }
        } catch (error) {
            console.error('Error submitting booking:', error);
            this.showNotification('Network error. Please try again.', 'error');
        } finally {
            this.showLoading(false);
            this.closeModal('bookingModal');
            this.isSubmitting = false; // Reset the flag
        }
    }
    
    generateBookingId() {
        const timestamp = Date.now().toString(36);
        const random = Math.random().toString(36).substr(2, 5);
        return `ST-${timestamp}-${random}`.toUpperCase();
    }
    
    showSuccessModal(bookingId) {
        document.getElementById('bookingId').textContent = bookingId;
        this.showModal('successModal');
    }
    
    async resetForm() {
        this.currentStep = 1;
        this.selectedDate = null;
        this.selectedTime = null;
        this.selectedService = null;
        this.isSubmitting = false; // Reset submission flag
        
        // Clear selected images
        this.selectedImages = [];
        const previewContainer = document.getElementById('imagePreviewContainer');
        if (previewContainer) {
            previewContainer.innerHTML = '';
        }
        
        document.getElementById('bookingForm').reset();
        document.querySelectorAll('.booking-step').forEach(step => {
            step.classList.remove('active');
        });
        document.getElementById('step1').classList.add('active');
        
        // Hide time selection container
        const timeSelectionContainer = document.getElementById('timeSelectionContainer');
        if (timeSelectionContainer) {
            timeSelectionContainer.style.display = 'none';
        }
        
        // Reload data and re-render calendar
        await this.loadExistingBookings();
        await this.loadAvailabilityData();
        this.renderCalendar();
    }
    
    showModal(modalId) {
        document.getElementById(modalId).classList.add('show');
    }
    
    closeModal(modalId) {
        document.getElementById(modalId).classList.remove('show');
    }
    
    showLoading(show) {
        const spinner = document.getElementById('loadingSpinner');
        if (show) {
            spinner.classList.add('show');
        } else {
            spinner.classList.remove('show');
        }
    }
    
    showNotification(message, type = 'info') {
        // Create notification element
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'info-circle'}"></i>
            <span>${message}</span>
        `;
        
        // Add to page
        document.body.appendChild(notification);
        
        // Show notification
        setTimeout(() => notification.classList.add('show'), 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.classList.remove('show');
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }
}

// Initialize booking system when DOM is loaded
document.addEventListener('DOMContentLoaded', async () => {
    const bookingSystem = new BookingSystem();
    await bookingSystem.init();
});

// Add notification styles if not already present
if (!document.querySelector('#notification-styles')) {
    const style = document.createElement('style');
    style.id = 'notification-styles';
    style.textContent = `
        .notification {
            position: fixed;
            top: 20px;
            right: 20px;
            background: var(--primary-color);
            color: var(--text-color);
            padding: 1rem 1.5rem;
            border-radius: 8px;
            border-left: 4px solid var(--accent-color);
            box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
            z-index: 3000;
            transform: translateX(100%);
            transition: transform 0.3s ease;
            display: flex;
            align-items: center;
            gap: 0.5rem;
            max-width: 300px;
        }
        
        .notification.show {
            transform: translateX(0);
        }
        
        .notification.error {
            border-left-color: #ff4444;
        }
        
        .notification i {
            color: var(--accent-color);
        }
        
        .notification.error i {
            color: #ff4444;
        }
        
        @media (max-width: 768px) {
            .notification {
                right: 10px;
                left: 10px;
                max-width: none;
            }
        }
    `;
    document.head.appendChild(style);
} 