const pool = require('../config/mysql');

const User = {
    async findAll() {
        const [rows] = await pool.query('SELECT * FROM users');
        return rows;
    },
    async findById(id) {
        const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [id]);
        return rows[0];
    },
    async create(nome) {
        const [result] = await pool.query('INSERT INTO users (nome) VALUES (?)', [nome]);
        return { id: result.insertId, nome };
    },
    async update(id, nome) {
        await pool.query('UPDATE users SET nome = ? WHERE id = ?', [nome, id]);
        return { id, nome };
    },
    async delete(id) {
        await pool.query('DELETE FROM users WHERE id = ?', [id]);
    }
};

module.exports = User;
