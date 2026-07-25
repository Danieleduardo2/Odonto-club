"use client";

import styles from "../page.module.css";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  
  // Form state
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");

  const fetchPacientes = async () => {
    setLoading(true);
    const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (data) setPacientes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        email: email,
        notes: ""
      })
    });
    
    if (res.ok) {
      alert("Paciente creado exitosamente");
      setShowForm(false);
      fetchPacientes(); // Reload list
      setFirstName(""); setLastName(""); setPhone(""); setEmail("");
    } else {
      alert("Error al crear paciente");
    }
  };

  return (
    <div className={styles.dashboardContainer}>
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span style={{ fontSize: '1.5rem' }}>🦷</span>
          OdontoClub
        </div>
        
        <nav className={styles.nav}>
          <Link href="/" className={styles.navItem}>Dashboard</Link>
          <Link href="/pacientes" className={`${styles.navItem} ${styles.navItemActive}`}>Pacientes</Link>
          <Link href="/citas" className={styles.navItem}>Citas</Link>
        </nav>
      </aside>

      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={`${styles.title} fade-in`}>Directorio de Pacientes</h1>
          <button className="btn btn-primary" onClick={() => setShowForm(!showForm)}>
            {showForm ? "Cancelar" : "+ Nuevo Paciente"}
          </button>
        </header>

        {showForm && (
          <div className="glass-panel fade-in" style={{ padding: '2rem', marginBottom: '2rem', borderRadius: 'var(--radius-lg)' }}>
            <h2 style={{ marginBottom: '1rem' }}>Registrar Nuevo Paciente</h2>
            <form onSubmit={handleCreatePatient} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Nombre" required value={firstName} onChange={e => setFirstName(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: 1 }} />
                <input type="text" placeholder="Apellido" required value={lastName} onChange={e => setLastName(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: 1 }} />
              </div>
              <input type="text" placeholder="Teléfono (Ej: +573001234567)" required value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
              <input type="email" placeholder="Correo Electrónico" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
              <button type="submit" className="btn btn-primary" style={{ alignSelf: 'flex-start' }}>Guardar Paciente</button>
            </form>
          </div>
        )}

        <div className={`${styles.actionSection} fade-in`} style={{ animationDelay: '200ms' }}>
          <div className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Nombre</th>
                  <th style={{ padding: '1rem' }}>Teléfono</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center' }}>Cargando pacientes...</td></tr>
                ) : pacientes && pacientes.length > 0 ? (
                  pacientes.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>{p.first_name} {p.last_name}</td>
                      <td style={{ padding: '1rem' }}>{p.phone_number}</td>
                      <td style={{ padding: '1rem' }}>{p.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No hay pacientes registrados aún.
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
