# Stellar Tree Management

A professional tree service booking system with admin panel for managing appointments.

## Features

### Booking System
- **Service Selection**: Choose from Tree Removal, Trimming & Pruning, Stump Grinding, or Emergency Service
- **Date & Time Selection**: Interactive calendar with real-time availability
- **Contact Information**: Full name, email, phone number, and service address
- **Address Autocomplete**: Google Places API integration for accurate address formatting
- **Booking Summary**: Review all details before confirmation
- **Email Confirmation**: Automatic confirmation emails sent to customers

### Admin Panel
- **Dashboard**: Overview of all bookings with statistics
- **Booking Management**: View, confirm, complete, cancel, or move bookings
- **Calendar View**: Visual calendar interface for managing appointments
- **Customer Information**: Access to customer contact details and service addresses
- **Notes System**: Add internal notes to bookings
- **Date Blocking**: Block specific dates from bookings

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- npm or yarn

### Installation
1. Clone the repository
2. Install dependencies: `npm install`
3. Start the server: `npm start`
4. Access the application at `http://localhost:3000`

### Address Autocomplete Setup
The system uses the Geoapify API for address search and autocomplete functionality. The API key is already configured in the booking form.

**Features:**
- Real-time address suggestions as you type
- Canada address filtering for better accuracy
- House number and street-level search capabilities
- Formatted address output
- Fallback to manual input if API is unavailable

**Note**: If you need to use a different API key, update the `GEOAPIFY_API_KEY` variable in `booking/index.html`.

### Admin Access
- **URL**: `/admin`
- **Default Password**: `stellar2024`
- **Configuration**: Update password in `admin-config.js`

## File Structure

```
stellartreemanagement/
├── booking/                 # Booking system
│   ├── index.html          # Booking form
│   ├── booking.js          # Booking logic
│   └── booking.css         # Booking styles
├── admin.html              # Admin panel
├── server.js               # Backend API
├── bookings.db             # SQLite database
└── images/                 # Static assets
```

## API Endpoints

- `GET /api/bookings` - Get all bookings
- `POST /api/bookings` - Create new booking
- `PATCH /api/bookings/:id/status` - Update booking status
- `GET /api/availability` - Get availability data
- `GET /api/blocked-dates` - Get blocked dates
- `POST /api/blocked-dates` - Block/unblock dates

## Database Schema

### Bookings Table
- `id` - Primary key
- `booking_id` - Unique booking identifier
- `service` - Service type
- `date` - Booking date
- `time` - Booking time
- `name` - Customer name
- `email` - Customer email
- `phone` - Customer phone number
- `address` - Service address
- `notes` - Additional notes
- `status` - Booking status (pending/confirmed/completed/cancelled)
- `created_at` - Creation timestamp
- `updated_at` - Last update timestamp

## Recent Updates

### Phone and Address Integration
- Added phone number field with automatic formatting
- Added service address field with Google Places autocomplete
- Updated admin panel to display phone and address information
- Enhanced booking cards and detail views
- Improved form validation for new fields

## License

This project is licensed under the MIT License.

