import { useState, useEffect } from 'react';
import { eventsAPI } from '../services/api';
import type { Event } from '../types/index';
import { useAuth } from '../context/AuthContext';
import '../styles/Calendar.css';

export default function Calendar() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentWeekStart, setCurrentWeekStart] = useState(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Start from Monday
    return new Date(today.setDate(diff));
  });
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

  const getWeekDays = () => {
    const days = [];
    for (let i = 0; i < 7; i++) {
      const day = new Date(currentWeekStart);
      day.setDate(currentWeekStart.getDate() + i);
      days.push(day);
    }
    return days;
  };

  const getEventsForDay = (date: Date) => {
    return events.filter(event => {
      const eventStart = new Date(event.startDate);
      const eventEnd = new Date(event.endDate);
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      return (eventStart <= dayEnd && eventEnd >= dayStart);
    });
  };

  const calculateEventPosition = (event: Event, date: Date) => {
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const dayStart = new Date(date);
    dayStart.setHours(8, 0, 0, 0); // Start at 8 AM
    
    // Calculate start position (in hours from 8 AM)
    const startHour = Math.max(8, eventStart.getHours() + (eventStart.getMinutes() / 60));
    const endHour = Math.min(20, eventEnd.getHours() + (eventEnd.getMinutes() / 60));
    
    const top = (startHour - 8) * 60; // 60px per hour
    const height = Math.max(30, (endHour - startHour) * 60); // Minimum 30px height
    
    return { top, height };
  };

  const previousWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() - 7);
    setCurrentWeekStart(newDate);
  };

  const nextWeek = () => {
    const newDate = new Date(currentWeekStart);
    newDate.setDate(currentWeekStart.getDate() + 7);
    setCurrentWeekStart(newDate);
  };

  const goToToday = () => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    setCurrentWeekStart(new Date(today.setDate(diff)));
  };

  const weekDays = getWeekDays();
  const dayNames = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi', 'Dimanche'];
  const hours = Array.from({ length: 12 }, (_, i) => i + 8); // 8h to 19h

  const formatWeekRange = () => {
    const weekEnd = new Date(currentWeekStart);
    weekEnd.setDate(currentWeekStart.getDate() + 6);
    return `${currentWeekStart.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })} - ${weekEnd.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })}`;
  };

  if (loading) {
    return <div className="loading">Chargement...</div>;
  }

  return (
    <div className="calendar-container">
      <div className="calendar-header">
        <h1>Planning</h1>
        <div className="calendar-controls">
          <button onClick={goToToday} className="today-button">Aujourd'hui</button>
          <div className="calendar-navigation">
            <button onClick={previousWeek} className="nav-button">‹</button>
            <span className="current-week">{formatWeekRange()}</span>
            <button onClick={nextWeek} className="nav-button">›</button>
          </div>
        </div>
      </div>

      <div className="weekly-calendar">
        <div className="time-column">
          <div className="time-header"></div>
          {hours.map(hour => (
            <div key={hour} className="time-slot">
              {hour}:00
            </div>
          ))}
        </div>
        
        {weekDays.map((day, dayIndex) => {
          const isToday = day.toDateString() === new Date().toDateString();
          const dayEvents = getEventsForDay(day);
          
          return (
            <div key={dayIndex} className="day-column">
              <div className={`day-header ${isToday ? 'today' : ''}`}>
                <div className="day-name">{dayNames[dayIndex]}</div>
                <div className="day-date">{day.getDate()}</div>
              </div>
              <div className="day-content">
                {hours.map(hour => (
                  <div key={hour} className="time-slot"></div>
                ))}
                {dayEvents.map((event) => {
                  const position = calculateEventPosition(event, day);
                  return (
                    <div
                      key={event.id}
                      className="event-block"
                      style={{
                        position: 'absolute',
                        top: `${position.top}px`,
                        height: `${position.height}px`,
                        left: '4px',
                        right: '4px',
                        zIndex: 10
                      }}
                      onClick={() => setSelectedEvent(event)}
                      title={event.title}
                    >
                      <div className="event-title">{event.title}</div>
                      <div className="event-time">
                        {new Date(event.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                        {' - '}
                        {new Date(event.endDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  );
                })}
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

