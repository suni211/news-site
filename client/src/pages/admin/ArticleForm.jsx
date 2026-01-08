import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';
import './ArticleForm.css';

const ArticleForm = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEdit = Boolean(id);

  const [formData, setFormData] = useState({
    title: '',
    content: '',
    excerpt: '',
    thumbnail_url: '',
    category_id: '',
    tags: '',
    published: false
  });

  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') {
      navigate('/');
      return;
    }

    fetchCategories();

    if (isEdit) {
      fetchArticle();
    }
  }, [user, navigate, id, isEdit]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data);
    } catch (error) {
      console.error('카테고리 조회 실패:', error);
    }
  };

  const fetchArticle = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/articles/${id}`);
      const article = response.data;

      setFormData({
        title: article.title,
        content: article.content,
        excerpt: article.excerpt || '',
        thumbnail_url: article.thumbnail_url || '',
        category_id: article.category_id || '',
        tags: article.tags?.map(t => t.name).join(', ') || '',
        published: article.published === 1
      });
    } catch (error) {
      console.error('기사 조회 실패:', error);
      alert('기사를 불러오는데 실패했습니다');
      navigate('/admin');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const data = {
        ...formData,
        tags: formData.tags.split(',').map(t => t.trim()).filter(t => t)
      };

      if (isEdit) {
        await axios.put(`http://localhost:5000/api/articles/${id}`, data);
        alert('기사가 수정되었습니다');
      } else {
        await axios.post('http://localhost:5000/api/articles', data);
        alert('기사가 작성되었습니다');
      }

      navigate('/admin');
    } catch (error) {
      console.error('기사 저장 실패:', error);
      setError(error.response?.data?.error || '기사 저장에 실패했습니다');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="article-form-container">
      <h2>{isEdit ? '기사 수정' : '새 기사 작성'}</h2>

      <form onSubmit={handleSubmit} className="article-form">
        <div className="form-group">
          <label>제목 *</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label>카테고리 *</label>
          <select
            name="category_id"
            value={formData.category_id}
            onChange={handleChange}
            required
          >
            <option value="">선택하세요</option>
            {categories.map(category => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>썸네일 URL</label>
          <input
            type="url"
            name="thumbnail_url"
            value={formData.thumbnail_url}
            onChange={handleChange}
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label>요약</label>
          <textarea
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            rows="3"
            placeholder="기사 요약 (선택사항)"
          />
        </div>

        <div className="form-group">
          <label>내용 *</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows="20"
            required
          />
        </div>

        <div className="form-group">
          <label>태그</label>
          <input
            type="text"
            name="tags"
            value={formData.tags}
            onChange={handleChange}
            placeholder="태그1, 태그2, 태그3"
          />
          <small>쉼표(,)로 구분하여 입력하세요</small>
        </div>

        <div className="form-group checkbox-group">
          <label>
            <input
              type="checkbox"
              name="published"
              checked={formData.published}
              onChange={handleChange}
            />
            발행
          </label>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? '저장 중...' : isEdit ? '수정' : '작성'}
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="btn btn-secondary"
          >
            취소
          </button>
        </div>
      </form>
    </div>
  );
};

export default ArticleForm;
