"use client";

import { useEffect, useState, use } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import TagSelector from "@/components/TagSelector";
import Odontograma, { OdontogramaState } from "@/components/Odontograma";

export default function PatientProfile({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const [patient, setPatient] = useState<any>(null);
  const [historia, setHistoria] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("resumen");
  const [saving, setSaving] = useState(false);

  // Form states for clinical history
  const [alergias, setAlergias] = useState<string[]>([]);
  const [medicacion, setMedicacion] = useState("");
  const [enfermedades, setEnfermedades] = useState<string[]>([]);
  const [habitos, setHabitos] = useState<string[]>([]);
  const [notas, setNotas] = useState("");
  
  // Odontograma state
  const [odontograma, setOdontograma] = useState<OdontogramaState>({});

  const fetchData = async () => {
    setLoading(true);
    // Fetch patient
    const { data: pData } = await supabase.from('patients').select('*').eq('id', resolvedParams.id).single();
    if (pData) setPatient(pData);

    // Fetch historia clinica
    const { data: hData } = await supabase.from('historia_clinica').select('*').eq('paciente_id', resolvedParams.id).single();
    if (hData) {
      setHistoria(hData);
      setAlergias(hData.alergias ? hData.alergias.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
      setMedicacion(hData.medicacion_actual || "");
      setEnfermedades(hData.enfermedades_sistemicas ? hData.enfermedades_sistemicas.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
      setHabitos(hData.habitos ? hData.habitos.split(',').map((s: string) => s.trim()).filter(Boolean) : []);
      setNotas(hData.notas_generales || "");
      if (hData.odontograma_estado) {
        setOdontograma(hData.odontograma_estado);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    if (resolvedParams.id) {
      fetchData();
    }
  }, [resolvedParams.id]);

  const handleSaveHistoria = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const payload = {
      paciente_id: resolvedParams.id,
      alergias: alergias.join(', '),
      medicacion_actual: medicacion,
      enfermedades_sistemicas: enfermedades.join(', '),
      habitos: habitos.join(', '),
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

  const handleOdontogramaChange = async (newState: OdontogramaState) => {
    setOdontograma(newState); // Optimistic UI update
    
    if (historia?.id) {
      const res = await supabase.from('historia_clinica').update({
        odontograma_estado: newState
      }).eq('id', historia.id);
      
      if (res.error) {
        toast.error("Error al guardar el odontograma");
        console.error(res.error);
      } else {
        toast.success("Odontograma actualizado");
      }
    } else {
      toast.error("Guarda primero la historia clínica base");
    }
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
        <button 
          onClick={() => setActiveTab('odontograma')}
          style={{ padding: '1rem', background: 'none', border: 'none', borderBottom: activeTab === 'odontograma' ? '2px solid var(--primary)' : '2px solid transparent', color: activeTab === 'odontograma' ? 'var(--primary)' : 'var(--text-muted)', fontWeight: activeTab === 'odontograma' ? 600 : 400, cursor: 'pointer' }}>
          Odontograma
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

      {activeTab === 'odontograma' && (
        <div className="card fade-in" style={{ padding: '2rem', overflowX: 'auto' }}>
          <h3 style={{ marginBottom: '1.5rem', color: 'var(--text-main)' }}>Odontograma Dental</h3>
          <p style={{ color: 'var(--text-muted)', marginBottom: '2rem', fontSize: '0.9rem' }}>
            Haz clic en cualquier pieza dental para marcar su estado. Los cambios se guardan automáticamente.
          </p>
          <Odontograma 
            initialState={odontograma} 
            onChange={handleOdontogramaChange} 
            readOnly={!historia?.id} 
          />
          {!historia?.id && (
            <p style={{ color: '#dc2626', marginTop: '1rem', fontSize: '0.9rem', textAlign: 'center' }}>
              Debes completar y guardar la Historia Clínica (pestaña anterior) para activar el Odontograma.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
