const User = require('../models/User');
const { generateToken } = require('../middlewares/auth');

// Stockage temporaire en mémoire (en attendant MongoDB)
const tempUsers = [];
let userIdCounter = 1;

// Inscription d'un nouvel utilisateur
const register = async (req, res) => {
  try {
    const { email, password, nom, prenom, role, dateNaissance, telephone, adresse } = req.body;

    // Vérifier si l'utilisateur existe déjà
    const existingUser = tempUsers.find(user => user.email === email);
    if (existingUser) {
      return res.status(400).json({
        message: 'Un utilisateur avec cet email existe déjà',
        error: 'EMAIL_EXISTS'
      });
    }

    // Créer le nouvel utilisateur
    const newUser = {
      _id: `temp_${userIdCounter++}`,
      email,
      password, // En production, il faudrait hasher le mot de passe
      nom,
      prenom,
      role: role || 'patient',
      dateNaissance,
      telephone,
      adresse,
      isActive: true,
      derniereConnexion: new Date(),
      createdAt: new Date(),
      updatedAt: new Date()
    };

    tempUsers.push(newUser);

    // Générer le token JWT
    const token = generateToken(newUser._id);

    // Retourner les informations de l'utilisateur (sans mot de passe)
    const userResponse = { ...newUser };
    delete userResponse.password;

    res.status(201).json({
      message: 'Utilisateur créé avec succès',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Erreur lors de l\'inscription:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de l\'inscription',
      error: 'REGISTER_ERROR'
    });
  }
};

// Connexion d'un utilisateur
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Vérifier que l'email et le mot de passe sont fournis
    if (!email || !password) {
      return res.status(400).json({
        message: 'Email et mot de passe requis',
        error: 'MISSING_CREDENTIALS'
      });
    }

    // Trouver l'utilisateur par email
    const user = tempUsers.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Vérifier si le compte est actif
    if (!user.isActive) {
      return res.status(401).json({
        message: 'Compte désactivé',
        error: 'ACCOUNT_DISABLED'
      });
    }

    // Vérifier le mot de passe (simplifié pour le test)
    if (user.password !== password) {
      return res.status(401).json({
        message: 'Email ou mot de passe incorrect',
        error: 'INVALID_CREDENTIALS'
      });
    }

    // Mettre à jour la dernière connexion
    user.derniereConnexion = new Date();

    // Générer le token JWT
    const token = generateToken(user._id);

    // Retourner les informations de l'utilisateur (sans mot de passe)
    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      message: 'Connexion réussie',
      user: userResponse,
      token
    });

  } catch (error) {
    console.error('Erreur lors de la connexion:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la connexion',
      error: 'LOGIN_ERROR'
    });
  }
};

// Obtenir le profil de l'utilisateur connecté
const getProfile = async (req, res) => {
  try {
    const user = tempUsers.find(u => u._id === req.user._id);
    
    if (!user) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    const userResponse = { ...user };
    delete userResponse.password;

    res.json({
      user: userResponse
    });

  } catch (error) {
    console.error('Erreur lors de la récupération du profil:', error);
    res.status(500).json({
      message: 'Erreur serveur',
      error: 'PROFILE_ERROR'
    });
  }
};

// Mettre à jour le profil de l'utilisateur
const updateProfile = async (req, res) => {
  try {
    const { nom, prenom, telephone, adresse, dateNaissance } = req.body;
    
    const userIndex = tempUsers.findIndex(u => u._id === req.user._id);
    if (userIndex === -1) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    // Mettre à jour les champs
    if (nom) tempUsers[userIndex].nom = nom;
    if (prenom) tempUsers[userIndex].prenom = prenom;
    if (telephone) tempUsers[userIndex].telephone = telephone;
    if (adresse) tempUsers[userIndex].adresse = adresse;
    if (dateNaissance) tempUsers[userIndex].dateNaissance = dateNaissance;
    tempUsers[userIndex].updatedAt = new Date();

    const userResponse = { ...tempUsers[userIndex] };
    delete userResponse.password;

    res.json({
      message: 'Profil mis à jour avec succès',
      user: userResponse
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour du profil:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la mise à jour',
      error: 'UPDATE_ERROR'
    });
  }
};

// Changer le mot de passe
const changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        message: 'Ancien et nouveau mot de passe requis',
        error: 'MISSING_PASSWORDS'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères',
        error: 'PASSWORD_TOO_SHORT'
      });
    }

    const userIndex = tempUsers.findIndex(u => u._id === req.user._id);
    if (userIndex === -1) {
      return res.status(404).json({
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    // Vérifier l'ancien mot de passe
    if (tempUsers[userIndex].password !== currentPassword) {
      return res.status(401).json({
        message: 'Ancien mot de passe incorrect',
        error: 'INVALID_CURRENT_PASSWORD'
      });
    }

    // Mettre à jour le mot de passe
    tempUsers[userIndex].password = newPassword;
    tempUsers[userIndex].updatedAt = new Date();

    res.json({
      message: 'Mot de passe modifié avec succès'
    });

  } catch (error) {
    console.error('Erreur lors du changement de mot de passe:', error);
    res.status(500).json({
      message: 'Erreur serveur lors du changement de mot de passe',
      error: 'PASSWORD_CHANGE_ERROR'
    });
  }
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword
}; 