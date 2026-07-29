"use client";
import { Bell, LogOut, User } from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";

export default function TopBar() {
  const pathname = usePathname();
  const router = useRouter();
  
  // Simple breadcrumb logic
  const pathMap: Record<string, string> = {
    '/': 'Dashboard > Overview',
    '/pacientes': 'Dashboard > Patients > Management',
    '/agenda': 'Dashboard > Appointments > Management',
    '/configuracion': 'Dashboard > Settings > WhatsApp',
  };

  const breadcrumb = pathMap[pathname] || 'Dashboard';

  const handleLogout = async () => {
    try {
      const res = await fetch('/api/auth/logout', { method: 'POST' });
      if (res.ok) {
        toast.success("Sesión cerrada");
        router.push('/login');
        router.refresh();
      }
    } catch (err) {
      toast.error("Error al cerrar sesión");
    }
  };

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
          marginRight: '0.5rem',
          cursor: 'pointer'
        }}>
          <User size={18} color="#64748b" />
        </div>
        <button 
          onClick={handleLogout}
          style={{ 
            display: 'flex', 
            alignItems: 'center', 
            gap: '0.5rem', 
            background: 'none', 
            border: 'none', 
            color: '#ef4444', 
            cursor: 'pointer',
            fontWeight: 500,
            fontSize: '0.85rem'
          }}
          title="Cerrar sesión"
        >
          <LogOut size={18} />
          Salir
        </button>
      </div>
    </header>
  );
}