import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { localDataService } from '../services/localData';
import './DashboardPage.css';

interface DataPoint {
  timestamp: string;
  value: number;
  type: string;
}

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Rediriger les médecins vers leur tableau de bord spécifique
    if (user?.role === 'medecin') {
      navigate('/doctor-dashboard');
      return;
    }
    
    // Rediriger les patients vers leur tableau de bord spécifique
    if (user?.role === 'patient') {
      navigate('/patient-dashboard');
      return;
    }
    
    fetchData();
  }, [user, navigate]);

  const fetchData = async () => {
    try {
      const sessions = await localDataService.getAllData();
      // Convertir les sessions en format DataPoint pour l'affichage
      const dataPoints: DataPoint[] = sessions.map(session => ({
        timestamp: session.timestamp,
        value: session.temperature.value,
        type: session.metadata.typeTest
      }));
      setData(dataPoints);
    } catch (err) {
      setError('Erreur lors du chargement des données');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="dashboard-page">
        <div className="container">
          <div className="loading">Chargement...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <div className="container">
        <div className="dashboard-header">
          <h1>📊 Tableau de bord</h1>
          <p>Bienvenue, {user?.prenom} {user?.nom}</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <div className="row">
          <div className="col-md-4">
            <div className="card">
              <div className="card-title">📈 Données récentes</div>
              <div className="card-content">
                <div className="stat">
                  <span className="stat-number">{data.length}</span>
                  <span className="stat-label">Mesures totales</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-title">🎯 Objectif</div>
              <div className="card-content">
                <div className="stat">
                  <span className="stat-number">100%</span>
                  <span className="stat-label">Précision détection</span>
                </div>
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-title">⏰ Dernière mesure</div>
              <div className="card-content">
                <div className="stat">
                  <span className="stat-number">
                    {data.length > 0 ? new Date(data[data.length - 1].timestamp).toLocaleDateString() : 'Aucune'}
                  </span>
                  <span className="stat-label">Date</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-8">
            <div className="card">
              <div className="card-title">📊 Historique des mesures</div>
              <div className="card-content">
                {data.length > 0 ? (
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Type</th>
                        <th>Valeur</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.slice(-10).map((item, index) => (
                        <tr key={index}>
                          <td>{new Date(item.timestamp).toLocaleString()}</td>
                          <td>{item.type}</td>
                          <td>{item.value.toFixed(1)}°C</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                ) : (
                  <p>Aucune donnée disponible</p>
                )}
              </div>
            </div>
          </div>

          <div className="col-md-4">
            <div className="card">
              <div className="card-title">⚙️ Actions rapides</div>
              <div className="card-content">
                <button className="btn btn-primary action-btn">
                  📱 Nouvelle mesure
                </button>
                <button className="btn btn-success action-btn">
                  📊 Générer rapport
                </button>
                <button className="btn btn-danger action-btn" onClick={fetchData}>
                  🔄 Actualiser
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage; 