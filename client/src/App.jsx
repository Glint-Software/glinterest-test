import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout/Layout.jsx';
import Home from './pages/Home/Home.jsx';
import PinDetail from './pages/Pin/PinDetail.jsx';
import BoardDetail from './pages/Board/BoardDetail.jsx';
import Profile from './pages/Profile/Profile.jsx';
import Search from './pages/Search/Search.jsx';
import CreatePin from './pages/Create/CreatePin.jsx';
import CreateBoard from './pages/Create/CreateBoard.jsx';
import Login from './pages/Auth/Login.jsx';
import Register from './pages/Auth/Register.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/pin/:id" element={<PinDetail />} />
        <Route path="/board/:id" element={<BoardDetail />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/search" element={<Search />} />
        <Route path="/create/pin" element={<CreatePin />} />
        <Route path="/create/board" element={<CreateBoard />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Route>
    </Routes>
  );
}
