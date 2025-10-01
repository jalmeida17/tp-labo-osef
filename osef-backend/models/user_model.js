const { pool } = require('../config/database');
const sha256 = require('js-sha256');

const UserModel = {
    // Create a new user with safe prepared statement
    async create(userData) {
        const { name, email, password, role } = userData;
        
        // Check if user already exists
        const existingUser = await this.findByEmail(email);
        if (existingUser) {
            throw new Error('User already exists', { cause: 400 });
        }
        
        // Hash password
        const hashedPassword = sha256(password + process.env.SALT);
        
        const query = `
            INSERT INTO users (name, email, password, role, createdAt) 
            VALUES (?, ?, ?, ?, NOW())
        `;
        
        const [result] = await pool.execute(query, [name, email, hashedPassword, role]);
        return result.insertId;
    },

    // Find user by ID
    async findById(id) {
        const query = 'SELECT * FROM users WHERE id = ?';
        const [rows] = await pool.execute(query, [id]);
        return rows[0] || null;
    },

    // Find user by email
    async findByEmail(email) {
        const query = 'SELECT * FROM users WHERE email = ?';
        const [rows] = await pool.execute(query, [email]);
        return rows[0] || null;
    },

    // Get all users
    async findAll() {
        const query = 'SELECT * FROM users ORDER BY createdAt DESC';
        const [rows] = await pool.execute(query);
        return rows;
    },

    // Update user
    async update(id, userData) {
        const { name, email, role } = userData;
        const query = 'UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?';
        const [result] = await pool.execute(query, [name, email, role, id]);
        return result.affectedRows > 0;
    },

    // Delete user
    async delete(id) {
        const query = 'DELETE FROM users WHERE id = ?';
        const [result] = await pool.execute(query, [id]);
        return result.affectedRows > 0;
    }
};

module.exports = UserModel;