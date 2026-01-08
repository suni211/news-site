import express from 'express';
import { body, validationResult } from 'express-validator';
import { dbRun, dbAll } from '../database/db.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 특정 기사의 댓글 목록 조회
router.get('/articles/:articleId/comments', async (req, res) => {
  try {
    const comments = await dbAll(`
      SELECT c.*, u.username
      FROM comments c
      LEFT JOIN users u ON c.user_id = u.id
      WHERE c.article_id = ?
      ORDER BY c.created_at DESC
    `, [req.params.articleId]);

    res.json(comments);
  } catch (error) {
    console.error('댓글 조회 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

// 댓글 작성
router.post('/articles/:articleId/comments',
  authenticateToken,
  body('content').trim().notEmpty().withMessage('댓글 내용을 입력하세요'),
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { content } = req.body;
      const result = await dbRun(
        'INSERT INTO comments (article_id, user_id, content) VALUES (?, ?, ?)',
        [req.params.articleId, req.user.id, content]
      );

      res.status(201).json({
        message: '댓글이 작성되었습니다',
        commentId: result.lastID
      });
    } catch (error) {
      console.error('댓글 작성 오류:', error);
      res.status(500).json({ error: '서버 오류가 발생했습니다' });
    }
  }
);

// 댓글 삭제 (본인 또는 관리자)
router.delete('/comments/:id', authenticateToken, async (req, res) => {
  try {
    const comment = await dbAll('SELECT * FROM comments WHERE id = ?', [req.params.id]);

    if (!comment) {
      return res.status(404).json({ error: '댓글을 찾을 수 없습니다' });
    }

    // 본인 댓글이거나 관리자인 경우에만 삭제 가능
    if (comment.user_id !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: '댓글 삭제 권한이 없습니다' });
    }

    await dbRun('DELETE FROM comments WHERE id = ?', [req.params.id]);
    res.json({ message: '댓글이 삭제되었습니다' });
  } catch (error) {
    console.error('댓글 삭제 오류:', error);
    res.status(500).json({ error: '서버 오류가 발생했습니다' });
  }
});

export default router;
