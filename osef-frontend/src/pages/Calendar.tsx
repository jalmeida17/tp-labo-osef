import { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import type { Event } from '../types/index';
import { useAuth } from '../context/AuthContext';
import '../styles/Calendar.css';

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    loadEvents();
  }, []);

  const loadEvents = async () => {
    try {
      const response = await eventsAPI.getAll();
      setEvents(response.data);
    } catch (error) {
      console.error('Erreur lors du chargement des événements:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    return { daysInMonth, startingDayOfWeek, year, month };
  };

  const getEventsForDay = (day: number) => {
    const { year, month } = getDaysInMonth(currentDate);
    const dayDate = new Date(year, month, day);
    
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      
      return dayDate >= new Date(eventStart.getFullYear(), eventStart.getMonth(), eventStart.getDate()) &&
             dayDate <= new Date(eventEnd.getFullYear(), eventEnd.getMonth(), eventEnd.getDate());
    });
  };

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1));
  };

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'
  ];

  const dayNames = ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'];

  const { daysInMonth, startingDayOfWeek } = getDaysInMonth(currentDate);
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1);
  const emptyDays = Array.from({ length: startingDayOfWeek }, (_, i) => i);

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Mon Calendrier</h1>
        <div className="calendar-navigation">
          <button onClick={previousMonth} className="nav-button">‹</button>
          <span className="current-month">
            {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <button onClick={nextMonth} className="nav-button">›</button>
        </div>
      </div>

      <div className="calendar-grid">
        {dayNames.map(day => (
          <div key={day} className="day-name">{day}</div>
        ))}
        {emptyDays.map(i => (
          <div key={`empty-${i}`} className="calendar-day empty"></div>
        ))}
        {days.map(day => {
          const dayEvents = getEventsForDay(day);
          const isToday = 
            day === new Date().getDate() &&
            currentDate.getMonth() === new Date().getMonth() &&
            currentDate.getFullYear() === new Date().getFullYear();

          return (
            <div
              key={day}
              className={`calendar-day ${isToday ? 'today' : ''} ${dayEvents.length > 0 ? 'has-events' : ''}`}
            >
              <span className="day-number">{day}</span>
              <div className="events-list">
                {dayEvents.map(event => (
                  <div
                    key={event.id}
                    className="event-item"
                    onClick={() => setSelectedEvent(event)}
                    title={event.title}
                  >
                    {event.title}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {selectedEvent && (
        <div className="modal-overlay" onClick={() => setSelectedEvent(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <button className="modal-close" onClick={() => setSelectedEvent(null)}>×</button>
            <h2>{selectedEvent.title}</h2>
            <div className="modal-body">
              <p><strong>Description:</strong> {selectedEvent.description || 'Aucune description'}</p>
              <p><strong>Début:</strong> {new Date(selectedEvent.startDate).toLocaleString('fr-FR')}</p>
              <p><strong>Fin:</strong> {new Date(selectedEvent.endDate).toLocaleString('fr-FR')}</p>
              {selectedEvent.creatorName && (
                <p><strong>Créé par:</strong> {selectedEvent.creatorName}</p>
              )}
              {selectedEvent.affectedUsers && selectedEvent.affectedUsers.length > 0 && (
                <div>
                  <strong>Participants:</strong>
                  <ul>
                    {selectedEvent.affectedUsers.map(user => (
                      <li key={user.id}>{user.name} ({user.email})</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

