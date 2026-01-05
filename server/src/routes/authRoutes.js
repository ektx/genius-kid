import express from 'express';
import authController from '../controllers/authController.js';
import auth from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: 用户认证管理
 */

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: 注册新用户
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: 注册成功
 */
router.post('/register', authController.register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: 用户登录
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *               remember_me:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: 登录成功
 */
router.post('/login', authController.login);

/**
 * @swagger
 * /api/auth/me:
 *   get:
 *     summary: 获取当前登录用户信息
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: 成功返回用户信息
 */
router.get('/me', auth, authController.me);

export default router;
