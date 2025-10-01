import { useState, useEffect } from 'react';
import { eventsAPI, usersAPI } from '../services/api';
import type { Event, User } from '../types/index';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import '../styles/Admin.css';

export default function Admin() {
  const [events, setEvents] = useState<Event[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    startDate: '',
    endDate: '',
    affectedUsers: [] as number[],
  });

  useEffect(() => {
    if (!isAdmin) {
      navigate('/calendar');
      return;
    }
    loadData();
  }, [isAdmin, navigate]);

  const loadData = async () => {
    try {
      const [eventsRes, usersRes] = await Promise.all([
        eventsAPI.getAll(),
        usersAPI.getAll(),
      ]);
      setEvents(eventsRes.data);
      setUsers(usersRes.data);
    } catch (error) {
      console.error('Erreur lors du chargement:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (event?: Event) => {
    if (event) {
      setEditingEvent(event);
      setFormData({
        title: event.title,
        description: event.description,
        startDate: new Date(event.startDate).toISOString().slice(0, 16),
        endDate: new Date(event.endDate).toISOString().slice(0, 16),
        affectedUsers: event.affectedUsers?.map(u => u.id) || [],
      });
    } else {
      setEditingEvent(null);
      setFormData({
        title: '',
        description: '',
        startDate: '',
        endDate: '',
        affectedUsers: [],
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingEvent(null);
    setFormData({
      title: '',
      description: '',
      startDate: '',
      endDate: '',
      affectedUsers: [],
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (editingEvent) {
        await eventsAPI.update(editingEvent.id, formData);
      } else {
        await eventsAPI.create(formData);
      }
      await loadData();
      handleCloseModal();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la sauvegarde');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet événement ?')) {
      return;
    }

    try {
      await eventsAPI.delete(id);
      await loadData();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erreur lors de la suppression');
    }
  };

  const toggleUserSelection = (userId: number) => {
    setFormData(prev => ({
      ...prev,
      affectedUsers: prev.affectedUsers.includes(userId)
        ? prev.affectedUsers.filter(id => id !== userId)
        : [...prev.affectedUsers, userId],
    }));
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="admin-container">
      <div className="admin-header">
        <h1>Gestion des Événements</h1>
        <button className="btn-primary" onClick={() => handleOpenModal()}>
          + Créer un événement
        </button>
      </div>

      <div className="events-table-container">
        <table className="events-table">
          <thead>
            <tr>
              <th>Titre</th>
              <th>Description</th>
              <th>Début</th>
              <th>Fin</th>
              <th>Participants</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {events.map(event => (
              <tr key={event.id}>
                <td>{event.title}</td>
                <td>{event.description}</td>
                <td>{new Date(event.startDate).toLocaleString('fr-FR')}</td>
                <td>{new Date(event.endDate).toLocaleString('fr-FR')}</td>
                <td>
                  <span className="participants-count">
                    {event.affectedUsers?.length || 0} participant(s)
                  </span>
                </td>
                <td>
                  <div className="action-buttons">
                    <button
                      className="btn-edit"
                      onClick={() => handleOpenModal(event)}
                    >
                      Modifier
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDelete(event.id)}
                    >
                      Supprimer
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={handleCloseModal}>×</button>
            <h2>{editingEvent ? 'Modifier l\'événement' : 'Créer un événement'}</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label htmlFor="title">Titre</label>
                <input
                  id="title"
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="description">Description</label>
                <textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="startDate">Date de début</label>
                  <input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="endDate">Date de fin</label>
                  <input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label>Participants</label>
                <div className="users-list">
                  {users.map(user => (
                    <div key={user.id} className="user-checkbox">
                      <input
                        type="checkbox"
                        id={`user-${user.id}`}
                        checked={formData.affectedUsers.includes(user.id)}
                        onChange={() => toggleUserSelection(user.id)}
                      />
                      <label htmlFor={`user-${user.id}`}>
                        {user.name} ({user.email}) - {user.role}
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={handleCloseModal}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  {editingEvent ? 'Mettre à jour' : 'Créer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

