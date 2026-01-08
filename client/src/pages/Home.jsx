import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import './Home.css';

const Home = () => {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchArticles();
  }, [page]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/articles?page=${page}&limit=10`);
      setArticles(response.data.articles);
      setTotalPages(response.data.pagination.totalPages);
    } catch (error) {
      console.error('기사 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="home">
      <h2>최신 뉴스</h2>

      <div className="articles-grid">
        {articles.map(article => (
          <article key={article.id} className="article-card">
            {article.thumbnail_url && (
              <img src={article.thumbnail_url} alt={article.title} className="article-thumbnail" />
            )}
            <div className="article-content">
              <div className="article-meta">
                <span className="category">{article.category_name}</span>
                <span className="date">{new Date(article.created_at).toLocaleDateString('ko-KR')}</span>
              </div>
              <Link to={`/articles/${article.id}`}>
                <h3>{article.title}</h3>
              </Link>
              <p className="excerpt">{article.excerpt}</p>
              <div className="article-footer">
                <span className="author">{article.author_name}</span>
                <span className="views">조회 {article.view_count}</span>
              </div>
            </div>
          </article>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="pagination">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="btn btn-secondary"
          >
            이전
          </button>
          <span>페이지 {page} / {totalPages}</span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="btn btn-secondary"
          >
            다음
          </button>
        </div>
      )}
    </div>
  );
};

export default Home;
