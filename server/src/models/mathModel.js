import { dbUtils } from '../utils/db.js'

const MathModel = {
  // 分页查询数学练习记录
  getPracticeRecords: async (userId, page = 1, limit = 10) => {
    const offset = (page - 1) * limit
    const sql = `
      SELECT * FROM math_practice_records 
      WHERE user_id = ? 
      ORDER BY date DESC 
      LIMIT ? OFFSET ?
    `
    const rows = await dbUtils.all(sql, [userId, limit, offset])

    const countSql =
      'SELECT COUNT(*) as total FROM math_practice_records WHERE user_id = ?'
    const { total } = await dbUtils.get(countSql, [userId])

    return { rows, total, page, limit }
  },

  // 插入练习记录
  createPracticeRecord: async record => {
    const {
      id,
      user_id,
      date,
      duration,
      accuracy,
      total_questions,
      wrong_count,
      wrong_details,
      settings
    } = record
    const sql = `
      INSERT INTO math_practice_records (id, user_id, date, duration, accuracy, total_questions, wrong_count, wrong_details, settings)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `
    return await dbUtils.run(sql, [
      id,
      user_id,
      date,
      duration,
      accuracy,
      total_questions || 0,
      wrong_count || 0,
      wrong_details ? JSON.stringify(wrong_details) : null,
      JSON.stringify(settings)
    ])
  },

  // 获取关卡进度
  getProgress: async userId => {
    const sql = 'SELECT * FROM math_progress WHERE user_id = ?'
    return await dbUtils.all(sql, [userId])
  },

  // 获取错误分析数据
  getErrorAnalysis: async userId => {
    const sql = `
      SELECT date, accuracy, total_questions, wrong_count, wrong_details, settings
      FROM math_practice_records
      WHERE user_id = ?
      ORDER BY date ASC
    `
    return await dbUtils.all(sql, [userId])
  },

  // 更新关卡进度
  updateProgress: async (userId, levelId, stars, unlocked) => {
    const sql = `
      INSERT OR REPLACE INTO math_progress (user_id, level_id, stars, unlocked)
      VALUES (?, ?, ?, ?)
    `
    return await dbUtils.run(sql, [userId, levelId, stars, unlocked ? 1 : 0])
  }
}

export default MathModel
