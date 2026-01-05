import { dbUtils } from '../utils/db.js';
import { fileURLToPath } from 'url';

async function migrate() {
  console.log('Running migrations...');
  
  try {
    await dbUtils.beginTransaction();

    // 用户表
    await dbUtils.run(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        email TEXT UNIQUE,
        password TEXT NOT NULL,
        login_attempts INTEGER DEFAULT 0,
        lock_until DATETIME,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // 拼音练习记录
    await dbUtils.run(`
      CREATE TABLE IF NOT EXISTS pinyin_records (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        score INTEGER,
        mode TEXT,
        date TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // 数学关卡进度
    await dbUtils.run(`
      CREATE TABLE IF NOT EXISTS math_progress (
        user_id INTEGER,
        level_id INTEGER,
        stars INTEGER,
        unlocked INTEGER,
        PRIMARY KEY(user_id, level_id),
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    // 数学练习历史
    await dbUtils.run(`
      CREATE TABLE IF NOT EXISTS math_practice_records (
        id TEXT PRIMARY KEY,
        user_id INTEGER,
        date TEXT,
        duration TEXT,
        accuracy INTEGER,
        settings TEXT,
        FOREIGN KEY(user_id) REFERENCES users(id)
      )
    `);

    await dbUtils.commit();
    console.log('Migrations completed successfully.');
  } catch (err) {
    await dbUtils.rollback();
    console.error('Migration failed:', err.message);
    process.exit(1);
  }
}

// 在 ES 模块中判断是否为直接运行
const isMain = process.argv[1] === fileURLToPath(import.meta.url);
if (isMain) {
  migrate();
}

export default migrate;
