"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";

interface TagSelectorProps {
  label: string;
  predefinedOptions: string[];
  selectedTags: string[];
  onChange: (tags: string[]) => void;
  placeholder?: string;
  important?: boolean;
}

export default function TagSelector({ label, predefinedOptions, selectedTags, onChange, placeholder, important }: TagSelectorProps) {
  const [customInput, setCustomInput] = useState("");

  const handleToggleTag = (tag: string) => {
    if (selectedTags.includes(tag)) {
      onChange(selectedTags.filter(t => t !== tag));
    } else {
      onChange([...selectedTags, tag]);
    }
  };

  const handleAddCustom = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = customInput.trim();
    if (trimmed && !selectedTags.includes(trimmed)) {
      onChange([...selectedTags, trimmed]);
    }
    setCustomInput("");
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
      <label style={{ fontWeight: 500, color: important ? '#dc2626' : 'var(--text-main)' }}>
        {label}
      </label>

      {/* Predefined Options as Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {predefinedOptions.map(option => {
          const isSelected = selectedTags.includes(option);
          return (
            <button
              key={option}
              type="button"
              onClick={() => handleToggleTag(option)}
              style={{
                padding: '0.4rem 0.75rem',
                borderRadius: '999px',
                border: isSelected ? '1px solid var(--primary)' : '1px solid var(--border)',
                backgroundColor: isSelected ? '#eff5ff' : 'white',
                color: isSelected ? 'var(--primary)' : 'var(--text-main)',
                fontSize: '0.85rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontWeight: isSelected ? 500 : 400
              }}
            >
              {option}
            </button>
          );
        })}
      </div>

      {/* Custom Input */}
      <div style={{ display: 'flex', gap: '0.5rem' }}>
        <input
          type="text"
          value={customInput}
          onChange={(e) => setCustomInput(e.target.value)}
          placeholder={placeholder || "Agregar otra etiqueta..."}
          onKeyDown={(e) => { if (e.key === 'Enter') handleAddCustom(e); }}
          style={{ flex: 1, padding: '0.6rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border)' }}
        />
        <button 
          type="button" 
          onClick={handleAddCustom}
          style={{ padding: '0 1rem', background: 'var(--bg-page)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', cursor: 'pointer', display: 'flex', alignItems: 'center' }}
        >
          <Plus size={18} color="var(--text-muted)" />
        </button>
      </div>

      {/* Selected Custom Tags (if they are not in the predefined list) */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {selectedTags
          .filter(tag => !predefinedOptions.includes(tag))
          .map(tag => (
            <div
              key={tag}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
                padding: '0.4rem 0.75rem',
                borderRadius: '999px',
                border: '1px solid var(--primary)',
                backgroundColor: '#eff5ff',
                color: 'var(--primary)',
                fontSize: '0.85rem',
                fontWeight: 500
              }}
            >
              {tag}
              <button 
                type="button" 
                onClick={() => handleToggleTag(tag)}
                style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', display: 'flex', padding: 0 }}
              >
                <X size={14} />
              </button>
            </div>
        ))}
      </div>
    </div>
  );
}
