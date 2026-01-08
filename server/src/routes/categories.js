import express from 'express';
import { dbAll } from '../database/db.js';

const router = express.Router();

// 카테고리 목록 조회
router.get('/', async (req, res) => {
  try {
    const categories = await dbAll(`
      SELECT c.*, COUNT(a.id) as article_count
      FROM categories c
      LEFT JOIN articles a ON c.id = a.category_id AND a.published = 1
      GROUP BY c.id
      ORDER BY c.name
    `);

    res.json(categories);
  } catch (error) {
    console.error('카테고리 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

export default router;
