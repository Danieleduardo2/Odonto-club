"use client";
import { useState } from "react";
import styles from "../page.module.css";
import { Settings as SettingsIcon, Stethoscope, Clock, MessageSquare } from "lucide-react";
import TreatmentsConfig from "@/components/config/TreatmentsConfig";
// import WhatsAppConfig from "@/components/config/WhatsAppConfig"; // We'll move the old code here later if needed

export default function ConfiguracionPage() {
  const [activeTab, setActiveTab] = useState('treatments');

  return (
    <>
      <header className={styles.header}>
        <h2 className={`${styles.title} fade-in`} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <SettingsIcon size={28} color="var(--primary)" /> Configuración General
        </h2>
      </header>

      <div className="fade-in" style={{ animationDelay: '100ms', marginBottom: '2rem' }}>
        <p style={{ color: 'var(--text-muted)' }}>
          Administra los procedimientos de tu clínica, configura tus horarios y conecta servicios externos.
        </p>
      </div>

      <div className="fade-in" style={{ animationDelay: '150ms' }}>
        {/* TABS HEADER */}
        <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e2e8f0', marginBottom: '2rem' }}>
          <button 
            onClick={() => setActiveTab('treatments')}
            style={{ 
              padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'treatments' ? '3px solid var(--primary)' : '3px solid transparent', 
              color: activeTab === 'treatments' ? 'var(--primary)' : '#64748b', fontWeight: activeTab === 'treatments' ? 600 : 500,
              display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <Stethoscope size={18} /> Procedimientos y Precios
          </button>
          
          <button 
            onClick={() => setActiveTab('schedule')}
            style={{ 
              padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'schedule' ? '3px solid var(--primary)' : '3px solid transparent', 
              color: activeTab === 'schedule' ? 'var(--primary)' : '#64748b', fontWeight: activeTab === 'schedule' ? 600 : 500,
              display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <Clock size={18} /> Horarios (Próximamente)
          </button>

          <button 
            onClick={() => setActiveTab('whatsapp')}
            style={{ 
              padding: '1rem 1.5rem', background: 'none', border: 'none', borderBottom: activeTab === 'whatsapp' ? '3px solid var(--primary)' : '3px solid transparent', 
              color: activeTab === 'whatsapp' ? 'var(--primary)' : '#64748b', fontWeight: activeTab === 'whatsapp' ? 600 : 500,
              display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', transition: 'all 0.2s'
            }}
          >
            <MessageSquare size={18} /> WhatsApp API
          </button>
        </div>

        {/* TABS CONTENT */}
        <div>
          {activeTab === 'treatments' && <TreatmentsConfig />}
          
          {activeTab === 'schedule' && (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <Clock size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
              <h3>Configuración de Horarios Laborales</h3>
              <p>Esta sección estará disponible en la próxima actualización.</p>
            </div>
          )}

          {activeTab === 'whatsapp' && (
            <div className="card" style={{ padding: '3rem', textAlign: 'center', color: '#64748b' }}>
              <MessageSquare size={48} style={{ margin: '0 auto 1rem auto', opacity: 0.2 }} />
              <h3>Configuración de Mensajería</h3>
              <p>Módulo en rediseño para integrarse al nuevo panel.</p>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
