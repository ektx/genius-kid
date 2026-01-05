import sqlite3 from 'sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import 'dotenv/config';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const verboseSqlite3 = sqlite3.verbose();

const dbPath = path.resolve(__dirname, '../../', process.env.DB_PATH || './data/database.sqlite');

const db = new verboseSqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error('Database connection error:', err.message);
  } else {
    console.log('Connected to the SQLite database.');
  }
});

/**
 * 封装通用的数据库操作
 */
const dbUtils = {
  run: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.run(sql, params, function (err) {
        if (err) reject(err);
        else resolve({ id: this.lastID, changes: this.changes });
      });
    });
  },

  get: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.get(sql, params, (err, row) => {
        if (err) reject(err);
        else resolve(row);
      });
    });
  },

  all: (sql, params = []) => {
    return new Promise((resolve, reject) => {
      db.all(sql, params, (err, rows) => {
        if (err) reject(err);
        else resolve(rows);
      });
    });
  },

  // 事务支持
  beginTransaction: () => dbUtils.run('BEGIN TRANSACTION'),
  commit: () => dbUtils.run('COMMIT'),
  rollback: () => dbUtils.run('ROLLBACK')
};

export { db, dbUtils };
