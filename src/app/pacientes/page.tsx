"use client";

import styles from "../page.module.css";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "react-hot-toast";
import { Search } from "lucide-react";
import TagSelector from "@/components/TagSelector";

export default function Pacientes() {
  const [pacientes, setPacientes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // view can be 'list', 'register-step1', 'register-step2'
  const [view, setView] = useState<'list' | 'register-step1' | 'register-step2'>('list');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Search state
  const [searchTerm, setSearchTerm] = useState("");
  
  // Step 1: Form state (Personal)
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [dob, setDob] = useState("");
  const [direccion, setDireccion] = useState("");
  const [emergencia, setEmergencia] = useState("");
  const [obraSocial, setObraSocial] = useState("");

  // Step 2: Form state (Clinical History)
  const [alergias, setAlergias] = useState<string[]>([]);
  const [medicacion, setMedicacion] = useState("");
  const [enfermedades, setEnfermedades] = useState<string[]>([]);
  const [habitos, setHabitos] = useState<string[]>([]);
  const [notas, setNotas] = useState("");

  const fetchPacientes = async () => {
    setLoading(true);
    const { data } = await supabase.from('patients').select('*').order('created_at', { ascending: false });
    if (data) setPacientes(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPacientes();
  }, []);

  const handleNextStep = (e: React.FormEvent) => {
    e.preventDefault();
    setView('register-step2');
  };

  const handleCreatePatient = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const res = await fetch('/api/patients', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        first_name: firstName,
        last_name: lastName,
        phone_number: phone,
        email: email,
        fecha_nacimiento: dob || null,
        direccion: direccion || null,
        contacto_emergencia: emergencia || null,
        obra_social: obraSocial || null,
        notes: "",
        alergias: alergias.join(', '),
        enfermedades_sistemicas: enfermedades.join(', '),
        habitos: habitos.join(', '),
        medicacion_actual: medicacion,
        notas_generales: notas
      })
    });
    
    if (res.ok) {
      toast.success("Paciente y su Historia Clínica registrados correctamente");
      setView('list');
      fetchPacientes(); // Reload list
      
      // Reset forms
      setFirstName(""); setLastName(""); setPhone(""); setEmail(""); setDob(""); setDireccion(""); setEmergencia(""); setObraSocial("");
      setAlergias([]); setEnfermedades([]); setHabitos([]); setMedicacion(""); setNotas("");
    } else {
      toast.error("Error al registrar paciente");
    }
    setIsSubmitting(false);
  };

  const filteredPacientes = pacientes.filter(p => {
    const term = searchTerm.toLowerCase();
    const fullName = `${p.first_name} ${p.last_name}`.toLowerCase();
    return fullName.includes(term) || (p.phone_number && p.phone_number.includes(term)) || (p.email && p.email.toLowerCase().includes(term));
  });

  return (
    <>
      {view === 'list' && (
        <>
          <header className={styles.header}>
            <h2 className={`${styles.title} fade-in`} style={{ fontSize: '1.5rem' }}>Directorio de Pacientes</h2>
            <button className="btn btn-soft" onClick={() => setView('register-step1')}>
              + Nuevo Paciente
            </button>
          </header>
          
          <div className="fade-in" style={{ marginBottom: '1.5rem', animationDelay: '100ms' }}>
            <div style={{ position: 'relative', maxWidth: '400px' }}>
              <Search size={20} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
              <input 
                type="text" 
                placeholder="Buscar por nombre, teléfono o email..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                style={{ 
                  width: '100%', 
                  padding: '0.85rem 1rem 0.85rem 2.5rem', 
                  borderRadius: 'var(--radius-full)', 
                  border: '1px solid var(--border)',
                  backgroundColor: 'white',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.02)',
                  fontSize: '0.95rem'
                }} 
              />
            </div>
          </div>
          
          <div className={`${styles.actionSection} fade-in`} style={{ animationDelay: '200ms' }}>
            <div className="card" style={{ padding: '0', overflow: 'hidden' }}>
              <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                <thead style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid var(--border)' }}>
                  <tr style={{ borderBottom: '1px solid var(--border)' }}>
                    <th style={{ padding: '1rem' }}>Nombre</th>
                    <th style={{ padding: '1rem' }}>Teléfono</th>
                    <th style={{ padding: '1rem' }}>Email</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={3} style={{ padding: '1rem', textAlign: 'center' }}>Cargando pacientes...</td></tr>
                  ) : filteredPacientes.length > 0 ? (
                    filteredPacientes.map((p) => (
                      <tr 
                        key={p.id} 
                        onClick={() => window.location.href = `/pacientes/${p.id}`}
                        style={{ borderBottom: '1px solid var(--border)', cursor: 'pointer', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '1rem', color: 'var(--primary)', fontWeight: 500 }}>{p.first_name} {p.last_name}</td>
                        <td style={{ padding: '1rem' }}>{p.phone_number}</td>
                        <td style={{ padding: '1rem' }}>{p.email}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                        {searchTerm ? "No se encontraron pacientes con esa búsqueda." : "No hay pacientes registrados aún."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {view === 'register-step1' && (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <header className={styles.header} style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>Registrar Nuevo Paciente (Paso 1: Datos Personales)</h2>
            <button className="btn btn-soft" onClick={() => setView('list')} style={{ background: 'transparent', border: '1px solid var(--border)' }}>
              Cancelar
            </button>
          </header>

          <div className="card" style={{ padding: '2rem' }}>
            <form onSubmit={handleNextStep} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Nombre" required value={firstName} onChange={e => setFirstName(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: 1 }} />
                <input type="text" placeholder="Apellido" required value={lastName} onChange={e => setLastName(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Teléfono (Ej: +573001234567)" required value={phone} onChange={e => setPhone(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: 1 }} />
                <input type="email" placeholder="Correo Electrónico (Opcional)" value={email} onChange={e => setEmail(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Fecha de Nacimiento</label>
                  <input type="date" value={dob} onChange={e => setDob(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
                <div style={{ flex: 1 }}>
                  <label style={{ display: 'block', fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Contacto de Emergencia</label>
                  <input type="text" placeholder="Nombre y Teléfono" value={emergencia} onChange={e => setEmergencia(e.target.value)} style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '1rem' }}>
                <input type="text" placeholder="Dirección" value={direccion} onChange={e => setDireccion(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: 1 }} />
                <input type="text" placeholder="Obra Social / Seguro (Opcional)" value={obraSocial} onChange={e => setObraSocial(e.target.value)} style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', flex: 1 }} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary">Siguiente: Historia Clínica &rarr;</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {view === 'register-step2' && (
        <div className="fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
          <header className={styles.header} style={{ marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)', margin: 0 }}>Registrar Nuevo Paciente (Paso 2: Historia Clínica)</h2>
            <button className="btn btn-soft" onClick={() => setView('register-step1')} style={{ background: 'transparent', border: '1px solid var(--border)' }}>
              &larr; Atrás
            </button>
          </header>

          <div className="card fade-in" style={{ padding: '2rem' }}>
            <form onSubmit={handleCreatePatient} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              
              <TagSelector 
                label="Alergias (Importante)"
                predefinedOptions={["Penicilina", "Látex", "Anestésicos locales", "Aspirina", "Ibuprofeno", "Sulfa"]}
                selectedTags={alergias}
                onChange={setAlergias}
                placeholder="Escribe otra alergia y presiona Enter..."
                important={true}
              />

              <TagSelector 
                label="Enfermedades Sistémicas"
                predefinedOptions={["Hipertensión", "Diabetes", "Asma", "Problemas de Coagulación", "Embarazo", "Enfermedad Cardíaca"]}
                selectedTags={enfermedades}
                onChange={setEnfermedades}
                placeholder="Escribe otra enfermedad y presiona Enter..."
              />

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Medicación Actual</label>
                <textarea 
                  value={medicacion} 
                  onChange={e => setMedicacion(e.target.value)} 
                  style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} 
                  placeholder="Medicamentos que toma actualmente..."
                />
              </div>

              <TagSelector 
                label="Hábitos Relevantes"
                predefinedOptions={["Tabaquismo", "Bruxismo", "Respirador Bucal", "Consumo de Alcohol", "Morderse las Uñas"]}
                selectedTags={habitos}
                onChange={setHabitos}
                placeholder="Escribe otro hábito y presiona Enter..."
              />

              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                  {isSubmitting ? "Guardando..." : "Finalizar y Guardar Paciente"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
