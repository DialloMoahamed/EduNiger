import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const location = useLocation();

  const isActive = (path) => location.pathname === path ? 'active' : '';

  return (
    <nav className="navbar">
      <div className="container navbar-content">
        <div className="navbar-brand">
          📚 Gestion Scolaire
        </div>

        <ul className="navbar-menu">
          <li>
            <Link to="/" className={`navbar-link ${isActive('/')}`}>
              Tableau de bord
            </Link>
          </li>
          <li>
            <Link to="/eleves" className={`navbar-link ${isActive('/eleves')}`}>
              Élèves
            </Link>
          </li>
          <li>
            <Link to="/classes" className={`navbar-link ${isActive('/classes')}`}>
              Classes
            </Link>
          </li>
          <li>
            <Link to="/presences" className={`navbar-link ${isActive('/presences')}`}>
              Présences
            </Link>
          </li>
          <li>
            <Link to="/notes" className={`navbar-link ${isActive('/notes')}`}>
              Notes
            </Link>
          </li>
        </ul>

        <div className="navbar-user">
          <span style={{ color: 'var(--gray-700)' }}>
            {user?.prenom} {user?.nom}
            {isAdmin() && ' (Admin)'}
          </span>
          <button onClick={logout} className="btn btn-danger btn-small">
            Déconnexion
          </button>
        </div>
      </div>
    </nav>
  );
}
