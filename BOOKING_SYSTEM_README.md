# Stellar Tree Management - Self-Booking System

A comprehensive, user-friendly self-booking system for tree care services with real-time availability checking, double-booking prevention, and mobile responsiveness.

## 🌟 Features

### User Features
- **Intuitive Multi-Step Booking Process**
  - Service selection with pricing
  - Date and time selection with real-time availability
  - Customer information collection
  - Booking summary and confirmation

- **Real-Time Availability**
  - Live slot availability checking
  - Prevents double bookings
  - Visual indicators for available/unavailable times

- **Mobile Responsive Design**
  - Optimized for all screen sizes
  - Touch-friendly interface
  - Progressive enhancement

- **Security & Validation**
  - Input validation and sanitization
  - Email format verification
  - Required field enforcement

### Admin Features
- **Booking Management Dashboard**
  - View all bookings with filtering
  - Update booking status (pending → confirmed → completed)
  - Cancel bookings
  - Real-time statistics

- **Email Notifications**
  - Automatic confirmation emails to customers
  - Booking notifications to business
  - HTML formatted emails

## 📁 File Structure

```
├── index.html              # Main website with integrated booking system
├── booking-handler.php     # Backend API for booking operations
├── database-schema.sql     # Database setup and structure
├── admin.html             # Admin dashboard for managing bookings
└── BOOKING_SYSTEM_README.md # This documentation
```

## 🚀 Quick Setup

### 1. Frontend Integration
The booking system is already integrated into your main `index.html` file. It appears as a section between your services and contact sections.

### 2. Database Setup
```sql
-- Run the database schema
mysql -u root -p < database-schema.sql
```

### 3. PHP Backend Configuration
Edit `booking-handler.php` and update the database credentials:
```php
$host = 'localhost';
$dbname = 'stellar_tree_bookings';
$username = 'your_db_username';
$password = 'your_db_password';
```

### 4. Email Configuration
Update the email addresses in `booking-handler.php`:
```php
$to = 'your-business-email@example.com';
```

## 🔧 Detailed Setup Instructions

### Prerequisites
- Web server with PHP 7.4+ support
- MySQL 5.7+ or MariaDB 10.2+
- SMTP server for email notifications (optional but recommended)

### Step 1: Database Setup

1. **Create the database:**
   ```sql
   CREATE DATABASE stellar_tree_bookings;
   ```

2. **Import the schema:**
   ```bash
   mysql -u root -p stellar_tree_bookings < database-schema.sql
   ```

3. **Verify tables were created:**
   ```sql
   USE stellar_tree_bookings;
   SHOW TABLES;
   ```

### Step 2: Configure PHP Backend

1. **Update database credentials in `booking-handler.php`:**
   ```php
   $host = 'localhost';           // Your database host
   $dbname = 'stellar_tree_bookings';
   $username = 'booking_user';    // Database username
   $password = 'secure_password_123'; // Database password
   ```

2. **Configure email settings:**
   ```php
   $to = 'stellartmanagement@outlook.com'; // Your business email
   ```

3. **Set proper file permissions:**
   ```bash
   chmod 644 booking-handler.php
   ```

### Step 3: Frontend Configuration

The booking system is already integrated into your `index.html`. To customize:

1. **Update service prices** in the HTML:
   ```html
   <div class="service-option" data-service="tree-removal" data-price="300">
   ```

2. **Modify available time slots** in the JavaScript:
   ```javascript
   // Update time slots in the HTML
   <div class="time-slot" data-time="08:00">8:00 AM</div>
   ```

3. **Connect to your backend** by updating the JavaScript:
   ```javascript
   // Replace localStorage simulation with actual API calls
   async function submitBooking() {
       const response = await fetch('booking-handler.php', {
           method: 'POST',
           headers: {
               'Content-Type': 'application/json',
           },
           body: JSON.stringify(bookingData)
       });
       return response.json();
   }
   ```

### Step 4: Admin Panel Setup

1. **Access the admin panel:**
   - Open `admin.html` in your browser
   - For production, add authentication

2. **Secure the admin panel** (recommended):
   ```php
   // Add to the top of admin.html or create admin.php
   <?php
   session_start();
   if (!isset($_SESSION['admin_logged_in'])) {
       header('Location: login.php');
       exit;
   }
   ?>
   ```

