// Admin Configuration
// Change these settings as needed

const ADMIN_CONFIG = {
    // Admin password - CHANGE THIS TO YOUR PREFERRED PASSWORD
    PASSWORD: 'stellar2024',
    
    // Session timeout in minutes (0 = no timeout)
    SESSION_TIMEOUT: 60,
    
    // Maximum login attempts before temporary lockout
    MAX_LOGIN_ATTEMPTS: 5,
    
    // Lockout duration in minutes
    LOCKOUT_DURATION: 15,
    
    // Admin email for notifications (optional)
    ADMIN_EMAIL: 'admin@stellartreemanagement.com',
    
    // Company name for branding
    COMPANY_NAME: 'Stellar Tree Management'
};

// Export for use in admin.html
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ADMIN_CONFIG;
} else {
    // For browser use
    window.ADMIN_CONFIG = ADMIN_CONFIG;
} 