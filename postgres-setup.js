// PostgreSQL Database Setup for Render
// This file helps migrate from SQLite to PostgreSQL for free persistent storage

const { Pool } = require('pg');

// Database connection configuration
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Initialize database tables
async function initializeDatabase() {
    const client = await pool.connect();
    
    try {
        // Create customers table
        await client.query(`
            CREATE TABLE IF NOT EXISTS customers (
                id SERIAL PRIMARY KEY,
                customer_id VARCHAR(255) UNIQUE NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50) NOT NULL,
                address TEXT,
                notes TEXT,
                total_bookings INTEGER DEFAULT 0,
                total_spent DECIMAL(10,2) DEFAULT 0,
                first_booking_date DATE,
                last_booking_date DATE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        // Create bookings table
        await client.query(`
            CREATE TABLE IF NOT EXISTS bookings (
                id SERIAL PRIMARY KEY,
                booking_id VARCHAR(255) UNIQUE NOT NULL,
                customer_id VARCHAR(255),
                service VARCHAR(255) NOT NULL,
                date DATE NOT NULL,
                time VARCHAR(50) NOT NULL,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) NOT NULL,
                phone VARCHAR(50),
                address TEXT,
                notes TEXT,
                images TEXT,
                status VARCHAR(50) DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (customer_id) REFERENCES customers(customer_id)
            )
        `);

        // Create blocked_dates table
        await client.query(`
            CREATE TABLE IF NOT EXISTS blocked_dates (
                id SERIAL PRIMARY KEY,
                date DATE UNIQUE NOT NULL,
                reason TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);

        console.log('PostgreSQL database initialized successfully');
    } catch (error) {
        console.error('Error initializing database:', error);
        throw error;
    } finally {
        client.release();
    }
}

// Helper functions for database operations
const db = {
    // Generic query method
    async query(query, params = []) {
        const client = await pool.connect();
        try {
            const result = await client.query(query, params);
            return result;
        } finally {
            client.release();
        }
    },
    // Customer operations
    async createCustomer(customerData) {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                INSERT INTO customers (customer_id, name, email, phone, address, notes)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
            `, [customerData.customer_id, customerData.name, customerData.email, 
                customerData.phone, customerData.address, customerData.notes]);
            return result.rows[0];
        } finally {
            client.release();
        }
    },

    async getCustomer(customerId) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'SELECT * FROM customers WHERE customer_id = $1',
                [customerId]
            );
            return result.rows[0];
        } finally {
            client.release();
        }
    },

    async updateCustomer(customerId, updates) {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                UPDATE customers 
                SET name = $1, email = $2, phone = $3, address = $4, notes = $5, updated_at = CURRENT_TIMESTAMP
                WHERE customer_id = $6
                RETURNING *
            `, [updates.name, updates.email, updates.phone, updates.address, updates.notes, customerId]);
            return result.rows[0];
        } finally {
            client.release();
        }
    },

    // Booking operations
    async createBooking(bookingData) {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                INSERT INTO bookings (booking_id, customer_id, service, date, time, name, email, phone, address, notes, images)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11)
                RETURNING *
            `, [bookingData.booking_id, bookingData.customer_id, bookingData.service,
                bookingData.date, bookingData.time, bookingData.name, bookingData.email,
                bookingData.phone, bookingData.address, bookingData.notes, bookingData.images]);
            return result.rows[0];
        } finally {
            client.release();
        }
    },

    async getBookings(status = null) {
        const client = await pool.connect();
        try {
            let query = 'SELECT * FROM bookings ORDER BY created_at DESC';
            let params = [];
            
            if (status) {
                query = 'SELECT * FROM bookings WHERE status = $1 ORDER BY created_at DESC';
                params = [status];
            }
            
            const result = await client.query(query, params);
            return result.rows;
        } finally {
            client.release();
        }
    },

    async updateBookingStatus(bookingId, status) {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                UPDATE bookings 
                SET status = $1, updated_at = CURRENT_TIMESTAMP
                WHERE booking_id = $2
                RETURNING *
            `, [status, bookingId]);
            return result.rows[0];
        } finally {
            client.release();
        }
    },

    // Blocked dates operations
    async addBlockedDate(date, reason) {
        const client = await pool.connect();
        try {
            const result = await client.query(`
                INSERT INTO blocked_dates (date, reason)
                VALUES ($1, $2)
                ON CONFLICT (date) DO UPDATE SET reason = $2
                RETURNING *
            `, [date, reason]);
            return result.rows[0];
        } finally {
            client.release();
        }
    },

    async getBlockedDates() {
        const client = await pool.connect();
        try {
            const result = await client.query('SELECT * FROM blocked_dates ORDER BY date');
            return result.rows;
        } finally {
            client.release();
        }
    },

    async removeBlockedDate(date) {
        const client = await pool.connect();
        try {
            const result = await client.query(
                'DELETE FROM blocked_dates WHERE date = $1 RETURNING *',
                [date]
            );
            return result.rows[0];
        } finally {
            client.release();
        }
    }
};

module.exports = { pool, initializeDatabase, db }; 