"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import styles from "../page.module.css";
import { Calendar as CalendarIcon, Clock, User, CheckCircle, XCircle } from "lucide-react";
import Link from "next/link";
import { toast } from "react-hot-toast";

type Appointment = {
  id: string;
  patient_id: string;
  appointment_date: string;
  appointment_time: string;
  reason: string;
  status: string;
  es_recurrente: boolean;
  intervalo_recurrencia: string;
  patient: {
    first_name: string;
    last_name: string;
    phone_number: string;
  }
};

export default function Agenda() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    setLoading(true);
    
    // In a real app we would join the patients table using foreign keys
    // Supabase allows this if the relation is set up correctly:
    const { data, error } = await supabase
      .from('appointments')
      .select(`
        *,
        patient:patients (first_name, last_name, phone_number)
      `)
      .order('appointment_date', { ascending: true })
      .order('appointment_time', { ascending: true });

    if (error) {
      console.error(error);
      toast.error("Error al cargar la agenda");
    } else if (data) {
      // @ts-ignore
      setAppointments(data);
    }
    setLoading(false);
  };

  const updateStatus = async (id: string, newStatus: string) => {
    const { error } = await supabase
      .from('appointments')
      .update({ status: newStatus })
      .eq('id', id);

    if (error) {
      toast.error("Error al actualizar la cita");
    } else {
      toast.success("Cita actualizada");
      fetchAppointments();
    }
  };

  const pendingAppointments = appointments.filter(a => a.status === 'scheduled' || a.status === 'pending');
  const pastAppointments = appointments.filter(a => a.status === 'completed' || a.status === 'cancelled');

  return (
    <>
      <header className={styles.header}>
          <h2 className={`${styles.title} fade-in`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <CalendarIcon size={28} color="var(--primary)" /> Agenda de Citas
          </h2>
        </header>

        <div className="fade-in" style={{ animationDelay: '100ms', marginBottom: '2rem' }}>
          <p style={{ color: 'var(--text-muted)' }}>
            Aquí se muestran las citas agendadas automáticamente desde las consultas, o las creadas manualmente.
          </p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando agenda...</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '2rem' }}>
            
            {/* Próximas Citas */}
            <div className="card fade-in" style={{ animationDelay: '200ms' }}>
              <h3 style={{ marginBottom: '1.5rem', color: '#2980b9' }}>Próximas Citas</h3>
              
              {pendingAppointments.length === 0 ? (
                <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem', border: '1px dashed var(--border)', borderRadius: 'var(--radius-md)' }}>
                  No hay citas pendientes.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {pendingAppointments.map(app => (
                    <div key={app.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '1rem', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', backgroundColor: 'white', borderLeft: app.es_recurrente ? '4px solid #f39c12' : '4px solid #3498db' }}>
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                          <strong style={{ fontSize: '1.1rem' }}>
                            {new Date(app.appointment_date).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                          </strong>
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', backgroundColor: '#eaf2f8', padding: '0.25rem 0.5rem', borderRadius: '1rem', fontSize: '0.85rem', color: '#2980b9', fontWeight: 600 }}>
                            <Clock size={14} /> {app.appointment_time.substring(0, 5)}
                          </span>
                        </div>
                        
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
                          <User size={16} color="var(--text-muted)" />
                          <Link href={`/pacientes/${app.patient_id}`} style={{ fontWeight: 600, color: 'var(--text-main)', textDecoration: 'none' }}>
                            {app.patient?.first_name} {app.patient?.last_name}
                          </Link>
                        </div>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', margin: 0, paddingLeft: '1.5rem' }}>
                          {app.reason} {app.es_recurrente && <span style={{ color: '#f39c12', fontSize: '0.8rem' }}>(Recurrente: {app.intervalo_recurrencia.replace('_', ' ')})</span>}
                        </p>
                      </div>
                      
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <button 
                          onClick={() => updateStatus(app.id, 'completed')}
                          className="btn btn-soft" style={{ backgroundColor: '#e8f8f5', color: '#27ae60', padding: '0.5rem' }} title="Marcar completada"
                        >
                          <CheckCircle size={20} />
                        </button>
                        <button 
                          onClick={() => updateStatus(app.id, 'cancelled')}
                          className="btn btn-soft" style={{ backgroundColor: '#fdedec', color: '#c0392b', padding: '0.5rem' }} title="Cancelar cita"
                        >
                          <XCircle size={20} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}
    </>
  );
}
