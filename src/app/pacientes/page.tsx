import styles from "../page.module.css";
import { supabase } from "@/lib/supabase";

// Server Component
export default async function Pacientes() {
  const { data: pacientes } = await supabase.from('patients').select('*').order('created_at', { ascending: false });

  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span style={{ fontSize: '1.5rem' }}>🦷</span>
          OdontoClub
        </div>
        
        <nav className={styles.nav}>
          <a href="/" className={styles.navItem}>Dashboard</a>
          <a href="/pacientes" className={`${styles.navItem} ${styles.navItemActive}`}>Pacientes</a>
          <a href="/citas" className={styles.navItem}>Citas</a>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={`${styles.title} fade-in`}>Directorio de Pacientes</h1>
          <button className="btn btn-primary">
            + Nuevo Paciente
          </button>
        </header>

        <div className={`${styles.actionSection} fade-in`} style={{ animationDelay: '200ms' }}>
          <div className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border)' }}>
                  <th style={{ padding: '1rem' }}>Nombre</th>
                  <th style={{ padding: '1rem' }}>Teléfono</th>
                  <th style={{ padding: '1rem' }}>Email</th>
                </tr>
              </thead>
              <tbody>
                {pacientes && pacientes.length > 0 ? (
                  pacientes.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid var(--border)' }}>
                      <td style={{ padding: '1rem' }}>{p.first_name} {p.last_name}</td>
                      <td style={{ padding: '1rem' }}>{p.phone_number}</td>
                      <td style={{ padding: '1rem' }}>{p.email}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={3} style={{ padding: '1rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                      No hay pacientes registrados aún. (Asegúrate de configurar Supabase)
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
