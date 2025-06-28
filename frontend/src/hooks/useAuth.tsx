import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthContextType, RegisterData, LoginData } from '../types/index';
import { localAuthService } from '../services/localAuth';

// Création du contexte d'authentification
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Hook personnalisé pour utiliser le contexte d'authentification
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Interface pour les props du provider
interface AuthProviderProps {
  children: ReactNode;
}

// Provider du contexte d'authentification
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // Vérifier si l'utilisateur est connecté au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = localStorage.getItem('token');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        try {
          // Vérifier si le token est valide
          if (localAuthService.validateToken(token)) {
            const userData = JSON.parse(savedUser);
            setUser(userData);
          } else {
            // Token invalide, nettoyer le localStorage
            localStorage.removeItem('token');
            localStorage.removeItem('user');
          }
        } catch (error) {
          console.error('Erreur lors du parsing des données utilisateur:', error);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
      setLoading(false);
    };

    checkAuth();
  }, []);

  // Fonction de connexion
  const login = async (email: string, password: string) => {
    try {
      const response = await localAuthService.login({ email, password });
      
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      
      setUser(response.user);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Fonction d'inscription
  const register = async (userData: RegisterData) => {
    try {
      const response = await localAuthService.register(userData);
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Fonction de déconnexion
  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
  };

  // Fonction de mise à jour du profil
  const updateProfile = async (userData: Partial<User>) => {
    try {
      const response = await localAuthService.updateProfile(userData);
      setUser(response.user);
      localStorage.setItem('user', JSON.stringify(response.user));
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Fonction de changement de mot de passe
  const changePassword = async (currentPassword: string, newPassword: string) => {
    try {
      const response = await localAuthService.changePassword(currentPassword, newPassword);
      return response;
    } catch (error) {
      throw error;
    }
  };

  const value: AuthContextType = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 