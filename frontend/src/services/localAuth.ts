import { User, RegisterData, LoginData, AuthResponse } from '../types/index';

// Stockage local des utilisateurs
const USERS_KEY = 'gant_neuro_users';
const CURRENT_USER_KEY = 'gant_neuro_current_user';

// Utilisateurs de test par défaut
const defaultUsers: User[] = [
  {
    _id: '1',
    email: 'patient@test.com',
    nom: 'Dupont',
    prenom: 'Marie',
    role: 'patient',
    isActive: true,
    derniereConnexion: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  },
  {
    _id: '2',
    email: 'medecin@test.com',
    nom: 'Martin',
    prenom: 'Dr. Jean',
    role: 'medecin',
    isActive: true,
    derniereConnexion: new Date().toISOString(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }
];

// Fonction pour récupérer les utilisateurs du localStorage
const getUsers = (): User[] => {
  try {
    const users = localStorage.getItem(USERS_KEY);
    if (users) {
      return JSON.parse(users);
    }
    // Initialiser avec les utilisateurs par défaut
    localStorage.setItem(USERS_KEY, JSON.stringify(defaultUsers));
    return defaultUsers;
  } catch (error) {
    console.error('Erreur lors de la récupération des utilisateurs:', error);
    return defaultUsers;
  }
};

// Fonction pour sauvegarder les utilisateurs
const saveUsers = (users: User[]): void => {
  try {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  } catch (error) {
    console.error('Erreur lors de la sauvegarde des utilisateurs:', error);
  }
};

// Service d'authentification local
export const localAuthService = {
  // Inscription
  register: async (userData: RegisterData): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      try {
        const users = getUsers();
        
        // Vérifier si l'email existe déjà
        const existingUser = users.find(user => user.email === userData.email);
        if (existingUser) {
          reject(new Error('Un utilisateur avec cet email existe déjà'));
          return;
        }

        // Créer le nouvel utilisateur
        const newUser: User = {
          _id: Date.now().toString(),
          email: userData.email,
          nom: userData.nom,
          prenom: userData.prenom,
          role: userData.role || 'patient',
          dateNaissance: userData.dateNaissance,
          telephone: userData.telephone,
          adresse: userData.adresse,
          isActive: true,
          derniereConnexion: new Date().toISOString(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString()
        };

        // Ajouter l'utilisateur à la liste
        users.push(newUser);
        saveUsers(users);

        // Générer un token simple
        const token = btoa(JSON.stringify({ userId: newUser._id, email: newUser.email }));

        resolve({
          message: 'Inscription réussie',
          user: newUser,
          token: token
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  // Connexion
  login: async (credentials: LoginData): Promise<AuthResponse> => {
    return new Promise((resolve, reject) => {
      try {
        const users = getUsers();
        
        // Chercher l'utilisateur par email
        const user = users.find(u => u.email === credentials.email);
        
        if (!user) {
          reject(new Error('Email ou mot de passe incorrect'));
          return;
        }

        // Pour la démo, on accepte n'importe quel mot de passe
        // En production, il faudrait vérifier le hash du mot de passe
        
        // Mettre à jour la dernière connexion
        user.derniereConnexion = new Date().toISOString();
        user.updatedAt = new Date().toISOString();
        
        const updatedUsers = users.map(u => u._id === user._id ? user : u);
        saveUsers(updatedUsers);

        // Générer un token simple
        const token = btoa(JSON.stringify({ userId: user._id, email: user.email }));

        resolve({
          message: 'Connexion réussie',
          user: user,
          token: token
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  // Récupérer le profil
  getProfile: async (): Promise<{ user: User }> => {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          reject(new Error('Token non trouvé'));
          return;
        }

        const tokenData = JSON.parse(atob(token));
        const users = getUsers();
        const user = users.find(u => u._id === tokenData.userId);

        if (!user) {
          reject(new Error('Utilisateur non trouvé'));
          return;
        }

        resolve({ user });
      } catch (error) {
        reject(error);
      }
    });
  },

  // Mettre à jour le profil
  updateProfile: async (userData: Partial<User>): Promise<{ message: string; user: User }> => {
    return new Promise((resolve, reject) => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          reject(new Error('Token non trouvé'));
          return;
        }

        const tokenData = JSON.parse(atob(token));
        const users = getUsers();
        const userIndex = users.findIndex(u => u._id === tokenData.userId);

        if (userIndex === -1) {
          reject(new Error('Utilisateur non trouvé'));
          return;
        }

        // Mettre à jour l'utilisateur
        users[userIndex] = {
          ...users[userIndex],
          ...userData,
          updatedAt: new Date().toISOString()
        };

        saveUsers(users);

        resolve({
          message: 'Profil mis à jour avec succès',
          user: users[userIndex]
        });
      } catch (error) {
        reject(error);
      }
    });
  },

  // Changer le mot de passe
  changePassword: async (currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    return new Promise((resolve) => {
      // Pour la démo, on simule un changement de mot de passe réussi
      resolve({
        message: 'Mot de passe changé avec succès'
      });
    });
  },

  // Vérifier si un token est valide
  validateToken: (token: string): boolean => {
    try {
      const tokenData = JSON.parse(atob(token));
      const users = getUsers();
      return users.some(u => u._id === tokenData.userId);
    } catch (error) {
      return false;
    }
  }
}; 