import type { JSX } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './store/auth';
import Home from './views/Home';
import Login from './views/Login';
import Register from './views/Register';
import Videos from './views/Videos';
import Capture from './views/Capture';
import VideoEdit from './views/VideoEdit';
import PublicVideo from './views/PublicVideo';

function RequireAuth({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function GuestOnly({ children }: { children: JSX.Element }) {
  const { user } = useAuth();
  return user ? <Navigate to="/videos" replace /> : children;
}

export default function AppRoutes() {
  return (
    <Routes>
      <Route
        path="/"
        element={<Home />}
      />
      <Route
        path="/login"
        element={
          <GuestOnly>
            <Login />
          </GuestOnly>
        }
      />
      <Route
        path="/register"
        element={
          <GuestOnly>
            <Register />
          </GuestOnly>
        }
      />
      <Route
        path="/videos"
        element={
          <RequireAuth>
            <Videos />
          </RequireAuth>
        }
      />
      <Route
        path="/videos/create"
        element={
          <RequireAuth>
            <Capture />
          </RequireAuth>
        }
      />
      <Route
        path="/videos/:id"
        element={
          <RequireAuth>
            <VideoEdit />
          </RequireAuth>
        }
      />
      <Route
        path="/view/:id"
        element={<PublicVideo />}
      />
    </Routes>
  );
}
