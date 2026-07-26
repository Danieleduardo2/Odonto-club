"use client";

import { useState } from "react";
import { Check, X, AlertCircle, Circle, ArrowDown, Droplet } from "lucide-react";

export type ToothStatus = 'sano' | 'caries' | 'obturado' | 'ausente' | 'endodoncia' | 'corona' | 'implante';

export interface OdontogramaState {
  [toothNumber: string]: ToothStatus;
}

interface OdontogramaProps {
  initialState: OdontogramaState;
  onChange: (newState: OdontogramaState) => void;
  readOnly?: boolean;
}

// FDI Notation for Adult Teeth
const UPPER_RIGHT = [18, 17, 16, 15, 14, 13, 12, 11];
const UPPER_LEFT = [21, 22, 23, 24, 25, 26, 27, 28];
const LOWER_RIGHT = [48, 47, 46, 45, 44, 43, 42, 41];
const LOWER_LEFT = [31, 32, 33, 34, 35, 36, 37, 38];

const STATUS_COLORS: Record<ToothStatus, string> = {
  sano: 'white',
  caries: '#ef4444',     // Red
  obturado: '#3b82f6',   // Blue
  ausente: '#9ca3af',    // Gray
  endodoncia: '#f97316', // Orange
  corona: '#eab308',     // Yellow
  implante: '#a855f7'    // Purple
};

const STATUS_LABELS: Record<ToothStatus, string> = {
  sano: 'Sano',
  caries: 'Caries',
  obturado: 'Obturado / Calza',
  ausente: 'Ausente / Extraído',
  endodoncia: 'Endodoncia',
  corona: 'Corona',
  implante: 'Implante'
};

export default function Odontograma({ initialState, onChange, readOnly = false }: OdontogramaProps) {
  const [activeTooth, setActiveTooth] = useState<number | null>(null);

  const handleStatusChange = (status: ToothStatus) => {
    if (!activeTooth || readOnly) return;
    
    const newState = { ...initialState };
    if (status === 'sano') {
      delete newState[activeTooth]; // Remove from state to keep DB clean
    } else {
      newState[activeTooth] = status;
    }
    
    onChange(newState);
    setActiveTooth(null);
  };

  const renderTooth = (num: number) => {
    const status = initialState[num] || 'sano';
    const isSelected = activeTooth === num;
    
    return (
      <div key={num} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', position: 'relative' }}>
        <button
          type="button"
          disabled={readOnly}
          onClick={() => setActiveTooth(isSelected ? null : num)}
          style={{
            width: '40px',
            height: '50px',
            backgroundColor: STATUS_COLORS[status],
            border: isSelected ? '2px solid var(--text-main)' : '2px solid var(--border)',
            borderRadius: '4px 4px 12px 12px', // Vaguely tooth shaped
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: readOnly ? 'default' : 'pointer',
            position: 'relative',
            transition: 'all 0.2s ease',
            opacity: status === 'ausente' ? 0.4 : 1,
            boxShadow: isSelected ? '0 0 0 4px rgba(13, 110, 253, 0.2)' : 'none'
          }}
        >
          {status === 'ausente' && <X size={32} color="#111" style={{ position: 'absolute' }} />}
          {status === 'caries' && <div style={{ width: '12px', height: '12px', backgroundColor: '#7f1d1d', borderRadius: '50%', position: 'absolute', top: '10px' }} />}
          {status === 'endodoncia' && <div style={{ width: '4px', height: '24px', backgroundColor: '#fff', position: 'absolute' }} />}
        </button>
        <span style={{ marginTop: '0.5rem', fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
          {num}
        </span>

        {/* Popover Menu for Status Selection */}
        {isSelected && (
          <div style={{
            position: 'absolute',
            top: '60px',
            zIndex: 100,
            backgroundColor: 'white',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
            padding: '0.5rem',
            width: '180px',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.25rem'
          }}>
            {(Object.keys(STATUS_LABELS) as ToothStatus[]).map((statusOption) => (
              <button
                key={statusOption}
                type="button"
                onClick={(e) => { e.stopPropagation(); handleStatusChange(statusOption); }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '0.5rem',
                  border: 'none',
                  background: status === statusOption ? '#f1f5f9' : 'transparent',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  fontSize: '0.85rem'
                }}
              >
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: STATUS_COLORS[statusOption] }} />
                {STATUS_LABELS[statusOption]}
                {status === statusOption && <Check size={14} style={{ marginLeft: 'auto' }} />}
              </button>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div style={{ width: '100%', overflowX: 'auto', padding: '1rem 0' }}>
      
      {/* Upper Jaw */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem', marginBottom: '3rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {UPPER_RIGHT.map(renderTooth)}
        </div>
        <div style={{ width: '2px', backgroundColor: 'var(--border)' }}></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {UPPER_LEFT.map(renderTooth)}
        </div>
      </div>

      {/* Lower Jaw */}
      <div style={{ display: 'flex', justifyContent: 'center', gap: '2rem' }}>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {LOWER_RIGHT.map(renderTooth)}
        </div>
        <div style={{ width: '2px', backgroundColor: 'var(--border)' }}></div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          {LOWER_LEFT.map(renderTooth)}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginTop: '4rem', padding: '1rem', backgroundColor: '#f8fafc', borderRadius: 'var(--radius-lg)' }}>
        {(Object.keys(STATUS_LABELS) as ToothStatus[]).map((statusOption) => (
          <div key={statusOption} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            <div style={{ width: '16px', height: '16px', borderRadius: '4px', backgroundColor: STATUS_COLORS[statusOption], border: '1px solid rgba(0,0,0,0.1)' }} />
            {STATUS_LABELS[statusOption]}
          </div>
        ))}
      </div>
      
    </div>
  );
}
