import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className={styles.header}>
          <h1 className={`${styles.title} fade-in`}>Bienvenido, Dr. Admin</h1>
          <Link href="/citas?new=true">
            <button className="btn btn-soft">
              + Nueva Cita
            </button>
          </Link>
        </header>

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
    </>
  );
}
