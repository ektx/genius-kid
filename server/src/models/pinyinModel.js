import { dbUtils } from '../utils/db.js';

export const pinyinModel = {
  createRecord: async (userId, record) => {
    const sql = `
      INSERT INTO pinyin_records (id, user_id, score, mode, date)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(id) DO UPDATE SET
        score = excluded.score,
        mode = excluded.mode,
        date = excluded.date
    `;
    return await dbUtils.run(sql, [
      record.id || Date.now().toString(),
      userId,
      record.score,
      record.mode,
      record.date
    ]);
  },

  getRecordsByUserId: async (userId) => {
    const sql = 'SELECT * FROM pinyin_records WHERE user_id = ? ORDER BY date DESC';
    return await dbUtils.all(sql, [userId]);
  }
};
