"use client";

import { useState, useRef } from "react";
import { supabase } from "@/lib/supabase";
import { toast } from "react-hot-toast";
import { UploadCloud, Image as ImageIcon, X, Download, FileText } from "lucide-react";
import Image from "next/image";

type Documento = {
  id: string;
  titulo: string;
  tipo: string;
  file_url: string;
  created_at: string;
};

export default function ImageGallery({ 
  pacienteId, 
  documentos, 
  onDocumentosUpdated 
}: { 
  pacienteId: string, 
  documentos: Documento[], 
  onDocumentosUpdated: () => void 
}) {
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [titulo, setTitulo] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Fullscreen Viewer State
  const [viewingImage, setViewingImage] = useState<Documento | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        toast.error("Por favor, sube solo imágenes (JPG, PNG, etc).");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFile || !titulo) return;
    
    setIsUploading(true);
    
    try {
      // 1. Generate unique file name
      const fileExt = selectedFile.name.split('.').pop();
      const fileName = `${pacienteId}/${Date.now()}.${fileExt}`;
      
      // 2. Upload to Supabase Storage Bucket ('documentos')
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documentos')
        .upload(fileName, selectedFile);
        
      if (uploadError) throw uploadError;
      
      // 3. Get Public URL
      const { data: publicUrlData } = supabase.storage
        .from('documentos')
        .getPublicUrl(fileName);
        
      // 4. Save metadata in database
      const { error: dbError } = await supabase
        .from('documentos_paciente')
        .insert([{
          paciente_id: pacienteId,
          titulo: titulo,
          tipo: 'Imagen',
          file_url: publicUrlData.publicUrl
        }]);
        
      if (dbError) throw dbError;
      
      toast.success("Imagen subida exitosamente");
      setSelectedFile(null);
      setTitulo("");
      if (fileInputRef.current) fileInputRef.current.value = "";
      onDocumentosUpdated();
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || "Error al subir la imagen");
    } finally {
      setIsUploading(false);
    }
  };

  const downloadImage = async (doc: Documento) => {
    try {
      const response = await fetch(doc.file_url);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.titulo.replace(/\s+/g, '_')}_${new Date().getTime()}.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast.error("Error al descargar la imagen");
    }
  };

  return (
    <div style={{ marginTop: '1rem' }}>
      
      {/* Upload Area */}
      <div className="card fade-in" style={{ padding: '2rem', marginBottom: '2rem', backgroundColor: '#fdfdfd' }}>
        <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <UploadCloud size={20} color="var(--primary)" /> Subir Nueva Imagen
        </h3>
        
        <form onSubmit={handleUpload} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div style={{ 
            border: '2px dashed var(--border)', 
            padding: '2rem', 
            textAlign: 'center', 
            borderRadius: 'var(--radius-lg)',
            backgroundColor: selectedFile ? '#e8f8f5' : '#fafafa',
            cursor: 'pointer',
            transition: 'all 0.2s'
          }} onClick={() => fileInputRef.current?.click()}>
            
            <input 
              type="file" 
              accept="image/*" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              style={{ display: 'none' }} 
            />
            
            {selectedFile ? (
              <div>
                <ImageIcon size={40} color="var(--primary)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
                <p style={{ fontWeight: 600, color: 'var(--text-main)', margin: 0 }}>{selectedFile.name}</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>(Haz clic para cambiar)</p>
              </div>
            ) : (
              <div>
                <UploadCloud size={40} color="var(--text-muted)" style={{ margin: '0 auto', marginBottom: '1rem' }} />
                <p style={{ fontWeight: 500, color: 'var(--text-main)', margin: 0 }}>Haz clic para seleccionar una imagen</p>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', margin: 0 }}>Solo formatos de imagen (JPG, PNG)</p>
              </div>
            )}
          </div>

          {selectedFile && (
            <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Título de la Imagen</label>
                <input 
                  type="text" 
                  required
                  value={titulo} 
                  onChange={e => setTitulo(e.target.value)} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }} 
                  placeholder="Ej: Radiografía Periapical 45"
                />
              </div>
              <button type="submit" className="btn btn-primary" disabled={isUploading || !titulo}>
                {isUploading ? "Subiendo..." : "Guardar Imagen"}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Gallery Grid */}
      <h3 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <ImageIcon size={20} /> Galería del Paciente
      </h3>
      
      {documentos.length === 0 ? (
        <p style={{ color: 'var(--text-muted)', textAlign: 'center', padding: '2rem' }}>No hay imágenes registradas para este paciente.</p>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '1rem' }}>
          {documentos.map((doc) => (
            <div 
              key={doc.id} 
              className="fade-in"
              style={{ 
                borderRadius: 'var(--radius-md)', 
                overflow: 'hidden', 
                border: '1px solid var(--border)',
                backgroundColor: 'white',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onClick={() => setViewingImage(doc)}
              onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
              onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ width: '100%', height: '150px', position: 'relative', backgroundColor: '#f0f0f0' }}>
                <img 
                  src={doc.file_url} 
                  alt={doc.titulo} 
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                />
              </div>
              <div style={{ padding: '0.75rem' }}>
                <h5 style={{ margin: 0, fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.titulo}</h5>
                <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.25rem' }}>
                  {new Date(doc.created_at).toLocaleDateString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Fullscreen Lightbox */}
      {viewingImage && (
        <div style={{
          position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: 'rgba(0,0,0,0.9)', zIndex: 9999,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          padding: '2rem'
        }}>
          {/* Top Bar */}
          <div style={{ position: 'absolute', top: 0, left: 0, right: 0, padding: '1rem 2rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', color: 'white', background: 'linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)' }}>
            <h3 style={{ margin: 0 }}>{viewingImage.titulo}</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <button 
                onClick={(e) => { e.stopPropagation(); downloadImage(viewingImage); }}
                style={{ background: 'rgba(255,255,255,0.2)', border: 'none', color: 'white', padding: '0.5rem 1rem', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}
              >
                <Download size={18} /> Descargar
              </button>
              <button 
                onClick={() => setViewingImage(null)}
                style={{ background: 'none', border: 'none', color: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
              >
                <X size={32} />
              </button>
            </div>
          </div>
          
          {/* Image */}
          <img 
            src={viewingImage.file_url} 
            alt={viewingImage.titulo} 
            style={{ maxWidth: '100%', maxHeight: '85vh', objectFit: 'contain', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }} 
          />
        </div>
      )}
      
    </div>
  );
}
