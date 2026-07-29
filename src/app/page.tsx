"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "./page.module.css";
import { MessageSquare, Calendar as CalendarIcon, Clock, User } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Home() {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTodayAppointments();
  }, []);

  const fetchTodayAppointments = async () => {
    setLoading(true);
    // Get today's date in YYYY-MM-DD
    const today = new Date();
    // adjust for timezone
    const todayStr = new Date(today.getTime() - (today.getTimezoneOffset() * 60000)).toISOString().split('T')[0];

    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patients (first_name, last_name, phone_number),
        treatments (name, color_code)
      `)
      .eq('appointment_date', todayStr)
      .order('appointment_time', { ascending: true });

    if (error) {
      console.error(error);
    } else if (data) {
      setAppointments(data);
    }
    setLoading(false);
  };

  const handleSendReminder = async (appointment: any) => {
    toast.success(`Recordatorio enviado a ${appointment.patients?.first_name} (Simulación)`);
    // Here we would call the Meta API endpoint
  };

  const formatTime = (timeStr: string) => {
    if (!timeStr) return '';
    const [h, m] = timeStr.split(':');
    let hNum = parseInt(h);
    const ampm = hNum >= 12 ? 'PM' : 'AM';
    hNum = hNum % 12 || 12;
    return `${hNum}:${m} ${ampm}`;
  };

  return (
    <>
      <header className={styles.header}>
        <h2 className={`${styles.title} fade-in`} style={{ fontSize: '1.5rem', margin: 0 }}>
          Bienvenido, Dr. Admin
        </h2>
      </header>

      {/* Citas del dia */}
      <div className={`${styles.actionSection} fade-in`} style={{ animationDelay: '100ms' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem' }}>
          <CalendarIcon color="var(--primary)" />
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', fontWeight: 600, margin: 0 }}>
            Agenda del Día (Hoy)
          </h3>
        </div>

        {loading ? (
          <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Cargando citas del día...</div>
        ) : appointments.length === 0 ? (
          <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
            <CalendarIcon size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
            <h3>No tienes citas programadas para hoy</h3>
            <p>¡Disfruta tu día libre o agenda una nueva cita desde el calendario!</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: '1rem' }}>
            {appointments.map(appt => (
              <div key={appt.id} className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `4px solid ${appt.treatments?.color_code || 'var(--primary)'}` }}>
                <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                    <span style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0f2c49', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <Clock size={16} color="#64748b" /> {formatTime(appt.appointment_time)}
                    </span>
                    <span style={{ fontSize: '0.85rem', color: '#64748b' }}>{appt.duration_minutes} min</span>
                  </div>
                  
                  <div>
                    <h4 style={{ margin: '0 0 0.25rem 0', fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <User size={18} /> {appt.patients?.first_name} {appt.patients?.last_name}
                    </h4>
                    <span style={{ display: 'inline-block', padding: '0.25rem 0.5rem', backgroundColor: '#f1f5f9', borderRadius: '4px', fontSize: '0.85rem', color: '#475569', fontWeight: 500 }}>
                      {appt.treatments?.name || 'Tratamiento General'}
                    </span>
                  </div>
                </div>
                
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <span style={{ fontSize: '0.85rem', fontWeight: 500, padding: '0.25rem 0.75rem', borderRadius: '50px', backgroundColor: appt.status === 'pending' ? '#fef3c7' : '#d1fae5', color: appt.status === 'pending' ? '#d97706' : '#059669' }}>
                    {appt.status === 'pending' ? 'Pendiente' : 'Confirmada'}
                  </span>
                  <button onClick={() => handleSendReminder(appt)} className="btn btn-soft" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: '#eaf2f8', color: '#2980b9' }}>
                    <MessageSquare size={16} /> Enviar Recordatorio
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
