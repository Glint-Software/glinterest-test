import { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import api from '../../utils/api.js';
import PinGrid from '../../components/PinGrid/PinGrid.jsx';
import './Search.css';
import useTitlePage from '../../hooks/usePageTitle.js';

export default function Search() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const tag = searchParams.get('tag') || '';
  const [pins, setPins] = useState([]);
  const [popularTags, setPopularTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    setLoading(true);
    const params = tag ? `tag=${tag}` : `q=${encodeURIComponent(query)}`;

    Promise.all([
      (query || tag) ? api.get(`/api/search?${params}`) : Promise.resolve({ pins: [], total: 0 }),
      api.get('/api/search/tags')
    ]).then(([searchData, tagsData]) => {
      setPins(searchData.pins);
      setTotal(searchData.total);
      setPopularTags(tagsData);
    }).catch(err => {
      console.error(err);
    }).finally(() => setLoading(false));
  }, [query, tag]);

  useTitlePage(`Search: ${query} | Glinterest`)

  return (
    <div className="page container">
      <div className="search-header">
        <h1>{tag ? `#${tag}` : query ? `Results for "${query}"` : 'Explore'}</h1>
        {(query || tag) && <p className="search-count">{total} pins found</p>}
      </div>

      <div className="popular-tags">
        {popularTags.map(t => (
          <Link key={t.tag} to={`/search?tag=${t.tag}`} className={`tag-pill ${t.tag === tag ? 'active' : ''}`}>
            #{t.tag} <span>{t.count}</span>
          </Link>
        ))}
      </div>

      {loading ? <div className="spinner" /> : <PinGrid pins={pins} />}
    </div>
  );
}
