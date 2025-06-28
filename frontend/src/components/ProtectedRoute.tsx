import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './ProtectedRoute.css';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, requiredRole }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Chargement...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && user.role !== requiredRole) {
    return (
      <div className="unauthorized-container">
        <div className="unauthorized-content">
          <h1>🚫 Accès refusé</h1>
          <p>Vous n'avez pas les permissions nécessaires pour accéder à cette page.</p>
          <p>Rôle requis : {requiredRole}</p>
          <p>Votre rôle : {user.role}</p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default ProtectedRoute; 