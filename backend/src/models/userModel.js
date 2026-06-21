const pool = require('../config/mysql');
const bcrypt = require('bcryptjs');

const User = {
    async init() {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS users (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(255) NOT NULL UNIQUE,
                password VARCHAR(255) NOT NULL,
                role VARCHAR(50) DEFAULT 'user'
            )
        `);
        
        // Seed a default admin if table is empty
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', ['admin']);
        if (rows.length === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query('INSERT INTO users (username, password, role) VALUES (?, ?, ?)', ['admin', hashedPassword, 'admin']);
            console.log('Seeded default admin user (admin/admin123)');
        }
    },

    async findAll() {
        const [rows] = await pool.query('SELECT id, username, role FROM users');
        return rows;
    },

    async findById(id) {
        const [rows] = await pool.query('SELECT id, username, role FROM users WHERE id = ?', [id]);
        return rows[0];
    },

    async findByUsername(username) {
        const [rows] = await pool.query('SELECT * FROM users WHERE username = ?', [username]);
        return rows[0];
    },

    async create({ username, password, role }) {
        const hashedPassword = await bcrypt.hash(password, 10);
        const [result] = await pool.query(
            'INSERT INTO users (username, password, role) VALUES (?, ?, ?)',
            [username, hashedPassword, role || 'user']
        );
        return { id: result.insertId, username, role: role || 'user' };
    },

    async update(id, { username, role, password }) {
        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            await pool.query(
                'UPDATE users SET username = ?, role = ?, password = ? WHERE id = ?',
                [username, role, hashedPassword, id]
            );
        } else {
            await pool.query(
                'UPDATE users SET username = ?, role = ? WHERE id = ?',
                [username, role, id]
            );
        }
        return { id, username, role };
    },

    async delete(id) {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
    }
};

module.exports = User;
