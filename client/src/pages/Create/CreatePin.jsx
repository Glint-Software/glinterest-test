import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import './Create.css';

export default function CreatePin() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [boards, setBoards] = useState([]);
  const [form, setForm] = useState({
    title: '', description: '', image_url: '', source_url: '', board_id: '', tags: ''
  });
  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!user) { navigate('/login'); return; }
    api.get(`/api/users/${user.id}/boards`).then(setBoards).catch(console.error);
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    try {
      const tags = form.tags.split(',').map(t => t.trim()).filter(Boolean);
      const pin = await api.post('/api/pins', {
        ...form,
        board_id: form.board_id ? parseInt(form.board_id) : null,
        tags
      });
      navigate(`/pin/${pin.id}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  const update = (key) => (e) => setForm(prev => ({ ...prev, [key]: e.target.value }));

  return (
    <div className="page container">
      <div className="create-form-wrapper">
        <h1>Create Pin</h1>
        {error && <p className="form-error">{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Image URL *</label>
            <input type="url" value={form.image_url} onChange={update('image_url')} placeholder="https://images.unsplash.com/..." required />
          </div>
          {form.image_url && (
            <div className="create-preview">
              <img src={form.image_url} alt="Preview" />
            </div>
          )}
          <div className="form-group">
            <label>Title *</label>
            <input type="text" value={form.title} onChange={update('title')} placeholder="Give your pin a title" required />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea value={form.description} onChange={update('description')} placeholder="What's this pin about?" />
          </div>
          <div className="form-group">
            <label>Source URL</label>
            <input type="url" value={form.source_url} onChange={update('source_url')} placeholder="https://..." />
          </div>
          <div className="form-group">
            <label>Board</label>
            <select value={form.board_id} onChange={update('board_id')}>
              <option value="">No board</option>
              {boards.map(b => (
                <option key={b.id} value={b.id}>{b.title}</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Tags (comma-separated)</label>
            <input type="text" value={form.tags} onChange={update('tags')} placeholder="travel, photography, nature" />
          </div>
          <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Pin'}
          </button>
        </form>
      </div>
    </div>
  );
}
