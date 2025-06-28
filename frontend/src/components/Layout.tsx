import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Layout.css';

const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleDisplayName = (role: string) => {
    switch (role) {
      case 'patient':
        return 'Patient';
      case 'medecin':
        return 'Médecin';
      case 'admin':
        return 'Administrateur';
      default:
        return role;
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'patient':
        return 'primary';
      case 'medecin':
        return 'success';
      case 'admin':
        return 'danger';
      default:
        return 'secondary';
    }
  };

  return (
    <div className="layout">
      <nav className="navbar">
        <div className="container">
          <div className="navbar-header">
            <Link to="/" className="navbar-brand">
              🧠 Gant Neuro
            </Link>
          </div>
          
          {user && (
            <ul className="navbar-nav">
              <li>
                <Link to="/dashboard" className="nav-link">
                  📊 Tableau de bord
                </Link>
              </li>
              {user.role === 'patient' && (
                <li>
                  <Link to="/patient-dashboard" className="nav-link">
                    👤 Mon Profil
                  </Link>
                </li>
              )}
              {user.role === 'medecin' && (
                <li>
                  <Link to="/communication" className="nav-link">
                    💬 Communication
                  </Link>
                </li>
              )}
              <li>
                <button onClick={handleLogout} className="nav-link logout-btn">
                  🚪 Déconnexion
                </button>
              </li>
            </ul>
          )}
        </div>
      </nav>

      <main className="main-content">
        {children}
      </main>

      <footer className="footer">
        <div className="container">
          <p>&copy; 2024 Gant Neuro - Détection précoce des maladies neurologiques</p>
        </div>
      </footer>
    </div>
  );
};

export default Layout; 