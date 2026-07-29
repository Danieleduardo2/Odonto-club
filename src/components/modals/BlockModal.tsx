import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function BlockModal({ isOpen, onClose, selectedDate, onSuccess }: any) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');

  useEffect(() => {
    if (isOpen && selectedDate) {
      const iso = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString();
      setDate(iso.split('T')[0]);
      setStartTime(iso.split('T')[1].substring(0,5));
      // End time 1 hour later by default
      const endD = new Date(selectedDate.getTime() + 60 * 60000);
      const endIso = new Date(endD.getTime() - (endD.getTimezoneOffset() * 60000)).toISOString();
      setEndTime(endIso.split('T')[1].substring(0,5));
      setTitle('');
    }
  }, [isOpen, selectedDate]);

  const handleSave = async () => {
    if (!title || !date || !startTime || !endTime) return toast.error('Faltan campos');
    
    const startIso = new Date(`${date}T${startTime}:00`).toISOString();
    const endIso = new Date(`${date}T${endTime}:00`).toISOString();

    const payload = {
      title,
      start_datetime: startIso,
      end_datetime: endIso
    };

    const { error } = await supabase.from('schedule_blocks').insert([payload]);

    if (error) {
      toast.error('Error al guardar el bloqueo');
    } else {
      toast.success('Horario bloqueado exitosamente');
      onSuccess();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex: 110, display:'flex', justifyContent:'center', alignItems:'center'}}>
      <div className="card fade-in" style={{ width: '95%', maxWidth: '400px', padding: '1.5rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:'1rem', right:'1rem', background:'none', border:'none', cursor:'pointer' }}><X/></button>
        <h3 style={{ marginBottom: '1rem', color: '#0f2c49' }}>Bloquear Horario</h3>
        
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div>
            <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:600 }}>Motivo (Título)</label>
            <input type="text" className="input" placeholder="Ej. Hora de Almuerzo" value={title} onChange={e=>setTitle(e.target.value)} style={{width:'100%', padding:'0.5rem', borderRadius:'4px', border:'1px solid #e2e8f0'}} />
          </div>

          <div>
            <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:600 }}>Fecha</label>
            <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:'100%', padding:'0.5rem', borderRadius:'4px', border:'1px solid #e2e8f0'}} />
          </div>

          <div style={{ display:'flex', gap:'1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:600 }}>Hora Inicio</label>
              <input type="time" value={startTime} onChange={e=>setStartTime(e.target.value)} style={{width:'100%', padding:'0.5rem', borderRadius:'4px', border:'1px solid #e2e8f0'}} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:600 }}>Hora Fin</label>
              <input type="time" value={endTime} onChange={e=>setEndTime(e.target.value)} style={{width:'100%', padding:'0.5rem', borderRadius:'4px', border:'1px solid #e2e8f0'}} />
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'flex-end', marginTop:'1rem' }}>
            <button onClick={handleSave} className="btn btn-primary" style={{ backgroundColor: '#64748b' }}>Guardar Bloqueo</button>
          </div>
        </div>
      </div>
    </div>
  );
}
