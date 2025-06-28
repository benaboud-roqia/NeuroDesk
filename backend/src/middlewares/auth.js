const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware pour vérifier le token JWT
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      return res.status(401).json({ 
        message: 'Token d\'accès requis',
        error: 'TOKEN_MISSING'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return res.status(401).json({ 
        message: 'Utilisateur non trouvé',
        error: 'USER_NOT_FOUND'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({ 
        message: 'Compte désactivé',
        error: 'ACCOUNT_DISABLED'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ 
        message: 'Token invalide',
        error: 'INVALID_TOKEN'
      });
    }
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ 
        message: 'Token expiré',
        error: 'TOKEN_EXPIRED'
      });
    }
    
    console.error('Erreur d\'authentification:', error);
    res.status(500).json({ 
      message: 'Erreur serveur lors de l\'authentification',
      error: 'AUTH_ERROR'
    });
  }
};

// Middleware pour vérifier les rôles
const requireRole = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ 
        message: 'Authentification requise',
        error: 'AUTH_REQUIRED'
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: 'Accès refusé - Permissions insuffisantes',
        error: 'INSUFFICIENT_PERMISSIONS',
        requiredRoles: roles,
        userRole: req.user.role
      });
    }

    next();
  };
};

// Middleware pour vérifier si l'utilisateur peut accéder aux données d'un patient
const canAccessPatientData = async (req, res, next) => {
  try {
    const { patientId } = req.params;
    
    // Les admins peuvent tout voir
    if (req.user.role === 'admin') {
      return next();
    }

    // Les médecins peuvent voir leurs patients
    if (req.user.role === 'medecin') {
      const patient = await User.findById(patientId);
      if (patient && patient.medecinReferent && patient.medecinReferent.toString() === req.user._id.toString()) {
        return next();
      }
    }

    // Les patients peuvent voir leurs propres données
    if (req.user.role === 'patient' && req.user._id.toString() === patientId) {
      return next();
    }

    return res.status(403).json({ 
      message: 'Accès refusé aux données de ce patient',
      error: 'PATIENT_ACCESS_DENIED'
    });
  } catch (error) {
    console.error('Erreur lors de la vérification d\'accès:', error);
    res.status(500).json({ 
      message: 'Erreur serveur',
      error: 'ACCESS_CHECK_ERROR'
    });
  }
};

// Fonction utilitaire pour générer un token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '24h' }
  );
};

module.exports = {
  authenticateToken,
  requireRole,
  canAccessPatientData,
  generateToken
}; 