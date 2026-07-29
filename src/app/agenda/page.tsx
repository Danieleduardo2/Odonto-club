"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { Calendar as CalendarIcon, Ban } from "lucide-react";
import AgendaCalendar from "@/components/AgendaCalendar";
import { AppointmentModal } from "@/components/modals/AppointmentModal";
import { BlockModal } from "@/components/modals/BlockModal";

export default function AgendaPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Modals state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isBlockModalOpen, setIsBlockModalOpen] = useState(false);
  const [isActionSelectorOpen, setIsActionSelectorOpen] = useState(false);
  
  // Current editing state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventToEdit, setEventToEdit] = useState<any>(null);

  const handleSlotClick = (date: Date) => {
    setEventToEdit(null);
    setSelectedDate(date);
    setIsActionSelectorOpen(true);
  };

  const handleEventClick = (event: any) => {
    if (event.type === 'appointment') {
      setSelectedDate(null);
      setEventToEdit(event);
      setIsAppointmentModalOpen(true);
    }
  };

  return (
    <>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', justifyContent: 'space-between' }}>
          <h2 className={`${styles.title} fade-in`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={28} color="var(--primary)" /> Calendario y Agenda
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }} className="fade-in">
            <button 
              onClick={() => { setSelectedDate(new Date()); setIsBlockModalOpen(true); }}
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Ban size={18} /> Bloquear Horario
            </button>
            <button 
              onClick={() => { setSelectedDate(new Date()); setEventToEdit(null); setIsAppointmentModalOpen(true); }}
              className="btn btn-primary" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              + Agendar Cita
            </button>
          </div>
        </div>
      </header>

      <div className="fade-in" style={{ animationDelay: '100ms', marginBottom: '1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          Gestiona todas tus citas médicas, bloqueos de horario y disponibilidad desde este calendario interactivo. Haz clic en un espacio vacío para agendar.
        </p>
      </div>

      <AgendaCalendar 
        refreshTrigger={refreshTrigger}
        onSlotClick={handleSlotClick}
        onEventClick={handleEventClick}
      />

      <AppointmentModal 
        isOpen={isAppointmentModalOpen}
        onClose={() => setIsAppointmentModalOpen(false)}
        selectedDate={selectedDate}
        eventToEdit={eventToEdit}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />

      <BlockModal 
        isOpen={isBlockModalOpen}
        onClose={() => setIsBlockModalOpen(false)}
        selectedDate={selectedDate}
        onSuccess={() => setRefreshTrigger(prev => prev + 1)}
      />

      {isActionSelectorOpen && (
        <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex: 120, display:'flex', justifyContent:'center', alignItems:'center'}} onClick={() => setIsActionSelectorOpen(false)}>
          <div className="card fade-in" style={{ padding: '2rem', display: 'flex', gap: '1rem' }} onClick={e => e.stopPropagation()}>
            <button 
              className="btn btn-primary" 
              onClick={() => { setIsActionSelectorOpen(false); setIsAppointmentModalOpen(true); }}
              style={{ padding: '1.5rem', fontSize: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}
            >
              <CalendarIcon size={32} /> Nueva Cita
            </button>
            <button 
              className="btn btn-outline" 
              onClick={() => { setIsActionSelectorOpen(false); setIsBlockModalOpen(true); }}
              style={{ padding: '1.5rem', fontSize: '1.1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#64748b' }}
            >
              <Ban size={32} /> Bloquear Horario
            </button>
          </div>
        </div>
      )}
    </>
  );
}
