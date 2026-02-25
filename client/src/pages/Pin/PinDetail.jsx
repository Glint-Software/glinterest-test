import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import './PinDetail.css';
import useTitlePage from '../../hooks/usePageTitle.js';

export default function PinDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [pin, setPin] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.get(`/api/pins/${id}`),
      api.get(`/api/comments/${id}`)
    ]).then(([pinData, commentsData]) => {
      setPin(pinData);
      setComments(commentsData);
    }).catch(err => {
      console.error(err);
      navigate('/');
    }).finally(() => setLoading(false));
  }, [id, navigate]);

  const handleLike = async () => {
    if (!user) return;
    const data = await api.post(`/api/pins/${id}/like`);
    setPin(prev => ({
      ...prev,
      liked: data.liked,
      like_count: data.liked ? prev.like_count + 1 : prev.like_count - 1
    }));
  };

  useTitlePage(`${pin?.title} | Glinterest`)

  const handleComment = async (e) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const comment = await api.post(`/api/comments/${id}`, { text: commentText });
    setComments(prev => [...prev, comment]);
    setCommentText('');
  };

  const handleDelete = async () => {
    if (!confirm('Delete this pin?')) return;
    await api.delete(`/api/pins/${id}`);
    navigate('/');
  };

  if (loading) return <div className="spinner" />;
  if (!pin) return null;

  return (
    <div className="page container">
      <div className="pin-detail">
        <div className="pin-detail-image">
          <img src={pin.image_url} alt={pin.title} />
        </div>
        <div className="pin-detail-content">
          <div className="pin-detail-actions">
            {user && (
              <button
                className={`btn ${pin.liked ? 'btn-secondary' : 'btn-primary'}`}
                onClick={handleLike}
              >
                {pin.liked ? 'Liked' : 'Like'} ({pin.like_count})
              </button>
            )}
            {user && pin.user_id === user.id && (
              <button className="btn btn-secondary" onClick={handleDelete}>Delete</button>
            )}
          </div>

          {pin.source_url && (
            <a href={pin.source_url} target="_blank" rel="noopener noreferrer" className="pin-detail-source">
              {new URL(pin.source_url).hostname}
            </a>
          )}

          <h1 className="pin-detail-title">{pin.title}</h1>
          {pin.description && <p className="pin-detail-desc">{pin.description}</p>}

          {pin.tags && pin.tags.length > 0 && (
            <div className="pin-detail-tags">
              {pin.tags.map(tag => (
                <Link key={tag} to={`/search?tag=${tag}`} className="pin-tag">#{tag}</Link>
              ))}
            </div>
          )}

          <Link to={`/profile/${pin.user_id}`} className="pin-detail-author">
            {pin.avatar_url && <img src={pin.avatar_url} alt="" />}
            <div>
              <strong>{pin.display_name || pin.username}</strong>
              <span>@{pin.username}</span>
            </div>
          </Link>

          <div className="pin-detail-comments">
            <h3>Comments ({comments.length})</h3>
            {comments.map(c => (
              <div key={c.id} className="comment">
                <Link to={`/profile/${c.user_id}`} className="comment-avatar">
                  {c.avatar_url ? <img src={c.avatar_url} alt="" /> : <span>{c.display_name?.[0]}</span>}
                </Link>
                <div className="comment-body">
                  <Link to={`/profile/${c.user_id}`} className="comment-author">{c.display_name}</Link>
                  <p>{c.text}</p>
                </div>
              </div>
            ))}

            {user && (
              <form className="comment-form" onSubmit={handleComment}>
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                />
                <button type="submit" className="btn btn-primary btn-sm" disabled={!commentText.trim()}>
                  Post
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
