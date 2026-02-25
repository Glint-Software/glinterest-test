import { Link } from 'react-router-dom';
import './BoardCard.css';

export default function BoardCard({ board }) {
  return (
    <Link to={`/board/${board.id}`} className="board-card">
      <div className="board-card-cover">
        {board.cover_image_url ? (
          <img src={board.cover_image_url} alt={board.title} loading="lazy" />
        ) : (
          <div className="board-card-placeholder" />
        )}
      </div>
      <div className="board-card-info">
        <h3 className="board-card-title">{board.title}</h3>
        <span className="board-card-count">{board.pin_count || 0} pins</span>
      </div>
    </Link>
  );
}
