import React, { useState, useEffect } from 'react';

const StatistiquesPage: React.FC = () => {
  // Données simulées avec persistance
  const [stats, setStats] = useState({
    patients: 18,
    medecins: 5,
    rdvs: 12,
    consultationsParJour: [
      { date: '2024-06-01', nb: 3 },
      { date: '2024-06-02', nb: 5 },
      { date: '2024-06-03', nb: 2 },
      { date: '2024-06-04', nb: 7 },
      { date: '2024-06-05', nb: 4 },
    ]
  });

  // Charger les statistiques depuis localStorage au démarrage
  useEffect(() => {
    const savedStats = localStorage.getItem('neurodesktop_statistiques');
    if (savedStats) {
      setStats(JSON.parse(savedStats));
    }
  }, []);

  // Mettre à jour les statistiques en temps réel depuis les autres pages
  useEffect(() => {
    const updateStats = () => {
      const patients = JSON.parse(localStorage.getItem('neurodesktop_patients') || '[]');
      const medecins = JSON.parse(localStorage.getItem('neurodesktop_medecins') || '[]');
      const rdvs = JSON.parse(localStorage.getItem('neurodesktop_rendezvous') || '[]');
      
      setStats(prevStats => ({
        ...prevStats,
        patients: patients.length,
        medecins: medecins.length,
        rdvs: rdvs.length
      }));
    };

    // Mettre à jour immédiatement
    updateStats();

    // Écouter les changements dans localStorage
    const handleStorageChange = () => {
      updateStats();
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Sauvegarder les statistiques quand elles changent
  useEffect(() => {
    localStorage.setItem('neurodesktop_statistiques', JSON.stringify(stats));
  }, [stats]);

  return (
    <div style={{padding: 32}}>
      <h2>Statistiques</h2>
      <table className="table" style={{width:'100%',background:'#fff',borderRadius:8,overflow:'hidden',marginBottom:24}}>
        <thead><tr><th>Indicateur</th><th>Valeur</th></tr></thead>
        <tbody>
          <tr><td>Nombre total de patients</td><td>{stats.patients}</td></tr>
          <tr><td>Nombre total de médecins</td><td>{stats.medecins}</td></tr>
          <tr><td>Nombre total de rendez-vous</td><td>{stats.rdvs}</td></tr>
        </tbody>
      </table>
      <h4>Consultations par jour</h4>
      <div style={{width:'100%',maxWidth:500,margin:'0 auto'}}>
        <svg width="100%" height="180">
          {stats.consultationsParJour.map((c, i) => (
            <g key={c.date}>
              <rect x={i*80+20} y={160-c.nb*20} width={40} height={c.nb*20} fill="#4f8cff" rx={6} />
              <text x={i*80+40} y={175} textAnchor="middle" fontSize="12">{c.date.slice(5)}</text>
              <text x={i*80+40} y={160-c.nb*20-5} textAnchor="middle" fontSize="13" fill="#333">{c.nb}</text>
            </g>
          ))}
        </svg>
      </div>
    </div>
  );
};
export default StatistiquesPage; 