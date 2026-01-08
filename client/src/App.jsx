import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import ArticleDetail from './pages/ArticleDetail';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminDashboard from './pages/admin/Dashboard';
import AdminArticleForm from './pages/admin/ArticleForm';
import CategoryPage from './pages/CategoryPage';
import SearchResults from './pages/SearchResults';
import './App.css';

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="/articles/:id" element={<ArticleDetail />} />
            <Route path="/category/:id" element={<CategoryPage />} />
            <Route path="/search" element={<SearchResults />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/articles/new" element={<AdminArticleForm />} />
            <Route path="/admin/articles/edit/:id" element={<AdminArticleForm />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
