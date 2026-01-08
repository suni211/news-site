import { Outlet, Link, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="layout">
      <header className="header">
        <div className="container">
          <div className="header-content">
            <Link to="/" className="logo">
              <h1>도로롱의 뉴스타파</h1>
            </Link>

            <nav className="nav">
              {categories.slice(0, 5).map(category => (
                <Link key={category.id} to={`/category/${category.id}`}>
                  {category.name}
                </Link>
              ))}
            </nav>

            <form className="search-form" onSubmit={handleSearch}>
              <input
                type="text"
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <button type="submit">검색</button>
            </form>

            <div className="auth-section">
              {user ? (
                <>
                  <span>환영합니다, {user.username}님</span>
                  {user.role === 'admin' && (
                    <Link to="/admin" className="btn btn-secondary">
                      관리자
                    </Link>
                  )}
                  <button onClick={handleLogout} className="btn btn-primary">
                    로그아웃
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="btn btn-primary">
                    로그인
                  </Link>
                  <Link to="/register" className="btn btn-secondary">
                    회원가입
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </header>

      <main className="main">
        <div className="container">
          <Outlet />
        </div>
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2026 도로롱의 뉴스타파. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout;
