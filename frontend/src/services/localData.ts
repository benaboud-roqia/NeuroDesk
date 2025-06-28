import { DataSession, PatientData } from '../types/index';

// Données de test pour les sessions
const generateTestData = (): DataSession[] => {
  const sessions: DataSession[] = [];
  
  for (let i = 0; i < 10; i++) {
    const session: DataSession = {
      _id: `session_${i + 1}`,
      patientId: '1',
      sessionId: `session_${Date.now()}_${i}`,
      timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
      emg: {
        values: Array.from({ length: 100 }, () => Math.random() * 100),
        samplingRate: 1000,
        channel: 'channel1'
      },
      temperature: {
        value: 36.5 + Math.random() * 2,
        unit: '°C',
        sensor: 'temp_sensor_1'
      },
      pression: {
        value: 1000 + Math.random() * 50,
        unit: 'hPa',
        sensor: 'pressure_sensor_1'
      },
      metadata: {
        duree: 300 + Math.random() * 600,
        typeTest: ['repos', 'contraction', 'mouvement'][Math.floor(Math.random() * 3)] as any,
        notes: `Session de test ${i + 1}`,
        position: ['assise', 'debout'][Math.floor(Math.random() * 2)] as any
      },
      analyseIA: {
        prediction: ['normal', 'anormal', 'suspect'][Math.floor(Math.random() * 3)] as any,
        confiance: 0.7 + Math.random() * 0.3,
        pathologieDetectee: [
          {
            nom: 'Tremblement essentiel',
            probabilite: Math.random() * 0.8
          }
        ],
        recommandations: [
          'Continuer la surveillance',
          'Consulter un neurologue'
        ]
      },
      status: ['brut', 'traite', 'analyse'][Math.floor(Math.random() * 3)] as any,
      duree: 300 + Math.random() * 600
    };
    
    sessions.push(session);
  }
  
  return sessions;
};

// Données de test pour les patients
const generatePatientData = (): PatientData[] => {
  const data: PatientData[] = [];
  
  for (let i = 0; i < 5; i++) {
    const item: PatientData = {
      id: `data_${i + 1}`,
      timestamp: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
      temperature: 36.5 + Math.random() * 2,
      humidity: 40 + Math.random() * 30,
      pressure: 1000 + Math.random() * 50,
      status: Math.random() > 0.3 ? 'normal' : 'anormal'
    };
    
    data.push(item);
  }
  
  return data;
};

// Service de données local
export const localDataService = {
  // Récupérer toutes les données
  getAllData: async (): Promise<DataSession[]> => {
    return new Promise((resolve) => {
      // Simuler un délai réseau
      setTimeout(() => {
        resolve(generateTestData());
      }, 500);
    });
  },

  // Récupérer les données d'un patient
  getPatientData: async (): Promise<PatientData[]> => {
    return new Promise((resolve) => {
      // Simuler un délai réseau
      setTimeout(() => {
        resolve(generatePatientData());
      }, 300);
    });
  },

  // Récupérer les statistiques
  getStats: async () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          totalSessions: 15,
          sessionsWithAnalysis: 12,
          analysisRate: 80,
          averages: {
            avgTemperature: 36.8,
            avgPression: 1013.2,
            minTemperature: 35.9,
            maxTemperature: 37.5,
            minPression: 1002,
            maxPression: 1025
          },
          predictions: [
            { _id: 'normal', count: 8 },
            { _id: 'anormal', count: 2 },
            { _id: 'suspect', count: 2 }
          ],
          testTypes: [
            { _id: 'repos', count: 5 },
            { _id: 'contraction', count: 6 },
            { _id: 'mouvement', count: 4 }
          ]
        });
      }, 200);
    });
  }
}; 