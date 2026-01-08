import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initDatabase } from './database/db.js';

// 라우트 임포트
import authRoutes from './routes/auth.js';
import articleRoutes from './routes/articles.js';
import commentRoutes from './routes/comments.js';
import categoryRoutes from './routes/categories.js';
import searchRoutes from './routes/search.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// 미들웨어
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 라우트
app.use('/api/auth', authRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api', commentRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/search', searchRoutes);

// 기본 라우트
app.get('/', (req, res) => {
  res.json({ message: '뉴스 사이트 API 서버' });
});

// 데이터베이스 초기화 및 서버 시작
initDatabase()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🚀 서버가 포트 ${PORT}에서 실행 중입니다`);
    });
  })
  .catch((error) => {
    console.error('서버 시작 실패:', error);
    process.exit(1);
  });
