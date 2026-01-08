import express from 'express';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { body, validationResult } from 'express-validator';
import { dbRun, dbGet } from '../database/db.js';

const router = express.Router();

// 회원가입
router.post('/register',
  body('username').trim().isLength({ min: 3 }).withMessage('사용자명은 최소 3자 이상이어야 합니다'),
  body('email').isEmail().withMessage('유효한 이메일을 입력하세요'),
  body('password').isLength({ min: 6 }).withMessage('비밀번호는 최소 6자 이상이어야 합니다'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { username, email, password } = req.body;

      // 중복 확인
      const existingUser = await dbGet(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, email]
      );

      if (existingUser) {
        return res.status(400).json({ error: '이미 존재하는 사용자명 또는 이메일입니다' });
      }

      // 비밀번호 해시
      const hashedPassword = await bcrypt.hash(password, 10);

      // 사용자 생성
      const result = await dbRun(
        'INSERT INTO users (username, email, password) VALUES (?, ?, ?)',
        [username, email, hashedPassword]
      );

      res.status(201).json({
        message: '회원가입이 완료되었습니다',
        userId: result.lastID
      });
    } catch (error) {
      console.error('회원가입 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다' });
    }
  }
);

// 로그인
router.post('/login',
  body('email').isEmail().withMessage('유효한 이메일을 입력하세요'),
  body('password').notEmpty().withMessage('비밀번호를 입력하세요'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { email, password } = req.body;

      // 사용자 찾기
      const user = await dbGet('SELECT * FROM users WHERE email = ?', [email]);

      if (!user) {
        return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
      }

      // 비밀번호 확인
      const validPassword = await bcrypt.compare(password, user.password);

      if (!validPassword) {
        return res.status(401).json({ error: '이메일 또는 비밀번호가 올바르지 않습니다' });
      }

      // JWT 토큰 생성
      const token = jwt.sign(
        { id: user.id, username: user.username, role: user.role },
        process.env.JWT_SECRET,
        { expiresIn: '24h' }
      );

      res.json({
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          role: user.role
        }
      });
    } catch (error) {
      console.error('로그인 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다' });
    }
  }
);

export default router;
