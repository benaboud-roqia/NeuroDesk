import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { RegisterData } from '../types/index';
import './RegisterPage.css';

const RegisterPage: React.FC = () => {
  const [formData, setFormData] = useState<RegisterData>({
    nom: '',
    prenom: '',
    email: '',
    password: '',
    role: 'patient'
  });
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name === 'role') {
      setFormData({
        ...formData,
        [name]: value as 'patient' | 'medecin' | 'admin'
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (formData.password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    setLoading(true);

    try {
      await register(formData);
      navigate('/login');
    } catch (err) {
      setError('Erreur lors de l\'inscription');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-container">
        <div className="register-header">
          <h1>🧠 Gant Neuro</h1>
          <p>Créer votre compte</p>
        </div>

        {error && (
          <div className="alert alert-danger">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="register-form">
          <div className="row">
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="prenom" className="form-label">
                  👤 Prénom
                </label>
                <input
                  type="text"
                  id="prenom"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="Votre prénom"
                />
              </div>
            </div>
            <div className="col-md-6">
              <div className="form-group">
                <label htmlFor="nom" className="form-label">
                  👤 Nom
                </label>
                <input
                  type="text"
                  id="nom"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  className="form-control"
                  required
                  placeholder="Votre nom"
                />
              </div>
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="email" className="form-label">
              📧 Adresse email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="votre@email.com"
            />
          </div>

          <div className="form-group">
            <label htmlFor="role" className="form-label">
              👥 Rôle
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="form-control"
              required
            >
              <option value="patient">Patient</option>
              <option value="medecin">Médecin</option>
            </select>
          </div>

          <div className="form-group">
            <label htmlFor="password" className="form-label">
              🔒 Mot de passe
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="form-control"
              required
              placeholder="Votre mot de passe"
            />
          </div>

          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              🔒 Confirmer le mot de passe
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="form-control"
              required
              placeholder="Confirmez votre mot de passe"
            />
          </div>

          <button
            type="submit"
            className="btn btn-primary register-btn"
            disabled={loading}
          >
            {loading ? 'Création...' : 'Créer mon compte'}
          </button>
        </form>

        <div className="register-footer">
          <p>
            Déjà un compte ?{' '}
            <Link to="/login" className="link-primary">
              Se connecter
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage; 