const { pool } = require('../config/database');

const EventModel = {
    // Create a new event with safe prepared statement
    async create(eventData) {
        const { startDate, endDate, title, description, createdBy } = eventData;
        
        const query = `
            INSERT INTO events (startDate, endDate, title, description, createdBy, createdAt) 
            VALUES (?, ?, ?, ?, ?, NOW())
        `;
        
        // Convert ISO strings to Date objects for MySQL
        const startDateObj = new Date(startDate);
        const endDateObj = new Date(endDate);
        
        const [result] = await pool.execute(query, [startDateObj, endDateObj, title, description, createdBy]);
        return result.insertId;
    },

    // Find event by ID with creator info
    async findById(id) {
        const query = `
            SELECT e.*, u.name as creatorName, u.email as creatorEmail 
            FROM events e 
            LEFT JOIN users u ON e.createdBy = u.id 
            WHERE e.id = ?
        `;
        const [rows] = await pool.execute(query, [id]);
        return rows[0] || null;
    },

    // Get all events with creator info
    async findAll() {
        const query = `
            SELECT e.*, u.name as creatorName, u.email as creatorEmail 
            FROM events e 
            LEFT JOIN users u ON e.createdBy = u.id 
            ORDER BY e.startDate ASC
        `;
        const [rows] = await pool.execute(query);
        return rows;
    },

    // Get events created by a specific user
    async findByCreator(userId) {
        const query = `
            SELECT e.*, u.name as creatorName, u.email as creatorEmail 
            FROM events e 
            LEFT JOIN users u ON e.createdBy = u.id 
            WHERE e.createdBy = ? 
            ORDER BY e.startDate ASC
        `;
        const [rows] = await pool.execute(query, [userId]);
        return rows;
    },

    // Update event
    async update(id, eventData) {
        const { startDate, endDate, title, description } = eventData;
        
        // Convert ISO strings to Date objects for MySQL
        const startDateObj = startDate ? new Date(startDate) : null;
        const endDateObj = endDate ? new Date(endDate) : null;
        
        const query = 'UPDATE events SET startDate = ?, endDate = ?, title = ?, description = ? WHERE id = ?';
        const [result] = await pool.execute(query, [startDateObj, endDateObj, title, description, id]);
        return result.affectedRows > 0;
    },

    // Delete event
    async delete(id) {
        // First delete associated event_users records
        await pool.execute('DELETE FROM event_users WHERE eventId = ?', [id]);
        
        // Then delete the event
        const query = 'DELETE FROM events WHERE id = ?';
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }
};

const EventUserModel = {
    // Add user to event
    async addUserToEvent(eventId, userId) {
        const query = 'INSERT IGNORE INTO event_users (eventId, userId) VALUES (?, ?)';
        const [result] = await pool.execute(query, [eventId, userId]);
        return result.affectedRows > 0;
    },

    // Remove user from event
    async removeUserFromEvent(eventId, userId) {
        const query = 'DELETE FROM event_users WHERE eventId = ? AND userId = ?';
        const [result] = await pool.execute(query, [eventId, userId]);
        return result.affectedRows > 0;
    },

    // Get users for an event
    async getUsersForEvent(eventId) {
        const query = `
            SELECT u.* 
            FROM users u 
            INNER JOIN event_users eu ON u.id = eu.userId 
            WHERE eu.eventId = ?
        `;
        const [rows] = await pool.execute(query, [eventId]);
        return rows;
    },

    // Get events for a user
    async getEventsForUser(userId) {
        const query = `
            SELECT e.*, u.name as creatorName, u.email as creatorEmail 
            FROM events e 
            INNER JOIN event_users eu ON e.id = eu.eventId 
            LEFT JOIN users u ON e.createdBy = u.id 
            WHERE eu.userId = ? 
            ORDER BY e.startDate ASC
        `;
        const [rows] = await pool.execute(query, [userId]);
        return rows;
    }
};

module.exports = { EventModel, EventUserModel };