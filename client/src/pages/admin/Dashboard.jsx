import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import './Dashboard.css';

const Dashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchArticles();
  }, [user, navigate]);

  const fetchArticles = async () => {
    try {
      const response = await axios.get('/api/articles?limit=100');
      setArticles(response.data.articles);
    } catch (error) {
      console.error('기사 조회 실패:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('정말 삭제하시겠습니까?')) return;

    try {
      await axios.delete(`/api/articles/${id}`);
      fetchArticles();
      alert('기사가 삭제되었습니다');
    } catch (error) {
      console.error('기사 삭제 실패:', error);
      alert('기사 삭제에 실패했습니다');
    }
  };

  if (loading) {
    return <div className="loading">로딩 중...</div>;
  }

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <h2>관리자 대시보드</h2>
        <Link to="/admin/articles/new" className="btn btn-primary">
          새 기사 작성
        </Link>
      </div>

      <div className="articles-table">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>제목</th>
              <th>카테고리</th>
              <th>작성자</th>
              <th>조회수</th>
              <th>발행</th>
              <th>작성일</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {articles.map(article => (
              <tr key={article.id}>
                <td>{article.id}</td>
                <td>
                  <Link to={`/articles/${article.id}`}>{article.title}</Link>
                </td>
                <td>{article.category_name}</td>
                <td>{article.author_name}</td>
                <td>{article.view_count}</td>
                <td>{article.published ? '✓' : '✗'}</td>
                <td>{new Date(article.created_at).toLocaleDateString('ko-KR')}</td>
                <td>
                  <div className="action-buttons">
                    <Link
                      to={`/admin/articles/edit/${article.id}`}
                      className="btn btn-secondary btn-sm"
                    >
                      수정
                    </Link>
                    <button
                      onClick={() => handleDelete(article.id)}
                      className="btn btn-danger btn-sm"
                    >
                      삭제
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Dashboard;
