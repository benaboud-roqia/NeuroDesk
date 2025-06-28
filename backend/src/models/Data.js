const mongoose = require('mongoose');

const dataSchema = new mongoose.Schema({
  patientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sessionId: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now,
    required: true
  },
  // Données EMG (électromyographie)
  emg: {
    values: [{
      type: Number,
      required: true
    }],
    samplingRate: {
      type: Number,
      default: 1000 // Hz
    },
    channel: {
      type: String,
      enum: ['channel1', 'channel2', 'channel3', 'channel4'],
      default: 'channel1'
    }
  },
  // Données de température
  temperature: {
    value: {
      type: Number,
      required: true,
      min: 20,
      max: 50
    },
    unit: {
      type: String,
      default: 'celsius'
    },
    sensor: {
      type: String,
      default: 'main'
    }
  },
  // Données de pression
  pression: {
    value: {
      type: Number,
      required: true,
      min: 0,
      max: 1000
    },
    unit: {
      type: String,
      default: 'mmHg'
    },
    sensor: {
      type: String,
      default: 'main'
    }
  },
  // Métadonnées de la session
  metadata: {
    duree: {
      type: Number, // en secondes
      default: 0
    },
    typeTest: {
      type: String,
      enum: ['repos', 'contraction', 'mouvement', 'test_specifique'],
      default: 'repos'
    },
    notes: String,
    position: {
      type: String,
      enum: ['assise', 'debout', 'couchee', 'marche'],
      default: 'assise'
    }
  },
  // Résultats d'analyse IA (optionnel)
  analyseIA: {
    prediction: {
      type: String,
      enum: ['normal', 'anormal', 'suspect', 'non_analyse'],
      default: 'non_analyse'
    },
    confiance: {
      type: Number,
      min: 0,
      max: 1,
      default: 0
    },
    pathologieDetectee: [{
      nom: String,
      probabilite: Number
    }],
    recommandations: [String],
    dateAnalyse: {
      type: Date,
      default: null
    }
  },
  // Statut des données
  status: {
    type: String,
    enum: ['brut', 'traite', 'analyse', 'valide'],
    default: 'brut'
  }
}, {
  timestamps: true
});

// Index pour optimiser les requêtes
dataSchema.index({ patientId: 1, timestamp: -1 });
dataSchema.index({ sessionId: 1 });
dataSchema.index({ 'analyseIA.prediction': 1 });

// Méthode pour calculer la durée de la session
dataSchema.methods.calculerDuree = function() {
  if (this.metadata.duree > 0) {
    return this.metadata.duree;
  }
  // Calcul basé sur les timestamps si disponible
  return 0;
};

// Méthode pour obtenir les données formatées
dataSchema.methods.getFormattedData = function() {
  return {
    id: this._id,
    patientId: this.patientId,
    sessionId: this.sessionId,
    timestamp: this.timestamp,
    emg: this.emg,
    temperature: this.temperature,
    pression: this.pression,
    metadata: this.metadata,
    analyseIA: this.analyseIA,
    status: this.status,
    duree: this.calculerDuree()
  };
};

module.exports = mongoose.model('Data', dataSchema); 