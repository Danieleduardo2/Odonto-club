"use client";
import React, { useState, useEffect } from 'react';
import { Calendar, dateFnsLocalizer, View, Views } from 'react-big-calendar';
import { format, parse, startOfWeek, getDay } from 'date-fns';
import { es } from 'date-fns/locale/es';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import '../app/agenda/calendar.css';
import { supabase } from '@/lib/supabase';

const locales = {
  'es': es,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

export default function AgendaCalendar() {
  const [events, setEvents] = useState<any[]>([]);
  const [view, setView] = useState<View>(Views.WEEK);
  const [date, setDate] = useState(new Date());
  
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    // Fetch appointments
    const { data: appts } = await supabase
      .from('appointments')
      .select('*, patient:patients(first_name, last_name), treatment:treatments(name, color_code, default_duration_minutes)');
      
    // Fetch blocks
    const { data: blocks } = await supabase.from('schedule_blocks').select('*');

    const calendarEvents: any[] = [];
    
    if (appts) {
      appts.forEach(app => {
        const startDate = new Date(`${app.appointment_date}T${app.appointment_time}`);
        const duration = app.duration_minutes || app.treatment?.default_duration_minutes || 30;
        const endDate = new Date(startDate.getTime() + duration * 60000);
        
        calendarEvents.push({
          id: app.id,
          title: `${app.patient?.first_name} ${app.patient?.last_name} - ${app.treatment?.name || 'Consulta'}`,
          start: startDate,
          end: endDate,
          type: 'appointment',
          status: app.status,
          color: app.treatment?.color_code || '#3b82f6',
          resource: app
        });
      });
    }

    if (blocks) {
      blocks.forEach(b => {
        calendarEvents.push({
          id: b.id,
          title: b.title,
          start: new Date(b.start_datetime),
          end: new Date(b.end_datetime),
          type: 'block',
          color: '#cbd5e1', // Gray for blocks
          resource: b
        });
      });
    }

    setEvents(calendarEvents);
  };

  const eventStyleGetter = (event: any) => {
    let backgroundColor = event.color;
    let style: React.CSSProperties = {
      backgroundColor,
      borderRadius: '5px',
      opacity: 0.9,
      color: event.type === 'block' ? '#334155' : 'white',
      border: '0px',
      display: 'block'
    };
    
    // Status modifications
    if (event.status === 'completed') {
      style.opacity = 0.5;
    } else if (event.status === 'pending_scheduling') {
      style.border = '2px dashed white';
    } else if (event.status === 'no_show') {
      style.backgroundColor = '#ef4444'; // Red for no show
      style.textDecoration = 'line-through';
    }

    return { style };
  };

  return (
    <div className="fade-in" style={{ height: '75vh', marginTop: '1rem' }}>
      <Calendar
        localizer={localizer}
        events={events}
        startAccessor="start"
        endAccessor="end"
        style={{ height: '100%' }}
        culture="es"
        view={view}
        date={date}
        onView={(v) => setView(v)}
        onNavigate={(d) => setDate(d)}
        eventPropGetter={eventStyleGetter}
        min={new Date(2026, 0, 1, 7, 0, 0)} // Start at 7 AM
        max={new Date(2026, 0, 1, 20, 0, 0)} // End at 8 PM
        messages={{
          next: "Siguiente",
          previous: "Anterior",
          today: "Hoy",
          month: "Mes",
          week: "Semana",
          day: "Día",
          agenda: "Lista",
          noEventsInRange: "No hay citas en este rango."
        }}
      />
    </div>
  );
}
