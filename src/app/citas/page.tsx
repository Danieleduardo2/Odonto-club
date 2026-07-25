"use client";

import styles from "../page.module.css";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";

export default function Citas() {
  const [citas, setCitas] = useState<any[]>([]);
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [patientId, setPatientId] = useState("");
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [reason, setReason] = useState("");

  const fetchData = async () => {
    setLoading(true);
    // Fetch citas con información del paciente
    const { data: citasData } = await supabase
      .from('appointments')
      .select('*, patients(first_name, last_name)')
      .order('appointment_date', { ascending: true });
    
    if (citasData) setCitas(citasData);

    // Fetch pacientes para el select del formulario
    const { data: pacientesData } = await supabase
      .from('patients')
      .select('id, first_name, last_name')
      .order('first_name', { ascending: true });
      
    if (pacientesData) setPacientes(pacientesData);
    
    setLoading(false);
  };

  useEffect(() => {
    fetchData();
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      if (urlParams.get('new') === 'true') {
        setShowForm(true);
      }
    }
  }, []);

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/appointments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        patient_id: patientId,
        appointment_date: date,
        appointment_time: time,
        reason: reason
      })
    });
    
    if (res.ok) {
      toast.success("Cita programada correctamente");
      setShowForm(false);
      fetchData(); // Reload list
      setPatientId(""); setDate(""); setTime(""); setReason("");
    } else {
      toast.error("Error al programar cita");
    }
  };

  return (
    <>
      <header className={styles.header}>
          <h1 className={`${styles.title} fade-in`}>Control de Citas</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "+ Nueva Cita"}
          </button>
        </header>

        {showForm && (
          <div className="card fade-in" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '1rem', color: 'var(--text-main)' }}>Programar Nueva Cita</h2>
            <form onSubmit={handleCreateAppointment} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              
              <select required value={patientId} onChange={e => setPatientId(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
                <option value="">Seleccione un paciente...</option>
                {pacientes.map(p => (
                  <option key={p.id} value={p.id}>{p.first_name} {p.last_name}</option>
                ))}
              </select>

              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="date" required value={date} onChange={e => setDate(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: 1 }} />
                <input type="time" required value={time} onChange={e => setTime(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: 1 }} />
              </div>
              
              <input type="text" placeholder="Motivo de consulta (Ej: Limpieza dental)" required value={reason} onChange={e => setReason(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
              
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Guardar Cita</button>
            </form>
          </div>
        )}

        <div className={`${styles.actionSection} fade-in`} style={{ animationDelay: '200ms' }}>
          <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Paciente</th>
                  <th style={{ padding: '1rem' }}>Fecha</th>
                  <th style={{ padding: '1rem' }}>Hora</th>
                  <th style={{ padding: '1rem' }}>Motivo</th>
                  <th style={{ padding: '1rem' }}>Estado</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={5} style={{ padding: '1rem', textAlign: 'center' }}>Cargando citas...</td></tr>
                ) : citas && citas.length > 0 ? (
                  citas.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>{c.patients?.first_name} {c.patients?.last_name}</td>
                      <td style={{ padding: '1rem' }}>{c.appointment_date}</td>
                      <td style={{ padding: '1rem' }}>{c.appointment_time}</td>
                      <td style={{ padding: '1rem' }}>{c.reason}</td>
                      <td style={{ padding: '1rem' }}>
                        <span style={{ 
                          padding: '0.25rem 0.75rem', 
                          borderRadius: '999px', 
                          fontSize: '0.875rem',
                          backgroundColor: c.status === 'pending' ? 'rgba(255,193,7,0.2)' : 'rgba(76,175,80,0.2)',
                          color: c.status === 'pending' ? '#ff9800' : '#4caf50'
                        }}>
                          {c.status === 'pending' ? 'Pendiente' : 'Agendada'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={5} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No hay citas registradas aún.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
    </>
  );
}
