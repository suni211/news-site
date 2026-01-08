import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './ArticleDetail.css';

const ArticleDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [article, setArticle] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentContent, setCommentContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticle();
    fetchComments();
  }, [id]);

  const fetchArticle = async () => {
    try {
      const response = await axios.get(`/api/articles/${id}`);
      setArticle(response.data);
    } catch (error) {
      console.error('기사 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const response = await axios.get(`/api/articles/${id}/comments`);
      setComments(response.data);
    } catch (error) {
      console.error('댓글 조회 실패:', error);
    }
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();

    if (!user) {
      alert('로그인이 필요합니다');
      return;
    }

    try {
      await axios.post(`/api/articles/${id}/comments`, {
        content: commentContent
      });

      setCommentContent('');
      fetchComments();
    } catch (error) {
      console.error('댓글 작성 실패:', error);
      alert('댓글 작성에 실패했습니다');
    }
  };

  const handleDeleteComment = async (commentId) => {
    if (!confirm('댓글을 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`/api/comments/${commentId}`);
      fetchComments();
    } catch (error) {
      console.error('댓글 삭제 실패:', error);
      alert('댓글 삭제에 실패했습니다');
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  if (!article) {
    return <div>기사를 찾을 수 없습니다</div>;
  }

  return (
    <div className="article-detail">
      <article>
        <div className="article-header">
          <div className="article-meta">
            <span className="category">{article.category_name}</span>
            <span className="date">{new Date(article.created_at).toLocaleDateString('ko-KR')}</span>
          </div>
          <h1>{article.title}</h1>
          <div className="article-info">
            <span>작성자: {article.author_name}</span>
            <span>조회수: {article.view_count}</span>
          </div>
        </div>

        {article.thumbnail_url && (
          <img src={article.thumbnail_url} alt={article.title} className="article-image" />
        )}

        <div className="article-content" dangerouslySetInnerHTML={{ __html: article.content.replace(/\n/g, '<br />') }} />

        {article.tags && article.tags.length > 0 && (
          <div className="tags">
            {article.tags.map(tag => (
              <span key={tag.id} className="tag">#{tag.name}</span>
            ))}
          </div>
        )}
      </article>

      <section className="comments-section">
        <h2>댓글 ({comments.length})</h2>

        {user ? (
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <textarea
              value={commentContent}
              onChange={(e) => setCommentContent(e.target.value)}
              placeholder="댓글을 입력하세요"
              required
            />
            <button type="submit" className="btn btn-primary">
              댓글 작성
            </button>
          </form>
        ) : (
          <p className="login-message">댓글을 작성하려면 로그인하세요</p>
        )}

        <div className="comments-list">
          {comments.map(comment => (
            <div key={comment.id} className="comment">
              <div className="comment-header">
                <span className="comment-author">{comment.username}</span>
                <span className="comment-date">
                  {new Date(comment.created_at).toLocaleString('ko-KR')}
                </span>
              </div>
              <p className="comment-content">{comment.content}</p>
              {user && (user.id === comment.user_id || user.role === 'admin') && (
                <button
                  onClick={() => handleDeleteComment(comment.id)}
                  className="btn btn-danger btn-sm"
                >
                  삭제
                </button>
              )}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default ArticleDetail;
