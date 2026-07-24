"use client";

import styles from "../page.module.css";
import { useEffect, useState } from "react";

export default function Citas() {
  const [citas, setCitas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/appointments')
      .then(res => res.json())
      .then(data => {
        if (!data.error) setCitas(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const sendWhatsAppReminder = async (cita: any) => {
    alert(`Enviando lista de turnos por WhatsApp a ${cita.patients?.first_name}...`);
    // Example call to our sender API
    const res = await fetch('/api/whatsapp/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        to_phone_number: cita.patients?.phone_number,
        patient_name: cita.patients?.first_name,
        available_slots: [
          { date: "Mañana", time: "10:00 AM" },
          { date: "Mañana", time: "11:30 AM" },
          { date: "Pasado Mañana", time: "09:00 AM" }
        ]
      })
    });
    
    if (res.ok) alert('Mensaje de WhatsApp enviado correctamente');
    else alert('Error enviando el mensaje. Verifica las variables de entorno de Meta API.');
  };

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span style={{ fontSize: '1.5rem' }}>🦷</span>
          OdontoClub
        </div>
        
        <nav className={styles.nav}>
          <a href="/" className={styles.navItem}>Dashboard</a>
          <a href="/pacientes" className={styles.navItem}>Pacientes</a>
          <a href="/citas" className={`${styles.navItem} ${styles.navItemActive}`}>Citas</a>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={`${styles.title} fade-in`}>Control de Citas</h1>
          <button className="btn btn-primary">+ Agendar Cita</button>
        </header>

        <div className={`${styles.actionSection} fade-in`} style={{ animationDelay: '200ms' }}>
          <div className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Fecha y Hora</th>
                  <th style={{ padding: '1rem' }}>Paciente</th>
                  <th style={{ padding: '1rem' }}>Estado</th>
                  <th style={{ padding: '1rem' }}>Acciones</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={4} style={{ padding: '1rem', textAlign: 'center' }}>Cargando citas...</td></tr>
                ) : citas && citas.length > 0 ? (
                  citas.map((cita) => (
                    <tr key={cita.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>{cita.appointment_date} {cita.appointment_time}</td>
                      <td style={{ padding: '1rem' }}>{cita.patients?.first_name} {cita.patients?.last_name}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ padding: '0.25rem 0.5rem', backgroundColor: 'var(--primary-100)', color: 'var(--primary-900)', borderRadius: 'var(--radius-full)', fontSize: '0.8rem' }}>
                          {cita.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <button onClick={() => sendWhatsAppReminder(cita)} className="btn btn-secondary" style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}>
                          📲 Enviar Opciones WPP
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No hay citas registradas.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
