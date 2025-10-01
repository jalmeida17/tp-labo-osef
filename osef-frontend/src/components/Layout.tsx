import { ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Layout.css';

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  if (!user) {
    return <>{children}</>;
  }

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="nav-content">
          <div className="nav-brand">
            <img src="/logo_osef.png" alt="OSEF Logo" className="nav-logo" />
          </div>
          <div className="nav-links">
            <Link
              to="/calendar"
              className={location.pathname === '/calendar' ? 'active' : ''}
            >
              Calendrier
            </Link>
            {isAdmin && (
              <Link
                to="/admin"
                className={location.pathname === '/admin' ? 'active' : ''}
              >
                Gestion
              </Link>
            )}
            <Link
              to="/profile"
              className={location.pathname === '/profile' ? 'active' : ''}
            >
              Profil
            </Link>
            <button className="nav-logout" onClick={handleLogout}>
              Déconnexion
            </button>
          </div>
        </div>
      </nav>
      <main className="main-content">{children}</main>
    </div>
  );
}

