import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { X, Plus, Trash } from 'lucide-react';
import { toast } from 'react-hot-toast';

export function TreatmentsModal({ isOpen, onClose }: any) {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [newColor, setNewColor] = useState('#3b82f6');

  useEffect(() => {
    if (isOpen) fetchData();
  }, [isOpen]);

  const fetchData = async () => {
    const { data } = await supabase.from('treatments').select('*').order('name');
    if (data) setTreatments(data);
  };

  const handleAdd = async () => {
    if (!newName) return toast.error('Ingresa un nombre');
    const { error } = await supabase.from('treatments').insert([{
      name: newName,
      default_duration_minutes: newDuration,
      color_code: newColor
    }]);
    
    if (error) toast.error('Error al guardar');
    else {
      setNewName('');
      setNewDuration(30);
      toast.success('Tratamiento agregado');
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase.from('treatments').delete().eq('id', id);
    if (error) toast.error('Error al borrar');
    else { toast.success('Borrado exitosamente'); fetchData(); }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position:'fixed', top:0, left:0, right:0, bottom:0, backgroundColor:'rgba(0,0,0,0.5)', zIndex: 100, display:'flex', justifyContent:'center', alignItems:'center'}}>
      <div className="card fade-in" style={{ width: '500px', padding: '1.5rem', position: 'relative', maxHeight: '80vh', overflowY: 'auto' }}>
        <button onClick={onClose} style={{ position:'absolute', top:'1rem', right:'1rem', background:'none', border:'none', cursor:'pointer' }}><X/></button>
        <h3 style={{ marginBottom: '1rem', color: '#0f2c49' }}>Catálogo de Tratamientos</h3>
        
        <div style={{ marginBottom: '1.5rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: '8px' }}>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Agregar Nuevo</h4>
          <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'flex-end' }}>
            <div style={{ flex: 2 }}>
              <label style={{ fontSize: '0.8rem' }}>Nombre</label>
              <input type="text" value={newName} onChange={e=>setNewName(e.target.value)} style={{width:'100%', padding:'0.4rem'}} />
            </div>
            <div style={{ flex: 1 }}>
              <label style={{ fontSize: '0.8rem' }}>Minutos</label>
              <input type="number" value={newDuration} onChange={e=>setNewDuration(parseInt(e.target.value))} style={{width:'100%', padding:'0.4rem'}} />
            </div>
            <div style={{ flex: 0.5 }}>
              <label style={{ fontSize: '0.8rem' }}>Color</label>
              <input type="color" value={newColor} onChange={e=>setNewColor(e.target.value)} style={{width:'100%', height: '32px', padding: '0'}} />
            </div>
            <button onClick={handleAdd} className="btn btn-primary" style={{ padding: '0.4rem 0.8rem' }}><Plus size={18}/></button>
          </div>
        </div>

        <div>
          <h4 style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>Tratamientos Existentes</h4>
          {treatments.length === 0 && <p style={{ fontSize: '0.85rem', color: '#64748b' }}>No hay tratamientos.</p>}
          
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {treatments.map(t => (
              <li key={t.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.75rem', borderBottom: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '16px', height: '16px', borderRadius: '50%', backgroundColor: t.color_code }}></div>
                  <div>
                    <strong style={{ display: 'block', fontSize: '0.9rem' }}>{t.name}</strong>
                    <span style={{ fontSize: '0.8rem', color: '#64748b' }}>{t.default_duration_minutes} minutos</span>
                  </div>
                </div>
                <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash size={16}/></button>
              </li>
            ))}
          </ul>
        </div>

      </div>
    </div>
  );
}
