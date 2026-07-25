"use client";
import { Bell, User, LayoutGrid, MoreHorizontal } from "lucide-react";
import { usePathname } from "next/navigation";

export default function TopBar() {
  const pathname = usePathname();
  
  // Simple breadcrumb logic
  const pathMap: Record<string, string> = {
    '/': 'Dashboard > Overview',
    '/pacientes': 'Dashboard > Patients > Management',
    '/citas': 'Dashboard > Appointments > Management',
    '/configuracion': 'Dashboard > Settings > WhatsApp',
  };

  const breadcrumb = pathMap[pathname] || 'Dashboard';

  return (
    <header style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: '64px',
      backgroundColor: 'white',
      padding: '0 2rem',
      borderBottom: '1px solid rgba(0,0,0,0.05)',
      position: 'sticky',
      top: 0,
      zIndex: 40
    }}>
      <div style={{ color: '#64748b', fontSize: '0.875rem', fontWeight: 500 }}>
        {breadcrumb}
      </div>
      
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.25rem', color: '#64748b' }}>
        <LayoutGrid size={20} style={{ cursor: 'pointer' }} />
        <Bell size={20} style={{ cursor: 'pointer' }} />
        <div style={{
          width: '32px',
          height: '32px',
          borderRadius: '50%',
          backgroundColor: '#e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          marginLeft: '0.5rem',
          cursor: 'pointer'
        }}>
          <User size={18} color="#64748b" />
        </div>
      </div>
    </header>
  );
}
