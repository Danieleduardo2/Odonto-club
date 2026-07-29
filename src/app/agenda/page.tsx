"use client";

import styles from "../page.module.css";
import { Calendar as CalendarIcon, Settings } from "lucide-react";
import AgendaCalendar from "@/components/AgendaCalendar";
import Link from "next/link";

export default function AgendaPage() {
  return (
    <>
      <header className={styles.header}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', width: '100%', justifyContent: 'space-between' }}>
          <h2 className={`${styles.title} fade-in`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={28} color="var(--primary)" /> Calendario y Agenda
          </h2>
          <div style={{ display: 'flex', gap: '0.5rem' }} className="fade-in">
            <button className="btn btn-outline" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <Settings size={18} /> Configurar Horarios
            </button>
            <button className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              + Agendar Cita
            </button>
          </div>
        </div>
      </header>

      <div className="fade-in" style={{ animationDelay: '100ms', marginBottom: '1rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          Gestiona todas tus citas médicas, bloqueos de horario y disponibilidad desde este calendario interactivo.
        </p>
      </div>

      <AgendaCalendar />
    </>
  );
}
