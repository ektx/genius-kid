const express = require('express');
const router = express.Router();
const mathController = require('../controllers/mathController');
const auth = require('../middleware/auth');

/**
 * @swagger
 * tags:
 *   name: Math
 *   description: 数学练习与进度管理
 */

/**
 * @swagger
 * /api/math/practice:
 *   get:
 *     summary: 获取数学练习历史记录
 *     tags: [Math]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *         description: 页码
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *         description: 每页条数
 *     responses:
 *       200:
 *         description: 成功返回练习记录
 */
router.get('/practice', auth, mathController.getPracticeRecords);

/**
 * @swagger
 * /api/math/practice:
 *   post:
 *     summary: 提交新的数学练习记录
 *     tags: [Math]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: 记录提交成功
 */
router.post('/practice', auth, mathController.addPracticeRecord);

/**
 * @swagger
 * /api/math/progress:
 *   get:
 *     summary: 获取用户数学关卡进度
 *     tags: [Math]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功返回进度列表
 */
router.get('/progress', auth, mathController.getProgress);

/**
 * @swagger
 * /api/math/progress:
 *   post:
 *     summary: 更新用户数学关卡进度
 *     tags: [Math]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: 进度更新成功
 */
router.post('/progress', auth, mathController.updateProgress);

module.exports = router;
