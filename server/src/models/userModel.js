import { dbUtils } from '../utils/db.js';

const UserModel = {
  findByUsernameOrEmail: async (identifier) => {
    const sql = 'SELECT * FROM users WHERE username = ? OR email = ?';
    return await dbUtils.get(sql, [identifier, identifier]);
  },

  findById: async (id) => {
    const sql = 'SELECT * FROM users WHERE id = ?';
    return await dbUtils.get(sql, [id]);
  },

  create: async (userData) => {
    const { username, email, password } = userData;
    const sql = 'INSERT INTO users (username, email, password) VALUES (?, ?, ?)';
    return await dbUtils.run(sql, [username, email, password]);
  },

  updateLoginAttempts: async (userId, attempts, lockUntil = null) => {
    const sql = 'UPDATE users SET login_attempts = ?, lock_until = ? WHERE id = ?';
    return await dbUtils.run(sql, [attempts, lockUntil, userId]);
  },

  resetLoginAttempts: async (userId) => {
    const sql = 'UPDATE users SET login_attempts = 0, lock_until = NULL WHERE id = ?';
    return await dbUtils.run(sql, [userId]);
  }
};

export default UserModel;
