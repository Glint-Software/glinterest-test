import { useState, useEffect } from 'react';
import api from '../../utils/api.js';
import PinGrid from '../../components/PinGrid/PinGrid.jsx';
import './Home.css';

export default function Home() {
  const [pins, setPins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const fetchPins = async (pageNum = 1) => {
    try {
      const data = await api.get(`/api/pins?page=${pageNum}&limit=30`);
      if (pageNum === 1) {
        setPins(data.pins);
      } else {
        setPins(prev => [...prev, ...data.pins]);
      }
      setHasMore(pageNum < data.pages);
    } catch (err) {
      console.error('Failed to fetch pins:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchPins(); }, []);

  const loadMore = () => {
    const next = page + 1;
    setPage(next);
    fetchPins(next);
  };

  if (loading) return <div className="spinner" />;

  return (
    <div className="page container">
      <PinGrid pins={pins} onUpdate={() => fetchPins(1)} />
      {hasMore && (
        <div className="load-more">
          <button className="btn btn-secondary" onClick={loadMore}>Load more</button>
        </div>
      )}
    </div>
  );
}
