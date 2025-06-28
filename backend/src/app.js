const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/auth');
const dataRoutes = require('./routes/data');

const app = express();

// Middlewares
app.use(express.json({ limit: '10mb' })); // Pour les données EMG volumineuses
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));

// Connexion à MongoDB (optionnelle)
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ MongoDB connecté'))
  .catch((err) => {
    console.error('❌ Erreur MongoDB :', err.message);
    console.log('⚠️  Le serveur fonctionne sans base de données');
  });
} else {
  console.log('⚠️  MONGO_URI non définie - Le serveur fonctionne sans base de données');
}

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/data', dataRoutes);

// Route de test
app.get('/', (req, res) => {
  res.json({
    message: 'API du gant connectée 🚀',
    version: '1.0.0',
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      auth: '/api/auth',
      data: '/api/data'
    }
  });
});

// Route pour vérifier la santé de l'API
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Gestion des erreurs 404
app.use('*', (req, res) => {
  res.status(404).json({
    message: 'Route non trouvée',
    error: 'NOT_FOUND',
    path: req.originalUrl
  });
});

// Gestion globale des erreurs
app.use((err, req, res, next) => {
  console.error('Erreur serveur:', err);
  
  // Erreurs de validation Mongoose
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      message: 'Données invalides',
      error: 'VALIDATION_ERROR',
      details: Object.values(err.errors).map(e => e.message)
    });
  }

  // Erreurs de duplication MongoDB
  if (err.code === 11000) {
    return res.status(400).json({
      message: 'Données en conflit',
      error: 'DUPLICATE_ERROR',
      field: Object.keys(err.keyPattern)[0]
    });
  }

  // Erreurs JWT
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      message: 'Token invalide',
      error: 'INVALID_TOKEN'
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      message: 'Token expiré',
      error: 'TOKEN_EXPIRED'
    });
  }

  // Erreur générique
  res.status(500).json({
    message: 'Erreur serveur interne',
    error: 'INTERNAL_ERROR'
  });
});

module.exports = app; 