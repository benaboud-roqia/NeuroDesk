import React, { useState, useEffect } from 'react';
import { useAuth } from '../hooks/useAuth';
import { localDataService } from '../services/localData';
import './PatientDashboard.css';

interface PatientData {
  id: string;
  timestamp: string;
  temperature: number;
  humidity: number;
  pressure: number;
  status: string;
}

const PatientDashboard: React.FC = () => {
  const { user } = useAuth();
  const [data, setData] = useState<PatientData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPatientData();
  }, []);

  const fetchPatientData = async () => {
    try {
      const patientData = await localDataService.getPatientData();
      setData(patientData);
    } catch (err) {
      setError('Erreur lors du chargement des données patient');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="patient-dashboard">
        <div className="container">
          <div className="loading">Chargement des données patient...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="patient-dashboard">
      <div className="container">
        <div className="patient-header">
          <h1>👤 Mon Profil Patient</h1>
          <p>Bienvenue, {user?.prenom} {user?.nom}</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="row">
          <div className="col-md-6">
            <div className="card">
              <div className="card-title">📊 Mes dernières mesures</div>
              <div className="card-content">
                {data.length > 0 ? (
                  <div className="measurement-list">
                    {data.slice(-5).map((item, index) => (
                      <div key={index} className="measurement-item">
                        <div className="measurement-date">
                          {new Date(item.timestamp).toLocaleString()}
                        </div>
                        <div className="measurement-values">
                          <span>🌡️ {item.temperature.toFixed(1)}°C</span>
                          <span>💧 {item.humidity.toFixed(0)}%</span>
                          <span>📊 {item.pressure.toFixed(0)} hPa</span>
                        </div>
                        <div className={`measurement-status ${item.status}`}>
                          {item.status === 'normal' ? '✅ Normal' : '⚠️ Anormal'}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p>Aucune mesure disponible</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-6">
            <div className="card">
              <div className="card-title">📈 Statistiques</div>
              <div className="card-content">
                <div className="stats-grid">
                  <div className="stat-item">
                    <span className="stat-number">{data.length}</span>
                    <span className="stat-label">Mesures totales</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">
                      {data.filter(item => item.status === 'normal').length}
                    </span>
                    <span className="stat-label">Mesures normales</span>
                  </div>
                  <div className="stat-item">
                    <span className="stat-number">
                      {data.length > 0 ? new Date(data[data.length - 1].timestamp).toLocaleDateString() : 'Aucune'}
                    </span>
                    <span className="stat-label">Dernière mesure</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-12">
            <div className="card">
              <div className="card-title">⚙️ Actions</div>
              <div className="card-content">
                <div className="action-buttons">
                  <button className="btn btn-primary">
                    📱 Nouvelle session de mesure
                  </button>
                  <button className="btn btn-success">
                    📊 Télécharger mes données
                  </button>
                  <button className="btn btn-info">
                    📧 Contacter mon médecin
                  </button>
                  <button className="btn btn-warning" onClick={fetchPatientData}>
                    🔄 Actualiser les données
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PatientDashboard; 