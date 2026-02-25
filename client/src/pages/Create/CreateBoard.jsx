import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import './Create.css';

export default function CreateBoard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', description: '', cover_image_url: '', is_private: false
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) navigate('/login');
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const board = await api.post('/api/boards', form);
      navigate(`/board/${board.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const update = (key) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="page container">
      <div className="create-form-wrapper">
        <h1>Create Board</h1>
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Title *</label>
            <input type="text" value={form.title} onChange={update('title')} placeholder="e.g., Travel Inspiration" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={update('description')} placeholder="What's this board about?" />
          </div>
          <div className="form-group">
            <label>Cover Image URL</label>
            <input type="url" value={form.cover_image_url} onChange={update('cover_image_url')} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <input type="checkbox" checked={form.is_private} onChange={update('is_private')} />
              Private board
            </label>
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Board'}
          </button>
        </form>
      </div>
    </div>
  );
}
