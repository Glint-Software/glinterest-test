import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import api from '../../utils/api.js';
import PinGrid from '../../components/PinGrid/PinGrid.jsx';
import BoardCard from '../../components/BoardCard/BoardCard.jsx';
import './Profile.css';
import useTitlePage from '../../hooks/usePageTitle.js';

export default function Profile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  const [profile, setProfile] = useState(null);
  const [pins, setPins] = useState([]);
  const [boards, setBoards] = useState([]);
  const [tab, setTab] = useState('pins');
  const [loading, setLoading] = useState(true);

  const fetchProfile = async () => {
    try {
      const [userData, userPins, userBoards] = await Promise.all([
        api.get(`/api/users/${id}`),
        api.get(`/api/users/${id}/pins`),
        api.get(`/api/users/${id}/boards`)
      ]);
      setProfile(userData);
      setPins(userPins);
      setBoards(userBoards);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setLoading(true);
    fetchProfile();
  }, [id]);

  useTitlePage(`${profile?.username} | Glinterest`)

  const handleFollow = async () => {
    if (!currentUser) return;
    const data = await api.post(`/api/users/${id}/follow`);
    setProfile(prev => ({
      ...prev,
      is_following: data.following,
      follower_count: data.following ? prev.follower_count + 1 : prev.follower_count - 1
    }));
  };

  if (loading) return <div className="spinner" />;
  if (!profile) return <div className="empty-state"><h3>User not found</h3></div>;

  const isOwn = currentUser && currentUser.id === profile.id;

  return (
    <div className="page container">
      <div className="profile-header">
        <div className="profile-avatar-lg">
          {profile.avatar_url ? (
            <img src={profile.avatar_url} alt={profile.display_name} />
          ) : (
            <span>{profile.display_name?.[0]}</span>
          )}
        </div>
        <h1>{profile.display_name}</h1>
        <p className="profile-username">@{profile.username}</p>
        {profile.bio && <p className="profile-bio">{profile.bio}</p>}
        <div className="profile-stats">
          <span><strong>{profile.pin_count}</strong> pins</span>
          <span><strong>{profile.board_count}</strong> boards</span>
          <span><strong>{profile.follower_count}</strong> followers</span>
          <span><strong>{profile.following_count}</strong> following</span>
        </div>
        {!isOwn && currentUser && (
          <button
            className={`btn ${profile.is_following ? 'btn-secondary' : 'btn-primary'}`}
            onClick={handleFollow}
          >
            {profile.is_following ? 'Unfollow' : 'Follow'}
          </button>
        )}
      </div>

      <div className="profile-tabs">
        <button className={`profile-tab ${tab === 'pins' ? 'active' : ''}`} onClick={() => setTab('pins')}>
          Pins
        </button>
        <button className={`profile-tab ${tab === 'boards' ? 'active' : ''}`} onClick={() => setTab('boards')}>
          Boards
        </button>
      </div>

      {tab === 'pins' ? (
        <PinGrid pins={pins} onUpdate={fetchProfile} />
      ) : (
        <div className="boards-grid">
          {boards.map(board => (
            <BoardCard key={board.id} board={board} />
          ))}
        </div>
      )}
    </div>
  );
}
