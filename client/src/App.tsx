import { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { auth, useAuth } from './store/auth';
import AppRoutes from './router';

export default function App() {
  const { user, ready } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!ready) auth.load();
  }, [ready]);

  async function logout() {
    await auth.logout();
    navigate('/');
  }

  if (!ready) return null;

  return (
    <div className="app">
      <header>
        <Link
          className="brand"
          to="/"
        >
          ClipShare
        </Link>
        <nav>
          {user ? (
            <>
              <Link to="/videos">My videos</Link>
              <Link to="/videos/create">Capture</Link>
              <button
                className="link"
                onClick={logout}
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login">Login</Link>
              <Link
                className="button small"
                to="/register"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </header>
      <main>
        <AppRoutes />
      </main>
    </div>
  );
}
