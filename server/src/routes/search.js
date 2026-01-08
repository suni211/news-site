import express from 'express';
import { dbAll } from '../database/db.js';

const router = express.Router();

// 기사 검색
router.get('/', async (req, res) => {
  try {
    const query = req.query.q;

    if (!query) {
      return res.status(400).json({ error: '검색어를 입력하세요' });
    }

    const searchPattern = `%${query}%`;

    const articles = await dbAll(`
      SELECT a.*, u.username as author_name, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.published = 1
        AND (a.title LIKE ? OR a.content LIKE ? OR a.excerpt LIKE ?)
      ORDER BY a.created_at DESC
      LIMIT 50
    `, [searchPattern, searchPattern, searchPattern]);

    res.json({
      query,
      results: articles,
      count: articles.length
    });
  } catch (error) {
    console.error('검색 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

export default router;
