import express from 'express';
import { pinyinController } from '../controllers/pinyinController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/pinyin/records:
 *   post:
 *     summary: 保存拼音练习记录
 *     security:
 *       - bearerAuth: []
 *     tags: [Pinyin]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               id:
 *                 type: string
 *               score:
 *                 type: integer
 *               mode:
 *                 type: string
 *               date:
 *                 type: string
 *     responses:
 *       200:
 *         description: 成功
 */
router.post('/records', authenticateToken, pinyinController.saveRecord);

/**
 * @swagger
 * /api/pinyin/records:
 *   get:
 *     summary: 获取用户拼音练习记录
 *     security:
 *       - bearerAuth: []
 *     tags: [Pinyin]
 *     responses:
 *       200:
 *         description: 成功
 */
router.get('/records', authenticateToken, pinyinController.getRecords);

export default router;
