import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <header className={styles.header}>
          <h2 className={`${styles.title} fade-in`} style={{ fontSize: '1.5rem', margin: 0 }}>Bienvenido, Dr. Admin</h2>
          <Link href="/citas?new=true">
            <button className="btn btn-soft">
              + Nueva Cita
            </button>
          </Link>
        </header>

        {/* Citas del dia */}
        <div className={`${styles.actionSection} fade-in`} style={{ animationDelay: '400ms' }}>
          <h3 style={{ fontSize: '1.1rem', color: 'var(--text-main)', marginBottom: '1rem', fontWeight: 600 }}>Próximas Citas</h3>
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
