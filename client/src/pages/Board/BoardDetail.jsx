import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../../utils/api.js';
import PinGrid from '../../components/PinGrid/PinGrid.jsx';
import './BoardDetail.css';
import useTitlePage from '../../hooks/usePageTitle.js';

export default function BoardDetail() {
  const { id } = useParams();
  const [board, setBoard] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchBoard = async () => {
    try {
      const data = await api.get(`/api/boards/${id}`);
      setBoard(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBoard(); }, [id]);

  useTitlePage(`${board?.title} | Glinterest`)

  if (loading) return <div className="spinner" />;
  if (!board) return <div className="empty-state"><h3>Board not found</h3></div>;

  return (
    <div className="page container">
      <div className="board-header">
        {board.cover_image_url && (
          <div className="board-cover">
            <img src={board.cover_image_url} alt="" />
          </div>
        )}
        <h1>{board.title}</h1>
        {board.description && <p className="board-desc">{board.description}</p>}
        <Link to={`/profile/${board.user_id}`} className="board-author">
          {board.avatar_url && <img src={board.avatar_url} alt="" />}
          <span>{board.display_name || board.username}</span>
        </Link>
        <span className="board-pin-count">{board.pins?.length || 0} pins</span>
      </div>
      <PinGrid pins={board.pins || []} onUpdate={fetchBoard} />
    </div>
  );
}
