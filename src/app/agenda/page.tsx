"use client";

import { useState } from "react";
import styles from "../page.module.css";
import { Calendar as CalendarIcon, Settings } from "lucide-react";
import AgendaCalendar from "@/components/AgendaCalendar";
import { AppointmentModal } from "@/components/modals/AppointmentModal";
import { TreatmentsModal } from "@/components/modals/TreatmentsModal";

export default function AgendaPage() {
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  // Modals state
  const [isAppointmentModalOpen, setIsAppointmentModalOpen] = useState(false);
  const [isTreatmentsModalOpen, setIsTreatmentsModalOpen] = useState(false);
  
  // Current editing state
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [eventToEdit, setEventToEdit] = useState<any>(null);

  const handleSlotClick = (date: Date) => {
    setEventToEdit(null);
    setSelectedDate(date);
    setIsAppointmentModalOpen(true);
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
              onClick={() => setIsTreatmentsModalOpen(true)}
              className="btn btn-outline" 
              style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}
            >
              <Settings size={18} /> Configurar Tratamientos
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

      <TreatmentsModal 
        isOpen={isTreatmentsModalOpen}
        onClose={() => setIsTreatmentsModalOpen(false)}
      />
    </>
  );
}
