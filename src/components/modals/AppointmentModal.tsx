import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X } from 'lucide-react';
import { toast } from 'react-hot-toast';
import Select from 'react-select';

export function AppointmentModal({ isOpen, onClose, selectedDate, eventToEdit, onSuccess }: any) {
  const [patients, setPatients] = useState<any[]>([]);
  const [treatments, setTreatments] = useState<any[]>([]);
  
  const [patientId, setPatientId] = useState('');
  const [treatmentId, setTreatmentId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [duration, setDuration] = useState(30);
  const [status, setStatus] = useState('pending');

  useEffect(() => {
    if (isOpen) {
      fetchData();
      if (eventToEdit) {
        setPatientId(eventToEdit.resource.patient_id);
        setTreatmentId(eventToEdit.resource.treatment_id || '');
        setDate(eventToEdit.resource.appointment_date);
        setTime(eventToEdit.resource.appointment_time);
        setDuration(eventToEdit.resource.duration_minutes || 30);
        setStatus(eventToEdit.resource.status);
      } else if (selectedDate) {
        const iso = new Date(selectedDate.getTime() - (selectedDate.getTimezoneOffset() * 60000)).toISOString();
        setDate(iso.split('T')[0]);
        setTime(iso.split('T')[1].substring(0,5));
        setPatientId('');
        setTreatmentId('');
      }
    }
  }, [isOpen, selectedDate, eventToEdit]);

  const fetchData = async () => {
    const { data: p } = await supabase.from('patients').select('*').order('first_name');
    const { data: t } = await supabase.from('treatments').select('*');
    if (p) setPatients(p);
    if (t) setTreatments(t);
  };

  const handleTreatmentChange = (id: string) => {
    setTreatmentId(id);
    const treat = treatments.find(t => t.id === id);
    if (treat) setDuration(treat.default_duration_minutes);
  };

  const handleSave = async () => {
    if (!patientId || !date || !time) return toast.error('Faltan campos');
    
    const payload = {
      patient_id: patientId,
      treatment_id: treatmentId || null,
      appointment_date: date,
      appointment_time: time,
      duration_minutes: duration,
      status: status
    };

    let error;
    if (eventToEdit) {
      const res = await supabase.from('appointments').update(payload).eq('id', eventToEdit.id);
      error = res.error;
    } else {
      const res = await supabase.from('appointments').insert([payload]);
      error = res.error;
    }

    if (error) toast.error('Error al guardar cita');
    else { toast.success('Cita guardada'); onSuccess(); onClose(); }
  };

  const handleDelete = async () => {
    if(!eventToEdit) return;
    const {error} = await supabase.from('appointments').delete().eq('id', eventToEdit.id);
    if(error) toast.error("Error al borrar");
    else { toast.success("Borrada"); onSuccess(); onClose(); }
  };

  if (!isOpen) return null;

  // Format options for react-select
  const patientOptions = patients.map(p => ({ value: p.id, label: `${p.first_name} ${p.last_name}` }));
  const treatmentOptions = treatments.map(t => ({ value: t.id, label: t.name }));

  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex: 100, display:'flex', justifyContent:'center', alignItems:'center'}}>
      <div className="card fade-in" style={{ width: '95%', maxWidth: '500px', padding: '1.5rem', position: 'relative' }}>
        <button onClick={onClose} style={{ position:'absolute', top:'1rem', right:'1rem', background:'none', border:'none', cursor:'pointer' }}><X/></button>
        <h3 style={{ marginBottom: '1rem', color: '#0f2c49' }}>{eventToEdit ? 'Editar Cita' : 'Nueva Cita'}</h3>
        
        <div style={{ display:'flex', flexDirection:'column', gap:'1rem' }}>
          <div>
            <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:600 }}>Paciente</label>
            <Select 
              options={patientOptions}
              value={patientOptions.find(opt => opt.value === patientId) || null}
              onChange={(selected: any) => setPatientId(selected ? selected.value : '')}
              placeholder="Buscar paciente..."
              isClearable
              styles={{ control: (base) => ({ ...base, borderColor: '#e2e8f0', padding: '2px' }) }}
            />
          </div>
          
          <div>
            <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:600 }}>Tratamiento</label>
            <Select 
              options={treatmentOptions}
              value={treatmentOptions.find(opt => opt.value === treatmentId) || null}
              onChange={(selected: any) => handleTreatmentChange(selected ? selected.value : '')}
              placeholder="Buscar tratamiento..."
              isClearable
              styles={{ control: (base) => ({ ...base, borderColor: '#e2e8f0', padding: '2px' }) }}
            />
          </div>

          <div style={{ display:'flex', gap:'1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:600 }}>Fecha</label>
              <input type="date" value={date} onChange={e=>setDate(e.target.value)} style={{width:'100%', padding:'0.5rem', borderRadius:'4px', border:'1px solid #e2e8f0'}} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:600 }}>Hora</label>
              <input type="time" value={time} onChange={e=>setTime(e.target.value)} style={{width:'100%', padding:'0.5rem', borderRadius:'4px', border:'1px solid #e2e8f0'}} />
            </div>
          </div>

          <div style={{ display:'flex', gap:'1rem' }}>
            <div style={{ flex: 1 }}>
              <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:600 }}>Duración (minutos)</label>
              <input type="number" value={duration} onChange={e=>setDuration(parseInt(e.target.value))} style={{width:'100%', padding:'0.5rem', borderRadius:'4px', border:'1px solid #e2e8f0'}} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ display:'block', marginBottom:'0.5rem', fontWeight:600 }}>Estado</label>
              <select value={status} onChange={e=>setStatus(e.target.value)} style={{width:'100%', padding:'0.5rem', borderRadius:'4px', border:'1px solid #e2e8f0'}}>
                <option value="pending">Pendiente (Sin Confirmar)</option>
                <option value="scheduled">Confirmada</option>
                <option value="in_progress">En Curso</option>
                <option value="completed">Completada</option>
                <option value="no_show">No Asistió</option>
                <option value="cancelled">Cancelada</option>
              </select>
            </div>
          </div>

          <div style={{ display:'flex', justifyContent:'space-between', marginTop:'1rem' }}>
            {eventToEdit ? (
              <button onClick={handleDelete} className="btn" style={{ backgroundColor:'#ef4444', color:'white' }}>Borrar Cita</button>
            ) : <div/>}
            <button onClick={handleSave} className="btn btn-primary">Guardar Cita</button>
          </div>
        </div>
      </div>
    </div>
  );
}
