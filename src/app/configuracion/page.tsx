"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import Sidebar from "@/components/Sidebar";
import styles from "../page.module.css";
import { Settings as SettingsIcon, Save, Key, Phone, MessageSquare } from "lucide-react";
import { toast } from "react-hot-toast";

export default function Configuracion() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [accessToken, setAccessToken] = useState("");
  const [phoneId, setPhoneId] = useState("");
  const [templateName, setTemplateName] = useState("recordatorio_cita");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('settings')
      .select('key, value')
      .in('key', ['whatsapp_access_token', 'whatsapp_phone_id', 'whatsapp_template_name']);

    if (data) {
      data.forEach(setting => {
        if (setting.key === 'whatsapp_access_token') setAccessToken(setting.value);
        if (setting.key === 'whatsapp_phone_id') setPhoneId(setting.value);
        if (setting.key === 'whatsapp_template_name') setTemplateName(setting.value);
      });
    }
    setLoading(false);
  };

  const saveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    
    const settingsToSave = [
      { key: 'whatsapp_access_token', value: accessToken },
      { key: 'whatsapp_phone_id', value: phoneId },
      { key: 'whatsapp_template_name', value: templateName }
    ];

    let hasError = false;

    for (const setting of settingsToSave) {
      const { error } = await supabase
        .from('settings')
        .upsert(
          { key: setting.key, value: setting.value }, 
          { onConflict: 'key' }
        );
      
      if (error) {
        console.error("Error saving", setting.key, error);
        hasError = true;
      }
    }

    if (hasError) {
      toast.error("Error al guardar la configuración");
    } else {
      toast.success("Configuración de WhatsApp guardada");
    }
    setSaving(false);
  };

  return (
    <>
      <header className={styles.header}>
        <h2 className={`${styles.title} fade-in`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SettingsIcon size={28} color="var(--primary)" /> Configuración de WhatsApp
        </h2>
      </header>

      <div className="fade-in" style={{ animationDelay: '100ms', marginBottom: '2rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          Conecta la API oficial de Meta para enviar recordatorios automáticos a tus pacientes.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '3rem' }}>Cargando configuración...</div>
      ) : (
        <div className="card fade-in" style={{ animationDelay: '200ms', maxWidth: '800px' }}>
          <form onSubmit={saveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            
            <div style={{ padding: '1.5rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#2c3e50', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={18} /> Credenciales de Meta (API de Facebook)
              </h3>
              
              <div style={{ marginBottom: '1.5rem' }}>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Access Token Permanente</label>
                <input 
                  type="password" 
                  value={accessToken} 
                  onChange={e => setAccessToken(e.target.value)} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontFamily: 'monospace' }} 
                  placeholder="EAAL..."
                />
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>El token de acceso generado en el panel de desarrolladores de Facebook.</p>
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Phone size={16} /> Phone Number ID
                </label>
                <input 
                  type="text" 
                  value={phoneId} 
                  onChange={e => setPhoneId(e.target.value)} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)', fontFamily: 'monospace' }} 
                  placeholder="Ej: 104234567890123"
                />
                <p style={{ margin: '0.25rem 0 0 0', fontSize: '0.8rem', color: 'var(--text-muted)' }}>El identificador numérico de la línea de WhatsApp.</p>
              </div>
            </div>

            <div style={{ padding: '1.5rem', backgroundColor: '#eaf2f8', borderRadius: 'var(--radius-md)', border: '1px solid #d4e6f1' }}>
              <h3 style={{ margin: '0 0 1rem 0', fontSize: '1.1rem', color: '#2980b9', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MessageSquare size={18} /> Plantilla de Mensaje (Template)
              </h3>
              
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 500 }}>Nombre del Template en Meta</label>
                <input 
                  type="text" 
                  value={templateName} 
                  onChange={e => setTemplateName(e.target.value)} 
                  style={{ width: '100%', padding: '0.75rem', borderRadius: 'var(--radius-md)', border: '1px solid #a9cce3', backgroundColor: 'white' }} 
                  placeholder="Ej: recordatorio_cita"
                />
                <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', color: '#5499c7' }}>
                  Asegúrate de que la plantilla en Meta tenga 3 variables (&#123;&#123;1&#125;&#125;, &#123;&#123;2&#125;&#125;, &#123;&#123;3&#125;&#125;) para: Nombre, Hora y Motivo.
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
              <button type="submit" className="btn btn-primary" disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Save size={18} /> {saving ? "Guardando..." : "Guardar Configuración"}
              </button>
            </div>
            
          </form>
        </div>
      )}
    </>
  );
}
