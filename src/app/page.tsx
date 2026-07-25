import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span>🦷</span>
          OdontoClub
        </div>
        
        <nav className={styles.nav}>
          <Link href="/" className={`${styles.navItem} ${styles.navItemActive}`}>Dashboard</Link>
          <Link href="/pacientes" className={styles.navItem}>Pacientes</Link>
          <Link href="/citas" className={styles.navItem}>Citas</Link>
          <Link href="/configuracion" className={styles.navItem}>WhatsApp Config</Link>
        </nav>
      </aside>

      {/* Main Content */}
      <main className={styles.mainContent}>
        <header className={styles.header}>
          <h1 className={`${styles.title} fade-in`}>Bienvenido, Dr. Admin</h1>
          <Link href="/citas?new=true">
            <button className="btn btn-primary">
              + Nueva Cita
            </button>
          </Link>
        </header>

        {/* Stats */}
        <div className={styles.statsGrid}>
          <div className={`${styles.statCard} card fade-in`} style={{ animationDelay: '100ms' }}>
            <div className={styles.statLabel}>Pacientes Totales</div>
            <div className={styles.statValue}>1,248</div>
          </div>
          <div className={`${styles.statCard} card fade-in`} style={{ animationDelay: '200ms' }}>
            <div className={styles.statLabel}>Citas Hoy</div>
            <div className={styles.statValue}>8</div>
          </div>
          <div className={`${styles.statCard} card fade-in`} style={{ animationDelay: '300ms' }}>
            <div className={styles.statLabel}>Recordatorios Enviados</div>
            <div className={styles.statValue}>24</div>
          </div>
        </div>

        {/* Citas del dia */}
        <div className={`${styles.actionSection} fade-in`} style={{ animationDelay: '400ms' }}>
          <h2 style={{ fontSize: '1.25rem', color: 'var(--text-main)' }}>Próximas Citas</h2>
          <div className="card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <p style={{ color: 'var(--text-muted)' }}>Aquí se mostrará la tabla de citas con botones para enviar recordatorios por WhatsApp.</p>
              <p style={{ marginTop: '1rem', fontWeight: 500, color: 'var(--text-main)' }}>10:00 AM - Juan Pérez (Limpieza)</p>
            </div>
            <button className="btn" style={{ backgroundColor: '#e2e8f0', color: 'var(--text-main)' }}>Enviar WhatsApp</button>
          </div>
        </div>
      </main>
    </div>
  );
}
