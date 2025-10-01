import { useState, useEffect } from 'react';
import { usersAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import type { User } from '../types/index';
import '../styles/Profile.css';

export default function Profile() {
  const { user, logout } = useAuth();
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadUserData();
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      const response = await usersAPI.getById(user.id);
      setUserData(response.data);
      setFormData({
        name: response.data.name,
        email: response.data.email,
        password: '',
        confirmPassword: '',
      });
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }

    if (formData.password && formData.password.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères');
      return;
    }

    try {
      const updateData: any = {
        name: formData.name,
        email: formData.email,
      };

      if (formData.password) {
        updateData.password = formData.password;
      }

      await usersAPI.update(user!.id, updateData);
      setSuccess('Profil mis à jour avec succès');
      setEditing(false);
      await loadUserData();
      
      // Clear password fields
      setFormData(prev => ({
        ...prev,
        password: '',
        confirmPassword: '',
      }));
    } catch (error: any) {
      setError(error.response?.data?.message || 'Erreur lors de la mise à jour');
    }
  };

  const handleCancel = () => {
    if (userData) {
      setFormData({
        name: userData.name,
        email: userData.email,
        password: '',
        confirmPassword: '',
      });
    }
    setEditing(false);
    setError('');
    setSuccess('');
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  if (!userData) {
    return <div className="loading">Utilisateur introuvable</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-card">
        <div className="profile-header">
          <h1>Mon Profil</h1>
          {!editing && (
            <button className="btn-edit-profile" onClick={() => setEditing(true)}>
              Modifier
            </button>
          )}
        </div>

        {success && <div className="success-message">{success}</div>}
        {error && <div className="error-message">{error}</div>}

        {!editing ? (
          <div className="profile-info">
            <div className="info-group">
              <label>Nom</label>
              <p>{userData.name}</p>
            </div>
            <div className="info-group">
              <label>Email</label>
              <p>{userData.email}</p>
            </div>
            <div className="info-group">
              <label>Rôle</label>
              <p className={`role-badge ${userData.role}`}>
                {userData.role === 'admin' ? 'Administrateur' : 'Utilisateur'}
              </p>
            </div>
            <div className="info-group">
              <label>Membre depuis</label>
              <p>{new Date(userData.createdAt).toLocaleDateString('fr-FR')}</p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="name">Nom</label>
              <input
                id="name"
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
              />
            </div>

            <div className="form-divider">
              <span>Changer le mot de passe (optionnel)</span>
            </div>

            <div className="form-group">
              <label htmlFor="password">Nouveau mot de passe</label>
              <input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                placeholder="Laisser vide pour ne pas changer"
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe</label>
              <input
                id="confirmPassword"
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                placeholder="Confirmer le nouveau mot de passe"
              />
            </div>

            <div className="form-actions">
              <button type="button" className="btn-cancel" onClick={handleCancel}>
                Annuler
              </button>
              <button type="submit" className="btn-save">
                Enregistrer
              </button>
            </div>
          </form>
        )}

        <div className="profile-footer">
          <button className="btn-logout" onClick={logout}>
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
}

