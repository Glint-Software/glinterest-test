import { Link } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import './PinCard.css';

export default function PinCard({ pin, onUpdate }) {
  const { user } = useAuth();
  const [liked, setLiked] = useState(pin.liked || false);
  const [likeCount, setLikeCount] = useState(pin.like_count || 0);

  const handleLike = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) return;

    try {
      const data = await api.post(`/api/pins/${pin.id}/like`);
      setLiked(data.liked);
      setLikeCount(prev => data.liked ? prev + 1 : prev - 1);
      if (onUpdate) onUpdate();
    } catch (err) {
      console.error('Failed to like:', err);
    }
  };

  return (
    <div className="pin-card">
      <Link to={`/pin/${pin.id}`} className="pin-card-image">
        <img src={pin.image_url} alt={pin.title} loading="lazy" />
        <div className="pin-card-overlay">
          {user && (
            <button
              className={`pin-card-like ${liked ? 'liked' : ''}`}
              onClick={handleLike}
            >
              ♥ {likeCount > 0 ? likeCount : ''}
            </button>
          )}
        </div>
      </Link>
      <div className="pin-card-info">
        <Link to={`/pin/${pin.id}`} className="pin-card-title">{pin.title}</Link>
        <Link to={`/profile/${pin.user_id}`} className="pin-card-author">
          {pin.avatar_url && <img src={pin.avatar_url} alt="" className="pin-card-avatar" />}
          <span>{pin.display_name || pin.username}</span>
        </Link>
      </div>
    </div>
  );
}
