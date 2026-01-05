import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import UserModel from '../models/userModel.js';

const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME = 2 * 60 * 60 * 1000; // 2 hours

const authController = {
  register: async (req, res) => {
    try {
      const { username, email, password } = req.body;

      // 检查用户是否已存在
      const existingUser = await UserModel.findByUsernameOrEmail(username);
      if (existingUser) {
        return res.status(400).json({ success: false, error: '用户名或邮箱已存在' });
      }

      // 加密密码
      const hashedPassword = await bcrypt.hash(password, 10);

      // 创建用户
      await UserModel.create({ username, email, password: hashedPassword });

      res.status(201).json({ success: true, message: '注册成功' });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  login: async (req, res) => {
    try {
      const { username, password, remember_me } = req.body;

      const user = await UserModel.findByUsernameOrEmail(username);
      if (!user) {
        return res.status(401).json({ success: false, error: '用户名或密码错误' });
      }

      // 检查账户是否被锁定
      if (user.lock_until && user.lock_until > Date.now()) {
        return res.status(403).json({ 
          success: false, 
          error: `账户已被锁定，请稍后再试。剩余时间: ${Math.ceil((user.lock_until - Date.now()) / 60000)} 分钟` 
        });
      }

      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        // 更新登录失败次数
        const attempts = (user.login_attempts || 0) + 1;
        let lockUntil = null;
        if (attempts >= MAX_LOGIN_ATTEMPTS) {
          lockUntil = Date.now() + LOCK_TIME;
        }
        await UserModel.updateLoginAttempts(user.id, attempts, lockUntil);

        return res.status(401).json({ success: false, error: '用户名或密码错误' });
      }

      // 登录成功，重置失败次数
      await UserModel.resetLoginAttempts(user.id);

      // 生成 JWT
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || 'your_jwt_secret',
        { expiresIn: remember_me ? '30d' : '24h' }
      );

      res.json({
        success: true,
        data: {
          token,
          user: {
            id: user.id,
            username: user.username,
            email: user.email
          }
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  },

  me: async (req, res) => {
    try {
      const user = await UserModel.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ success: false, error: '用户不存在' });
      }
      res.json({
        success: true,
        data: {
          id: user.id,
          username: user.username,
          email: user.email
        }
      });
    } catch (err) {
      res.status(500).json({ success: false, error: err.message });
    }
  }
};

export default authController;
