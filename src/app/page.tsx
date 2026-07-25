import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <div className={styles.dashboardContainer}>
      {/* Sidebar */}
      <aside className={styles.sidebar}>
        <div className={styles.logo}>
          <span style={{ fontSize: '1.5rem' }}>🦷</span>
          DentalSync
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
        <div className={`${styles.statsGrid} slide-up`}>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Pacientes Totales</span>
            <span className={styles.statValue}>1,248</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Citas Hoy</span>
            <span className={styles.statValue}>8</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statLabel}>Recordatorios Enviados</span>
            <span className={styles.statValue}>24</span>
          </div>
        </div>

        {/* Quick Action Area */}
        <div className={`${styles.actionSection} fade-in`} style={{ animationDelay: '200ms' }}>
          <h2 className={styles.actionTitle}>Próximas Citas</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>
            Aquí se mostrará la tabla de citas con botones para enviar recordatorios por WhatsApp.
          </p>
          <div className="glass-panel" style={{ padding: '1rem', borderRadius: 'var(--radius-md)' }}>
            <p><strong>10:00 AM</strong> - Juan Pérez (Limpieza) <button className="btn btn-secondary" style={{ float: 'right', padding: '0.25rem 0.75rem', fontSize: '0.8rem' }}>Enviar WhatsApp</button></p>
          </div>
        </div>
      </main>
    </div>
  );
}