## 🎨 Customization

### Styling
The booking system uses CSS custom properties that match your existing design:
```css
:root {
    --primary-color: #2a2a2a;
    --accent-color: #8cc63f;
    --secondary-color: #5a5a5a;
    --bg-color: #f8f9fa;
}
```

### Services
Add or modify services in the database:
```sql
INSERT INTO services (service_type, service_name, base_price, description) VALUES
('new-service', 'New Service Name', 199.00, 'Service description');
```

### Time Slots
Modify available time slots in the `available_slots` table or directly in the HTML.

### Email Templates
Customize email templates in the `sendEmailNotification()` function in `booking-handler.php`.

## 📱 Mobile Optimization

The booking system is fully responsive with:
- Touch-friendly buttons and inputs
- Optimized layouts for small screens
- Swipe-friendly step navigation
- Accessible form controls

## 🔒 Security Features

- **SQL Injection Prevention**: Prepared statements
- **XSS Protection**: Input sanitization
- **CSRF Protection**: Can be added with tokens
- **Input Validation**: Client and server-side validation
- **Rate Limiting**: Can be implemented for API endpoints

## 🚀 Production Deployment

### 1. Environment Configuration
```php
// Add to booking-handler.php for production
if ($_SERVER['HTTP_HOST'] !== 'yourdomain.com') {
    die('Unauthorized access');
}
```

### 2. SSL Certificate
Ensure your site uses HTTPS for secure data transmission.

### 3. Database Optimization
```sql
-- Add indexes for better performance
CREATE INDEX idx_booking_date_status ON bookings(booking_date, status);
CREATE INDEX idx_customer_email_date ON bookings(customer_email, booking_date);
```

### 4. Email Service Integration
For reliable email delivery, integrate with services like:
- SendGrid
- Mailgun
- Amazon SES

## 📊 Analytics and Monitoring

### Booking Statistics
```sql
-- Popular services
SELECT service_name, COUNT(*) as bookings 
FROM bookings 
WHERE status != 'cancelled' 
GROUP BY service_name 
ORDER BY bookings DESC;

-- Revenue by month
SELECT 
    DATE_FORMAT(booking_date, '%Y-%m') as month,
    SUM(service_price) as revenue
FROM bookings 
WHERE status IN ('confirmed', 'completed')
GROUP BY month;
```

### Performance Monitoring
- Monitor booking completion rates
- Track popular time slots
- Analyze customer feedback

## 🐛 Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Check database credentials
   - Verify database server is running
   - Check user permissions

2. **Emails Not Sending**
   - Verify SMTP configuration
   - Check spam folders
   - Test mail() function on server

3. **JavaScript Errors**
   - Check browser console
   - Verify all dependencies are loaded
   - Test on different browsers

4. **Mobile Display Issues**
   - Test on actual devices
   - Check viewport meta tag
   - Verify touch events work

## 📈 Future Enhancements

### Potential Features
- **Payment Integration**: Stripe, PayPal, Square
- **SMS Notifications**: Twilio integration
- **Calendar Sync**: Google Calendar, Outlook
- **Customer Portal**: View/modify bookings
- **Advanced Scheduling**: Recurring appointments
- **Multi-location Support**: Different service areas
- **Staff Assignment**: Assign jobs to specific team members
- **Photo Upload**: Before/after photos
- **Rating System**: Customer feedback and reviews

### API Extensions
```php
// Additional endpoints you could add
GET /api/bookings/{id}        // Get specific booking
PUT /api/bookings/{id}        // Update booking
DELETE /api/bookings/{id}     // Cancel booking
GET /api/availability         // Check availability
POST /api/customers          // Create customer profile
```

## 📞 Support

For technical support or customization requests:
- Email: technical-support@stellartreemanagement.com
- Documentation: Check this README for common solutions
- Issues: Create detailed bug reports with steps to reproduce

## 📄 License

This booking system is proprietary software developed for Stellar Tree Management. Unauthorized distribution or modification is prohibited.

---

**Version**: 1.0.0  
**Last Updated**: January 2025  
**Compatible With**: PHP 7.4+, MySQL 5.7+, Modern Browsers