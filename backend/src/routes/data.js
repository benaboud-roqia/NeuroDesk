const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');
const { authenticateToken, requireRole, canAccessPatientData } = require('../middlewares/auth');

// Route pour recevoir les données du gant (depuis l'app mobile)
router.post('/receive', authenticateToken, dataController.receiveData);

// Routes pour récupérer les données
router.get('/patient/:patientId', authenticateToken, canAccessPatientData, dataController.getPatientData);
router.get('/session/:sessionId', authenticateToken, dataController.getSessionData);
router.get('/patient/:patientId/stats', authenticateToken, canAccessPatientData, dataController.getPatientStats);

// Routes pour l'analyse IA (médecins et admins)
router.put('/session/:sessionId/analysis', authenticateToken, requireRole(['medecin', 'admin']), dataController.updateAnalysis);

// Route pour supprimer une session (admin seulement)
router.delete('/session/:sessionId', authenticateToken, requireRole(['admin']), dataController.deleteSession);

module.exports = router; 