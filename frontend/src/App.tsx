import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import Layout from './components/Layout';
import LayoutMedecin from './components/LayoutMedecin';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import PatientDashboard from './pages/PatientDashboard';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientsPage from './pages/PatientsPage';
import MedecinsPage from './pages/MedecinsPage';
import RendezVousPage from './pages/RendezVousPage';
import StatistiquesPage from './pages/StatistiquesPage';
import CommunicationPage from './pages/CommunicationPage';
import './App.css';

const App: React.FC = () => {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <Routes>
            {/* Routes publiques */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            
            {/* Routes protégées */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Layout>
                    <DashboardPage />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/patient-dashboard" 
              element={
                <ProtectedRoute requiredRole="patient">
                  <Layout>
                    <PatientDashboard />
                  </Layout>
                </ProtectedRoute>
              } 
            />
            
            <Route 
              path="/doctor-dashboard" 
              element={
                <ProtectedRoute requiredRole="medecin">
                  <LayoutMedecin>
                    <DoctorDashboard />
                  </LayoutMedecin>
                </ProtectedRoute>
              } 
            />
            {/* Nouvelles routes */}
            <Route 
              path="/patients" 
              element={
                <ProtectedRoute requiredRole="medecin">
                  <LayoutMedecin>
                    <PatientsPage />
                  </LayoutMedecin>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/medecins" 
              element={
                <ProtectedRoute requiredRole="medecin">
                  <LayoutMedecin>
                    <MedecinsPage />
                  </LayoutMedecin>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/rendez-vous" 
              element={
                <ProtectedRoute requiredRole="medecin">
                  <LayoutMedecin>
                    <RendezVousPage />
                  </LayoutMedecin>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/statistiques" 
              element={
                <ProtectedRoute requiredRole="medecin">
                  <LayoutMedecin>
                    <StatistiquesPage />
                  </LayoutMedecin>
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/communication" 
              element={
                <ProtectedRoute requiredRole="medecin">
                  <LayoutMedecin>
                    <CommunicationPage />
                  </LayoutMedecin>
                </ProtectedRoute>
              } 
            />
            {/* Redirection par défaut */}
            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
          </Routes>
        </div>
      </Router>
    </AuthProvider>
  );
};

export default App; 