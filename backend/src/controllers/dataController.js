const Data = require('../models/Data');
const User = require('../models/User');

// Recevoir et stocker les données du gant
const receiveData = async (req, res) => {
  try {
    const { 
      patientId, 
      sessionId, 
      emg, 
      temperature, 
      pression, 
      metadata 
    } = req.body;

    // Vérifier que le patient existe
    const patient = await User.findById(patientId);
    if (!patient) {
      return res.status(404).json({
        message: 'Patient non trouvé',
        error: 'PATIENT_NOT_FOUND'
      });
    }

    // Créer une nouvelle entrée de données
    const data = new Data({
      patientId,
      sessionId: sessionId || `session_${Date.now()}`,
      emg,
      temperature,
      pression,
      metadata: metadata || {}
    });

    await data.save();

    res.status(201).json({
      message: 'Données reçues et stockées avec succès',
      dataId: data._id,
      sessionId: data.sessionId
    });

  } catch (error) {
    console.error('Erreur lors de la réception des données:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Données invalides',
        error: 'VALIDATION_ERROR',
        details: Object.values(error.errors).map(err => err.message)
      });
    }

    res.status(500).json({
      message: 'Erreur serveur lors du stockage des données',
      error: 'DATA_STORAGE_ERROR'
    });
  }
};

// Obtenir les données d'un patient
const getPatientData = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { 
      limit = 50, 
      offset = 0, 
      startDate, 
      endDate, 
      typeTest,
      status 
    } = req.query;

    // Construire les filtres
    const filters = { patientId };
    
    if (startDate || endDate) {
      filters.timestamp = {};
      if (startDate) filters.timestamp.$gte = new Date(startDate);
      if (endDate) filters.timestamp.$lte = new Date(endDate);
    }
    
    if (typeTest) filters['metadata.typeTest'] = typeTest;
    if (status) filters.status = status;

    // Récupérer les données avec pagination
    const data = await Data.find(filters)
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .skip(parseInt(offset))
      .populate('patientId', 'nom prenom email');

    // Compter le total pour la pagination
    const total = await Data.countDocuments(filters);

    res.json({
      data: data.map(d => d.getFormattedData()),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: total > parseInt(offset) + data.length
      }
    });

  } catch (error) {
    console.error('Erreur lors de la récupération des données:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération des données',
      error: 'DATA_RETRIEVAL_ERROR'
    });
  }
};

// Obtenir une session spécifique
const getSessionData = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const data = await Data.findOne({ sessionId })
      .populate('patientId', 'nom prenom email');

    if (!data) {
      return res.status(404).json({
        message: 'Session non trouvée',
        error: 'SESSION_NOT_FOUND'
      });
    }

    res.json({
      data: data.getFormattedData()
    });

  } catch (error) {
    console.error('Erreur lors de la récupération de la session:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la récupération de la session',
      error: 'SESSION_RETRIEVAL_ERROR'
    });
  }
};

// Obtenir les statistiques d'un patient
const getPatientStats = async (req, res) => {
  try {
    const { patientId } = req.params;
    const { startDate, endDate } = req.query;

    // Construire les filtres de date
    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.timestamp = {};
      if (startDate) dateFilter.timestamp.$gte = new Date(startDate);
      if (endDate) dateFilter.timestamp.$lte = new Date(endDate);
    }

    const filters = { patientId, ...dateFilter };

    // Statistiques de base
    const totalSessions = await Data.countDocuments(filters);
    const sessionsWithAnalysis = await Data.countDocuments({
      ...filters,
      'analyseIA.prediction': { $ne: 'non_analyse' }
    });

    // Moyennes des valeurs
    const avgStats = await Data.aggregate([
      { $match: filters },
      {
        $group: {
          _id: null,
          avgTemperature: { $avg: '$temperature.value' },
          avgPression: { $avg: '$pression.value' },
          minTemperature: { $min: '$temperature.value' },
          maxTemperature: { $max: '$temperature.value' },
          minPression: { $min: '$pression.value' },
          maxPression: { $max: '$pression.value' }
        }
      }
    ]);

    // Répartition des prédictions IA
    const predictionStats = await Data.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$analyseIA.prediction',
          count: { $sum: 1 }
        }
      }
    ]);

    // Répartition par type de test
    const testTypeStats = await Data.aggregate([
      { $match: filters },
      {
        $group: {
          _id: '$metadata.typeTest',
          count: { $sum: 1 }
        }
      }
    ]);

    res.json({
      stats: {
        totalSessions,
        sessionsWithAnalysis,
        analysisRate: totalSessions > 0 ? (sessionsWithAnalysis / totalSessions * 100).toFixed(2) : 0,
        averages: avgStats[0] || {},
        predictions: predictionStats,
        testTypes: testTypeStats
      }
    });

  } catch (error) {
    console.error('Erreur lors du calcul des statistiques:', error);
    res.status(500).json({
      message: 'Erreur serveur lors du calcul des statistiques',
      error: 'STATS_ERROR'
    });
  }
};

// Mettre à jour l'analyse IA d'une session
const updateAnalysis = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { prediction, confiance, pathologieDetectee, recommandations } = req.body;

    const data = await Data.findOneAndUpdate(
      { sessionId },
      {
        'analyseIA.prediction': prediction,
        'analyseIA.confiance': confiance,
        'analyseIA.pathologieDetectee': pathologieDetectee,
        'analyseIA.recommandations': recommandations,
        'analyseIA.dateAnalyse': new Date(),
        status: 'analyse'
      },
      { new: true }
    );

    if (!data) {
      return res.status(404).json({
        message: 'Session non trouvée',
        error: 'SESSION_NOT_FOUND'
      });
    }

    res.json({
      message: 'Analyse mise à jour avec succès',
      data: data.getFormattedData()
    });

  } catch (error) {
    console.error('Erreur lors de la mise à jour de l\'analyse:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la mise à jour de l\'analyse',
      error: 'ANALYSIS_UPDATE_ERROR'
    });
  }
};

// Supprimer une session (admin seulement)
const deleteSession = async (req, res) => {
  try {
    const { sessionId } = req.params;

    const data = await Data.findOneAndDelete({ sessionId });

    if (!data) {
      return res.status(404).json({
        message: 'Session non trouvée',
        error: 'SESSION_NOT_FOUND'
      });
    }

    res.json({
      message: 'Session supprimée avec succès'
    });

  } catch (error) {
    console.error('Erreur lors de la suppression de la session:', error);
    res.status(500).json({
      message: 'Erreur serveur lors de la suppression',
      error: 'DELETE_ERROR'
    });
  }
};

module.exports = {
  receiveData,
  getPatientData,
  getSessionData,
  getPatientStats,
  updateAnalysis,
  deleteSession
}; 