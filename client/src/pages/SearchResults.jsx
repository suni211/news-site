import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';

const SearchResults = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q');
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (query) {
      fetchResults();
    }
  }, [query]);

  const fetchResults = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/search?q=${encodeURIComponent(query)}`);
      setArticles(response.data.results);
    } catch (error) {
      console.error('검색 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="loading">검색 중...</div>;
  }

  return (
    <div>
      <h2>"{query}" 검색 결과 ({articles.length})</h2>

      {articles.length === 0 ? (
        <p>검색 결과가 없습니다</p>
      ) : (
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
      )}
    </div>
  );
};

export default SearchResults;
