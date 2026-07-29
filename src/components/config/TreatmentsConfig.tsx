"use client";
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { Plus, Trash, Edit2 } from 'lucide-react';
import { toast } from 'react-hot-toast';

export default function TreatmentsConfig() {
  const [treatments, setTreatments] = useState<any[]>([]);
  const [newName, setNewName] = useState('');
  const [newDuration, setNewDuration] = useState(30);
  const [newColor, setNewColor] = useState('#3b82f6');
  const [newPrice, setNewPrice] = useState(0);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const { data } = await supabase.from('treatments').select('*').order('name');
    if (data) setTreatments(data);
  };

  const handleAdd = async () => {
    if (!newName) return toast.error('Ingresa un nombre para el tratamiento');
    
    const payload = {
      name: newName,
      default_duration_minutes: newDuration,
      color_code: newColor,
      price: newPrice
    };

    const { error } = await supabase.from('treatments').insert([payload]);
    
    if (error) {
      console.error(error);
      toast.error('Error al guardar el tratamiento');
    } else {
      setNewName('');
      setNewDuration(30);
      setNewPrice(0);
      setNewColor('#3b82f6');
      toast.success('Tratamiento agregado');
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm("¿Seguro que deseas eliminar este tratamiento?")) return;
    const { error } = await supabase.from('treatments').delete().eq('id', id);
    if (error) toast.error('Error al borrar');
    else { toast.success('Borrado exitosamente'); fetchData(); }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', minimumFractionDigits: 0 }).format(amount);
  };

  return (
    <div className="fade-in">
      <h3 style={{ marginBottom: '1.5rem', color: '#0f2c49', fontSize: '1.2rem' }}>Catálogo de Tratamientos y Procedimientos</h3>
      
      <div className="card" style={{ padding: '1.5rem', marginBottom: '2rem', backgroundColor: '#f8fafc', border: '1px solid #e2e8f0' }}>
        <h4 style={{ fontSize: '1rem', marginBottom: '1rem', color: '#1e293b' }}>Agregar Nuevo Tratamiento</h4>
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 0.5fr auto', gap: '1rem', alignItems: 'flex-end' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Nombre</label>
            <input type="text" className="input" placeholder="Ej. Ortodoncia" value={newName} onChange={e=>setNewName(e.target.value)} style={{width:'100%', padding:'0.6rem', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Precio (Base)</label>
            <input type="number" className="input" value={newPrice} onChange={e=>setNewPrice(parseInt(e.target.value) || 0)} style={{width:'100%', padding:'0.6rem', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Minutos</label>
            <input type="number" className="input" value={newDuration} onChange={e=>setNewDuration(parseInt(e.target.value) || 30)} style={{width:'100%', padding:'0.6rem', borderRadius:'4px', border:'1px solid #cbd5e1'}} />
          </div>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '0.25rem' }}>Color</label>
            <input type="color" value={newColor} onChange={e=>setNewColor(e.target.value)} style={{width:'100%', height: '38px', padding: '0', border: 'none', borderRadius: '4px', cursor: 'pointer'}} />
          </div>
          <button onClick={handleAdd} className="btn btn-primary" style={{ padding: '0.6rem 1.2rem', height: '38px' }}><Plus size={20}/></button>
        </div>
      </div>

      <div className="card" style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
        <table style={{ width: '100%', minWidth: '600px', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ backgroundColor: '#f1f5f9', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Color</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Tratamiento</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Precio</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600 }}>Duración</th>
              <th style={{ padding: '1rem', color: '#475569', fontWeight: 600, textAlign: 'right' }}>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {treatments.length === 0 ? (
              <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: '#64748b' }}>No hay tratamientos configurados.</td></tr>
            ) : (
              treatments.map(t => (
                <tr key={t.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ width: '24px', height: '24px', borderRadius: '50%', backgroundColor: t.color_code, boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}></div>
                  </td>
                  <td style={{ padding: '1rem', fontWeight: 500, color: '#1e293b' }}>{t.name}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{formatCurrency(t.price || 0)}</td>
                  <td style={{ padding: '1rem', color: '#64748b' }}>{t.default_duration_minutes} min</td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <button onClick={() => handleDelete(t.id)} style={{ background: 'none', border: 'none', color: '#ef4444', cursor: 'pointer', padding: '0.5rem', borderRadius: '4px' }} className="hover-bg-red-50">
                      <Trash size={18}/>
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
