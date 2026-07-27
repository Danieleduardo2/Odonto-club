"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { PlusCircle, Edit2, Calendar, FileText, CheckCircle, Clock } from "lucide-react";

type Consulta = {
  id: string;
  fecha: string;
  motivo_consulta: string;
  procedimiento_realizado: string;
  notas_doctor: string;
  costo_total: number;
  monto_pagado: number;
  estado_pago: string;
};

export default function ConsultasTimeline({ 
  pacienteId, 
  consultas, 
  onConsultasUpdated 
}: { 
  pacienteId: string, 
  consultas: Consulta[], 
  onConsultasUpdated: () => void 
}) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Form State
  const [motivo, setMotivo] = useState("");
  const [procedimiento, setProcedimiento] = useState("");
  const [notas, setNotas] = useState("");
  const [costo, setCosto] = useState<number | "">("");
  const [pagado, setPagado] = useState<number | "">("");
  const [proximaCita, setProximaCita] = useState<string>("none");
  
  const [loading, setLoading] = useState(false);

  const resetForm = () => {
    setMotivo("");
    setProcedimiento("");
    setNotas("");
    setCosto("");
    setPagado("");
    setProximaCita("none");
    setIsAdding(false);
    setEditingId(null);
  };

  const handleEditClick = (consulta: Consulta) => {
    setMotivo(consulta.motivo_consulta);
    setProcedimiento(consulta.procedimiento_realizado || "");
    setNotas(consulta.notas_doctor || "");
    setCosto(consulta.costo_total);
    setPagado(consulta.monto_pagado);
    setEditingId(consulta.id);
    setIsAdding(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    const payload = {
      paciente_id: pacienteId,
      motivo_consulta: motivo,
      procedimiento_realizado: procedimiento,
      notas_doctor: notas,
      costo_total: Number(costo) || 0,
      monto_pagado: Number(pagado) || 0
    };

    let res;
    if (editingId) {
      res = await supabase.from('consultas_clinicas').update(payload).eq('id', editingId);
    } else {
      // Necesitamos devolver el registro insertado para obtener su ID
      res = await supabase.from('consultas_clinicas').insert([payload]).select();
    }

    if (res.error) {
      toast.error("Error al guardar la consulta");
      console.error(res.error);
    } else {
      const consultaId = editingId ? editingId : res.data?.[0]?.id;
      
      // Manejar la creación de la próxima cita si se seleccionó una recurrencia
      if (!editingId && proximaCita !== "none" && consultaId) {
        let diasASumar = 0;
        switch (proximaCita) {
          case "15_dias": diasASumar = 15; break;
          case "1_mes": diasASumar = 30; break;
          case "2_meses": diasASumar = 60; break;
          case "6_meses": diasASumar = 180; break;
        }

        if (diasASumar > 0) {
          const nextDate = new Date();
          nextDate.setDate(nextDate.getDate() + diasASumar);
          
          await supabase.from('appointments').insert([{
            patient_id: pacienteId,
            appointment_date: nextDate.toISOString().split('T')[0],
            appointment_time: '10:00:00', // Default time, they can edit in Agenda
            reason: motivo,
            status: 'scheduled',
            es_recurrente: true,
            intervalo_recurrencia: proximaCita,
            consulta_origen_id: consultaId
          }]);
        }
      }

      toast.success(editingId ? "Consulta actualizada" : "Consulta registrada");
      resetForm();
      onConsultasUpdated();
    }
    setLoading(false);
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      
      {!isAdding && (
        <button 
          onClick={() => setIsAdding(true)}
          className="btn btn-primary" 
          style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '2rem' }}
        >
          <PlusCircle size={20} /> Registrar Nueva Consulta
        </button>
      )}

      {isAdding && (
        <div className="card fade-in" style={{ padding: '2rem', marginBottom: '2rem', border: '2px solid var(--primary)', backgroundColor: '#fdfdfd' }}>
          <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <FileText size={20} color="var(--primary)" />
            {editingId ? "Editar Consulta" : "Registrar Nueva Consulta"}
          </h3>
          
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Motivo de Consulta (Requerido)</label>
              <input 
                type="text" 
                required
                value={motivo} 
                onChange={e => setMotivo(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} 
                placeholder="Ej: Dolor de muela, Limpieza de rutina..."
              />
            </div>
            
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Procedimiento Realizado</label>
              <input 
                type="text" 
                value={procedimiento} 
                onChange={e => setProcedimiento(e.target.value)} 
                style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} 
                placeholder="Ej: Resina compuesta, Extracción..."
              />
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Notas del Doctor y Recetas Médicas</label>
              <textarea 
                value={notas} 
                onChange={e => setNotas(e.target.value)} 
                style={{ width: '100%', minHeight: '100px', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} 
                placeholder="Observaciones clínicas, medicamentos recetados..."
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', background: '#f8f9fa', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>Costo Total ($)</label>
                <input 
                  type="number" 
                  min="0"
                  step="any"
                  value={costo} 
                  onChange={e => setCosto(e.target.value ? Number(e.target.value) : "")} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1.1rem' }} 
                  placeholder="0.00"
                />
              </div>
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, color: '#333' }}>Monto Pagado Hoy ($)</label>
                <input 
                  type="number" 
                  min="0"
                  step="any"
                  value={pagado} 
                  onChange={e => setPagado(e.target.value ? Number(e.target.value) : "")} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontSize: '1.1rem' }} 
                  placeholder="0.00"
                />
              </div>
            </div>

            {!editingId && (
              <div style={{ background: '#eaf2f8', padding: '1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid #d4e6f1' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', fontWeight: 600, color: '#2980b9' }}>
                  <Calendar size={18} /> Agendar Próxima Cita Automáticamente
                </label>
                <select 
                  value={proximaCita}
                  onChange={e => setProximaCita(e.target.value)}
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #a9cce3', backgroundColor: 'white' }}
                >
                  <option value="none">No agendar automáticamente</option>
                  <option value="15_dias">Recurrente: En 15 días</option>
                  <option value="1_mes">Recurrente: En 1 mes (Ideal Ortodoncia)</option>
                  <option value="2_meses">Recurrente: En 2 meses</option>
                  <option value="6_meses">Recurrente: En 6 meses (Ideal Profilaxis)</option>
                </select>
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#5499c7' }}>
                  Esto creará una cita programada en la Agenda y el paciente recibirá recordatorios en el futuro.
                </p>
              </div>
            )}

            <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={loading}>
                {loading ? "Guardando..." : "Guardar Consulta"}
              </button>
              <button type="button" className="btn btn-secondary" onClick={resetForm} disabled={loading} style={{ background: '#eee', color: '#333' }}>
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        {consultas.length === 0 ? (
          <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No hay consultas registradas para este paciente.</p>
        ) : (
          consultas.map((c) => {
            const isPaid = c.estado_pago === 'Pagado' || c.estado_pago === 'Cortesía';
            
            return (
              <div key={c.id} className="card fade-in" style={{ display: 'flex', gap: '2rem', padding: '1.5rem', borderLeft: `4px solid ${isPaid ? '#2ecc71' : '#e74c3c'}` }}>
                {/* Info Section */}
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                    <Calendar size={14} /> {new Date(c.fecha).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <h4 style={{ fontSize: '1.1rem', marginBottom: '0.25rem' }}>{c.motivo_consulta}</h4>
                  {c.procedimiento_realizado && (
                    <p style={{ color: 'var(--primary)', fontWeight: 500, fontSize: '0.9rem', marginBottom: '1rem' }}>
                      ↳ {c.procedimiento_realizado}
                    </p>
                  )}
                  {c.notas_doctor && (
                    <div style={{ backgroundColor: '#f8f9fa', padding: '1rem', borderRadius: 'var(--radius-sm)', fontSize: '0.9rem', whiteSpace: 'pre-wrap' }}>
                      {c.notas_doctor}
                    </div>
                  )}
                </div>

                {/* Financial Section */}
                <div style={{ width: '250px', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between', borderLeft: '1px solid var(--border)', paddingLeft: '1.5rem' }}>
                  <div style={{ 
                    display: 'flex', alignItems: 'center', gap: '0.5rem', 
                    padding: '0.25rem 0.75rem', borderRadius: '1rem',
                    backgroundColor: isPaid ? '#e8f8f5' : '#fdedec',
                    color: isPaid ? '#27ae60' : '#c0392b',
                    fontWeight: 600, fontSize: '0.85rem'
                  }}>
                    {isPaid ? <CheckCircle size={14} /> : <Clock size={14} />}
                    {c.estado_pago}
                  </div>
                  
                  <div style={{ textAlign: 'right', width: '100%', marginTop: '1.5rem' }}>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Costo: ${c.costo_total?.toFixed(2)}</p>
                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '0.25rem' }}>Abono: ${c.monto_pagado?.toFixed(2)}</p>
                    {!isPaid && (
                      <p style={{ color: '#c0392b', fontWeight: 600, fontSize: '1rem', marginTop: '0.5rem', borderTop: '1px solid var(--border)', paddingTop: '0.5rem' }}>
                        Saldo: ${(c.costo_total - c.monto_pagado).toFixed(2)}
                      </p>
                    )}
                  </div>
                  
                  <button 
                    onClick={() => handleEditClick(c)}
                    className="btn btn-soft" 
                    style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem', marginTop: '1rem' }}
                  >
                    <Edit2 size={14} /> Editar
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
