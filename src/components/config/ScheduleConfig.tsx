"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Save, Copy } from 'lucide-react';
import { toast } from 'react-hot-toast';

const DAYS = [
  { id: 1, name: 'Lunes' },
  { id: 2, name: 'Martes' },
  { id: 3, name: 'Miércoles' },
  { id: 4, name: 'Jueves' },
  { id: 5, name: 'Viernes' },
  { id: 6, name: 'Sábado' },
  { id: 0, name: 'Domingo' }
];

const DEFAULT_DAY_CONFIG = {
  isOpen: true,
  start: '08:00',
  end: '18:00',
  hasBreak: true,
  breakStart: '12:00',
  breakEnd: '14:00'
};

export default function ScheduleConfig() {
  const [schedule, setSchedule] = useState<any>({});
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Initialize default schedule
    const initial: any = {};
    DAYS.forEach(d => {
      // Sat/Sun closed by default
      initial[d.id] = { ...DEFAULT_DAY_CONFIG, isOpen: d.id !== 6 && d.id !== 0 };
    });
    setSchedule(initial);
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('settings').select('value').eq('key', 'working_hours').single();
    if (data && data.value) {
      try {
        const parsed = JSON.parse(data.value);
        setSchedule(parsed);
      } catch (e) {
        console.error("Error parsing schedule");
      }
    }
  };

  const handleUpdate = (dayId: number, field: string, value: any) => {
    setSchedule((prev: any) => ({
      ...prev,
      [dayId]: { ...prev[dayId], [field]: value }
    }));
  };

  const copyToAll = (sourceDayId: number) => {
    if (!window.confirm("¿Copiar el horario de este día a todos los demás días laborales (Lunes a Viernes)?")) return;
    const sourceConfig = schedule[sourceDayId];
    setSchedule((prev: any) => {
      const newSchedule = { ...prev };
      [1, 2, 3, 4, 5].forEach(id => {
        newSchedule[id] = { ...sourceConfig, isOpen: true }; // Keep them open
      });
      return newSchedule;
    });
    toast.success("Horario copiado a toda la semana");
  };

  const saveConfig = async () => {
    setSaving(true);
    const { error } = await supabase
      .from('settings')
      .upsert({ key: 'working_hours', value: JSON.stringify(schedule) }, { onConflict: 'key' });
    
    setSaving(false);
    if (error) toast.error('Error al guardar horarios');
    else toast.success('Horarios guardados exitosamente');
  };

  if (Object.keys(schedule).length === 0) return <div>Cargando...</div>;

  return (
    <div className="fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
        <h3 style={{ color: '#0f2c49', fontSize: '1.2rem', margin: 0 }}>Horario Habitual de Atención</h3>
        <button onClick={saveConfig} className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Save size={18} /> {saving ? 'Guardando...' : 'Guardar Horarios'}
        </button>
      </div>
      
      <div className="card" style={{ padding: '1.5rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <div style={{ display: 'grid', gap: '1rem' }}>
          {DAYS.map(day => (
            <div key={day.id} style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: '1rem', padding: '1rem', backgroundColor: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
              
              <div style={{ width: '120px' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontWeight: 600, color: schedule[day.id].isOpen ? '#1e293b' : '#94a3b8' }}>
                  <input 
                    type="checkbox" 
                    checked={schedule[day.id].isOpen}
                    onChange={(e) => handleUpdate(day.id, 'isOpen', e.target.checked)}
                    style={{ width: '18px', height: '18px' }}
                  />
                  {day.name}
                </label>
              </div>

              {schedule[day.id].isOpen ? (
                <>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input type="time" className="input" value={schedule[day.id].start} onChange={e=>handleUpdate(day.id, 'start', e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                    <span>a</span>
                    <input type="time" className="input" value={schedule[day.id].end} onChange={e=>handleUpdate(day.id, 'end', e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginLeft: '2rem', paddingLeft: '2rem', borderLeft: '1px solid #e2e8f0' }}>
                    <label style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.9rem', color: '#64748b' }}>
                      <input type="checkbox" checked={schedule[day.id].hasBreak} onChange={e=>handleUpdate(day.id, 'hasBreak', e.target.checked)} />
                      Pausa (Almuerzo)
                    </label>
                    {schedule[day.id].hasBreak && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <input type="time" className="input" value={schedule[day.id].breakStart} onChange={e=>handleUpdate(day.id, 'breakStart', e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                        <span>a</span>
                        <input type="time" className="input" value={schedule[day.id].breakEnd} onChange={e=>handleUpdate(day.id, 'breakEnd', e.target.value)} style={{ padding: '0.4rem', borderRadius: '4px', border: '1px solid #cbd5e1' }} />
                      </div>
                    )}
                  </div>

                  <div style={{ marginLeft: 'auto' }}>
                    <button onClick={() => copyToAll(day.id)} className="btn btn-outline" style={{ padding: '0.4rem', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '0.25rem' }} title="Copiar este horario a Lunes-Viernes">
                      <Copy size={14}/> Copiar a la semana
                    </button>
                  </div>
                </>
              ) : (
                <div style={{ color: '#94a3b8', fontStyle: 'italic' }}>Cerrado</div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
