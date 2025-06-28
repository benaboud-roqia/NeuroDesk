import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaUserMd, FaUserInjured, FaCalendarAlt, FaChartBar, FaSignOutAlt, FaStethoscope, FaHome, FaComments } from 'react-icons/fa';
import { useAuth } from '../hooks/useAuth';
import './Layout.css';

interface LayoutMedecinProps {
  children: React.ReactNode;
}

const LayoutMedecin: React.FC<LayoutMedecinProps> = ({ children }) => {
  const { user } = useAuth();
  // Badge notification rendez-vous du jour
  const [nbRdvJour, setNbRdvJour] = useState(0);
  useEffect(() => {
    const data = localStorage.getItem('neurodesktop_rendezvous');
    if (data) {
      const rdvs = JSON.parse(data);
      const today = new Date().toISOString().slice(0, 10);
      setNbRdvJour(rdvs.filter((r: any) => r.date === today).length);
    }
  }, []);

  return (
    <div className="layout">
      {/* Topbar horizontale avec navigation */}
      <header className="topbar horizontal-navbar">
        <div className="navbar-left">
          <FaStethoscope size={28} color="#4f8cff" style={{ marginRight: 8 }} />
          <span className="navbar-title">NeuroDesktop</span>
        </div>
        <nav className="navbar-menu">
          <Link to="/doctor-dashboard" className="navbar-link active">
            <FaHome /> <span>Tableau de bord</span>
          </Link>
          <Link to="/patients" className="navbar-link">
            <FaUserInjured /> <span>Patients</span>
          </Link>
          <Link to="/medecins" className="navbar-link">
            <FaUserMd /> <span>Médecins</span>
          </Link>
          <Link to="/rendez-vous" className="navbar-link">
            <FaCalendarAlt /> <span>Rendez-vous</span>
            {nbRdvJour > 0 && (
              <span style={{
                background:'#ff3b3b',
                color:'#fff',
                borderRadius:'50%',
                fontSize:'0.85em',
                padding:'2px 7px',
                marginLeft:6,
                fontWeight:700,
                verticalAlign:'top',
                boxShadow:'0 1px 4px #b9b9e6',
                position:'relative',
                top:-8
              }}>{nbRdvJour}</span>
            )}
          </Link>
          <Link to="/statistiques" className="navbar-link">
            <FaChartBar /> <span>Statistiques</span>
          </Link>
          <Link to="/communication" className="navbar-link">
            <FaComments /> <span>Communication</span>
          </Link>
        </nav>
      </header>
      {/* Logo sous la barre de navigation */}
      <div style={{width:'100%',display:'flex',justifyContent:'center',alignItems:'center',margin:'24px 0'}}>
        <img src="/neuroglove-logo.jpg" alt="Logo Neuroglove" style={{height:90, width:'auto', filter:'drop-shadow(0 2px 8px #b9b9e6)'}} />
      </div>
      <div className="main-content" style={{ paddingTop: 82 }}>
        <main className="dashboard-content">
          {children}
        </main>
      </div>
    </div>
  );
};

export default LayoutMedecin; 