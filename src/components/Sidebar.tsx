"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, LayoutDashboard, Users, CalendarDays, Settings } from "lucide-react";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoIcon}>
          <Image src="/logo.png" alt="OdontoClub Logo" width={64} height={64} style={{ objectFit: 'contain' }} />
        </div>
        <div className={styles.logoText}>
          ODONTOCL<span style={{ color: '#e74c3c', display: 'inline', fontSize: 'inherit', fontWeight: 'inherit' }}>U</span>B
          <span>La sonrisa que todos queremos</span>
        </div>
      </div>
      
      <nav className={styles.nav}>
        <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
          <span className={styles.icon}><LayoutDashboard size={20} /></span>
          <span className={styles.text}>Dashboard</span>
        </Link>
        <Link href="/pacientes" className={`${styles.navItem} ${pathname === '/pacientes' ? styles.active : ''}`}>
          <span className={styles.icon}><Users size={20} /></span>
          <span className={styles.text}>Pacientes</span>
        </Link>
        <Link href="/citas" className={`${styles.navItem} ${pathname === '/citas' ? styles.active : ''}`}>
          <span className={styles.icon}><CalendarDays size={20} /></span>
          <span className={styles.text}>Citas</span>
        </Link>
        <Link href="/configuracion" className={`${styles.navItem} ${pathname === '/configuracion' ? styles.active : ''}`}>
          <span className={styles.icon}><Settings size={20} /></span>
          <span className={styles.text}>WhatsApp Config</span>
        </Link>
      </nav>
    </aside>
  );
}
