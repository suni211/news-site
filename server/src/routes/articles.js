import express from 'express';
import { body, validationResult } from 'express-validator';
import { dbRun, dbGet, dbAll } from '../database/db.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 기사 목록 조회 (페이지네이션)
router.get('/', async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;
    const categoryId = req.query.category;

    let query = `
      SELECT a.*, u.username as author_name, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.published = 1
    `;
    let params = [];

    if (categoryId) {
      query += ' AND a.category_id = ?';
      params.push(categoryId);
    }

    query += ' ORDER BY a.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);

    const articles = await dbAll(query, params);

    // 총 개수 조회
    let countQuery = 'SELECT COUNT(*) as total FROM articles WHERE published = 1';
    let countParams = [];
    if (categoryId) {
      countQuery += ' AND category_id = ?';
      countParams.push(categoryId);
    }
    const { total } = await dbGet(countQuery, countParams);

    res.json({
      articles,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('기사 목록 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 기사 상세 조회
router.get('/:id', async (req, res) => {
  try {
    const article = await dbGet(`
      SELECT a.*, u.username as author_name, c.name as category_name
      FROM articles a
      LEFT JOIN users u ON a.author_id = u.id
      LEFT JOIN categories c ON a.category_id = c.id
      WHERE a.id = ?
    `, [req.params.id]);

    if (!article) {
      return res.status(404).json({ error: '기사를 찾을 수 없습니다' });
    }

    // 조회수 증가
    await dbRun('UPDATE articles SET view_count = view_count + 1 WHERE id = ?', [req.params.id]);

    // 태그 조회
    const tags = await dbAll(`
      SELECT t.* FROM tags t
      INNER JOIN article_tags at ON t.id = at.tag_id
      WHERE at.article_id = ?
    `, [req.params.id]);

    res.json({ ...article, tags });
  } catch (error) {
    console.error('기사 상세 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 기사 작성 (관리자)
router.post('/',
  authenticateToken,
  requireAdmin,
  body('title').trim().notEmpty().withMessage('제목을 입력하세요'),
  body('content').trim().notEmpty().withMessage('내용을 입력하세요'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content, excerpt, thumbnail_url, category_id, tags, published } = req.body;
      const slug = title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-');

      const result = await dbRun(`
        INSERT INTO articles (title, slug, content, excerpt, thumbnail_url, author_id, category_id, published)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `, [title, slug, content, excerpt, thumbnail_url, req.user.id, category_id, published ? 1 : 0]);

      const articleId = result.lastID;

      // 태그 추가
      if (tags && Array.isArray(tags)) {
        for (const tagName of tags) {
          const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-');

          // 태그가 없으면 생성
          let tag = await dbGet('SELECT * FROM tags WHERE name = ?', [tagName]);
          if (!tag) {
            const tagResult = await dbRun('INSERT INTO tags (name, slug) VALUES (?, ?)', [tagName, tagSlug]);
            tag = { id: tagResult.lastID };
          }

          // 기사-태그 연결
          await dbRun('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)', [articleId, tag.id]);
        }
      }

      res.status(201).json({ message: '기사가 작성되었습니다', articleId });
    } catch (error) {
      console.error('기사 작성 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다' });
    }
  }
);

// 기사 수정 (관리자)
router.put('/:id',
  authenticateToken,
  requireAdmin,
  body('title').trim().notEmpty().withMessage('제목을 입력하세요'),
  body('content').trim().notEmpty().withMessage('내용을 입력하세요'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { title, content, excerpt, thumbnail_url, category_id, tags, published } = req.body;
      const slug = title.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-');

      await dbRun(`
        UPDATE articles
        SET title = ?, slug = ?, content = ?, excerpt = ?, thumbnail_url = ?,
            category_id = ?, published = ?, updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
      `, [title, slug, content, excerpt, thumbnail_url, category_id, published ? 1 : 0, req.params.id]);

      // 기존 태그 삭제 후 재추가
      await dbRun('DELETE FROM article_tags WHERE article_id = ?', [req.params.id]);

      if (tags && Array.isArray(tags)) {
        for (const tagName of tags) {
          const tagSlug = tagName.toLowerCase().replace(/[^a-z0-9가-힣]+/g, '-');

          let tag = await dbGet('SELECT * FROM tags WHERE name = ?', [tagName]);
          if (!tag) {
            const tagResult = await dbRun('INSERT INTO tags (name, slug) VALUES (?, ?)', [tagName, tagSlug]);
            tag = { id: tagResult.lastID };
          }

          await dbRun('INSERT INTO article_tags (article_id, tag_id) VALUES (?, ?)', [req.params.id, tag.id]);
        }
      }

      res.json({ message: '기사가 수정되었습니다' });
    } catch (error) {
      console.error('기사 수정 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다' });
    }
  }
);

// 기사 삭제 (관리자)
router.delete('/:id', authenticateToken, requireAdmin, async (req, res) => {
  try {
    await dbRun('DELETE FROM articles WHERE id = ?', [req.params.id]);
    res.json({ message: '기사가 삭제되었습니다' });
  } catch (error) {
    console.error('기사 삭제 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

export default router;
