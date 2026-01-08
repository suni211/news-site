import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

const CategoryPage = () => {
  const { id } = useParams();
  const [articles, setArticles] = useState([]);
  const [categoryName, setCategoryName] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchArticles();
  }, [id]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/articles?category=${id}`);
      setArticles(response.data.articles);

      if (response.data.articles.length > 0) {
        setCategoryName(response.data.articles[0].category_name);
      }
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
    <div>
      <h2>{categoryName} 뉴스</h2>

      {articles.length === 0 ? (
        <p>기사가 없습니다</p>
      ) : (
        <div className="articles-grid">
          {articles.map(article => (
            <article key={article.id} className="article-card">
              {article.thumbnail_url && (
                <img src={article.thumbnail_url} alt={article.title} className="article-thumbnail" />
              )}
              <div className="article-content">
                <div className="article-meta">
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
      )}
    </div>
  );
};

export default CategoryPage;
