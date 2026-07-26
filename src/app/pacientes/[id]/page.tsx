"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PatientProfile({ params }: { params: { id: string } }) {
  const [patient, setPatient] = useState<any>(null);
  const [historia, setHistoria] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("historia");
  const [saving, setSaving] = useState(false);

  // Form states for clinical history
  const [alergias, setAlergias] = useState("");
  const [medicacion, setMedicacion] = useState("");
  const [enfermedades, setEnfermedades] = useState("");
  const [habitos, setHabitos] = useState("");
  const [notas, setNotas] = useState("");

  const fetchData = async () => {
    setLoading(true);
    // Fetch patient
    const { data: pData } = await supabase.from('patients').select('*').eq('id', params.id).single();
    if (pData) setPatient(pData);

    // Fetch historia clinica
    const { data: hData } = await supabase.from('historia_clinica').select('*').eq('paciente_id', params.id).single();
    if (hData) {
      setHistoria(hData);
      setAlergias(hData.alergias || "");
      setMedicacion(hData.medicacion_actual || "");
      setEnfermedades(hData.enfermedades_sistemicas || "");
      setHabitos(hData.habitos || "");
      setNotas(hData.notas_generales || "");
    }
    setLoading(false);
  };

  useEffect(() => {
    if (params.id) {
      fetchData();
    }
  }, [params.id]);

  const handleSaveHistoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      paciente_id: params.id,
      alergias,
      medicacion_actual: medicacion,
      enfermedades_sistemicas: enfermedades,
      habitos,
      notas_generales: notas,
      updated_at: new Date()
    };

    let res;
    if (historia?.id) {
      // Update
      res = await supabase.from('historia_clinica').update(payload).eq('id', historia.id);
    } else {
      // Insert
      res = await supabase.from('historia_clinica').insert([payload]);
    }

    if (res.error) {
      toast.error("Error al guardar la historia clínica");
      console.error(res.error);
    } else {
      toast.success("Historia clínica guardada");
      fetchData();
    }
    setSaving(false);
  };

  if (loading) return <div style={{ padding: '2rem' }}>Cargando ficha del paciente...</div>;
  if (!patient) return <div style={{ padding: '2rem' }}>Paciente no encontrado.</div>;

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '2rem' }}>
        <Link href="/pacientes" style={{ marginRight: '1rem', color: 'var(--text-muted)' }}>
          <ArrowLeft size={24} />
        </Link>
        <div>
          <h1 style={{ marginBottom: '0.25rem' }}>{patient.first_name} {patient.last_name}</h1>
          <p style={{ color: 'var(--text-muted)' }}>ID: {patient.id.split('-')[0]} | {patient.phone_number}</p>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--border)', marginBottom: '2rem' }}>
        <button 
          onClick={() => setActiveTab('resumen')}
          style={{ padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'resumen' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'resumen' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'resumen' ? 600 : 400, cursor: 'pointer' }}>
          Resumen
        </button>
        <button 
          onClick={() => setActiveTab('historia')}
          style={{ padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'historia' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'historia' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'historia' ? 600 : 400, cursor: 'pointer' }}>
          Historia Clínica
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'resumen' && (
        <div className="card fade-in" style={{ padding: '2rem' }}>
          <h3>Datos Personales</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginTop: '1.5rem' }}>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Correo Electrónico</p>
              <p>{patient.email || "No registrado"}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Teléfono</p>
              <p>{patient.phone_number}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Fecha de Nacimiento</p>
              <p>{patient.fecha_nacimiento || "No registrada"}</p>
            </div>
            <div>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>Contacto de Emergencia</p>
              <p>{patient.contacto_emergencia || "No registrado"}</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'historia' && (
        <div className="card fade-in" style={{ padding: '2rem' }}>
          <form onSubmit={handleSaveHistoria} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#dc2626' }}>Alergias (Importante)</label>
              <textarea 
                value={alergias} 
                onChange={e => setAlergias(e.target.value)} 
                placeholder="Ej: Penicilina, Látex..."
                style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Enfermedades Sistémicas</label>
              <textarea 
                value={enfermedades} 
                onChange={e => setEnfermedades(e.target.value)} 
                placeholder="Ej: Hipertensión, Diabetes..."
                style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Medicación Actual</label>
              <textarea 
                value={medicacion} 
                onChange={e => setMedicacion(e.target.value)} 
                style={{ width: '100%', minHeight: '80px', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Hábitos Relevantes</label>
              <textarea 
                value={habitos} 
                onChange={e => setHabitos(e.target.value)} 
                placeholder="Ej: Tabaquismo, Bruxismo..."
                style={{ width: '100%', minHeight: '60px', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} 
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Notas Generales</label>
              <textarea 
                value={notas} 
                onChange={e => setNotas(e.target.value)} 
                style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} 
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={saving} style={{ alignSelf: 'flex-start' }}>
              {saving ? "Guardando..." : "Guardar Historia Clínica"}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
