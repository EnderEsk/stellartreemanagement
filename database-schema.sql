-- Database schema for Stellar Tree Management Booking System
-- Run this SQL to create the database and tables

CREATE DATABASE IF NOT EXISTS stellar_tree_bookings;
USE stellar_tree_bookings;

-- Main bookings table
CREATE TABLE bookings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    booking_id VARCHAR(50) UNIQUE NOT NULL,
    
    -- Service information
    service_type VARCHAR(50) NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    service_price DECIMAL(10,2) NOT NULL,
    
    -- Booking date and time
    booking_date DATE NOT NULL,
    booking_time TIME NOT NULL,
    booking_time_display VARCHAR(20) NOT NULL,
    
    -- Customer information
    customer_name VARCHAR(100) NOT NULL,
    customer_email VARCHAR(100) NOT NULL,
    customer_phone VARCHAR(20) NOT NULL,
    customer_address TEXT NOT NULL,
    customer_notes TEXT,
    
    -- Booking status and metadata
    status ENUM('pending', 'confirmed', 'completed', 'cancelled') DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    -- Indexes for better performance
    INDEX idx_booking_date_time (booking_date, booking_time),
    INDEX idx_customer_email (customer_email),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
);

-- Table for managing available time slots (optional - for more complex scheduling)
CREATE TABLE available_slots (
    id INT AUTO_INCREMENT PRIMARY KEY,
    day_of_week TINYINT NOT NULL, -- 0=Sunday, 1=Monday, etc.
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default available time slots (Monday to Friday, 8 AM to 5 PM)
INSERT INTO available_slots (day_of_week, start_time, end_time) VALUES
(1, '08:00:00', '09:00:00'), -- Monday 8-9 AM
(1, '09:00:00', '10:00:00'), -- Monday 9-10 AM
(1, '10:00:00', '11:00:00'), -- Monday 10-11 AM
(1, '11:00:00', '12:00:00'), -- Monday 11-12 PM
(1, '13:00:00', '14:00:00'), -- Monday 1-2 PM
(1, '14:00:00', '15:00:00'), -- Monday 2-3 PM
(1, '15:00:00', '16:00:00'), -- Monday 3-4 PM
(1, '16:00:00', '17:00:00'), -- Monday 4-5 PM

(2, '08:00:00', '09:00:00'), -- Tuesday 8-9 AM
(2, '09:00:00', '10:00:00'), -- Tuesday 9-10 AM
(2, '10:00:00', '11:00:00'), -- Tuesday 10-11 AM
(2, '11:00:00', '12:00:00'), -- Tuesday 11-12 PM
(2, '13:00:00', '14:00:00'), -- Tuesday 1-2 PM
(2, '14:00:00', '15:00:00'), -- Tuesday 2-3 PM
(2, '15:00:00', '16:00:00'), -- Tuesday 3-4 PM
(2, '16:00:00', '17:00:00'), -- Tuesday 4-5 PM

(3, '08:00:00', '09:00:00'), -- Wednesday 8-9 AM
(3, '09:00:00', '10:00:00'), -- Wednesday 9-10 AM
(3, '10:00:00', '11:00:00'), -- Wednesday 10-11 AM
(3, '11:00:00', '12:00:00'), -- Wednesday 11-12 PM
(3, '13:00:00', '14:00:00'), -- Wednesday 1-2 PM
(3, '14:00:00', '15:00:00'), -- Wednesday 2-3 PM
(3, '15:00:00', '16:00:00'), -- Wednesday 3-4 PM
(3, '16:00:00', '17:00:00'), -- Wednesday 4-5 PM

(4, '08:00:00', '09:00:00'), -- Thursday 8-9 AM
(4, '09:00:00', '10:00:00'), -- Thursday 9-10 AM
(4, '10:00:00', '11:00:00'), -- Thursday 10-11 AM
(4, '11:00:00', '12:00:00'), -- Thursday 11-12 PM
(4, '13:00:00', '14:00:00'), -- Thursday 1-2 PM
(4, '14:00:00', '15:00:00'), -- Thursday 2-3 PM
(4, '15:00:00', '16:00:00'), -- Thursday 3-4 PM
(4, '16:00:00', '17:00:00'), -- Thursday 4-5 PM

(5, '08:00:00', '09:00:00'), -- Friday 8-9 AM
(5, '09:00:00', '10:00:00'), -- Friday 9-10 AM
(5, '10:00:00', '11:00:00'), -- Friday 10-11 AM
(5, '11:00:00', '12:00:00'), -- Friday 11-12 PM
(5, '13:00:00', '14:00:00'), -- Friday 1-2 PM
(5, '14:00:00', '15:00:00'), -- Friday 2-3 PM
(5, '15:00:00', '16:00:00'), -- Friday 3-4 PM
(5, '16:00:00', '17:00:00'); -- Friday 4-5 PM

-- Table for blocked dates (holidays, maintenance days, etc.)
CREATE TABLE blocked_dates (
    id INT AUTO_INCREMENT PRIMARY KEY,
    blocked_date DATE NOT NULL,
    reason VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY unique_blocked_date (blocked_date)
);

-- Table for service types and pricing
CREATE TABLE services (
    id INT AUTO_INCREMENT PRIMARY KEY,
    service_type VARCHAR(50) UNIQUE NOT NULL,
    service_name VARCHAR(100) NOT NULL,
    base_price DECIMAL(10,2) NOT NULL,
    description TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default services
INSERT INTO services (service_type, service_name, base_price, description) VALUES
('tree-removal', 'Tree Removal', 300.00, 'Professional tree removal service with cleanup'),
('tree-trimming', 'Tree Trimming', 150.00, 'Expert tree trimming and pruning services'),
('stump-grinding', 'Stump Grinding', 200.00, 'Complete stump removal and grinding'),
('emergency', 'Emergency Service', 400.00, '24/7 emergency tree services'),
('consultation', 'Consultation', 75.00, 'Professional tree assessment and consultation'),
('maintenance', 'Tree Maintenance', 120.00, 'Regular tree care and maintenance services');

-- Create a user for the booking system (adjust credentials as needed)
CREATE USER IF NOT EXISTS 'booking_user'@'localhost' IDENTIFIED BY 'secure_password_123';
GRANT SELECT, INSERT, UPDATE ON stellar_tree_bookings.* TO 'booking_user'@'localhost';
FLUSH PRIVILEGES;

-- Some useful queries for managing bookings:

-- View all pending bookings
-- SELECT * FROM bookings WHERE status = 'pending' ORDER BY booking_date, booking_time;

-- View bookings for a specific date
-- SELECT * FROM bookings WHERE booking_date = '2025-01-20' ORDER BY booking_time;

-- Update booking status
-- UPDATE bookings SET status = 'confirmed' WHERE booking_id = 'BK123456';

-- Get booking statistics
-- SELECT 
--     service_name,
--     COUNT(*) as total_bookings,
--     SUM(service_price) as total_revenue
-- FROM bookings 
-- WHERE status IN ('confirmed', 'completed')
-- GROUP BY service_name;

-- Check availability for a specific date
-- SELECT booking_time FROM bookings 
-- WHERE booking_date = '2025-01-20' AND status != 'cancelled';