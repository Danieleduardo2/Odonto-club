"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();
  
  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <span className={styles.logoIcon}>🦷</span>
        <span className={styles.logoText}>OdontoClub</span>
      </div>
      
      <nav className={styles.nav}>
        <Link href="/" className={`${styles.navItem} ${pathname === '/' ? styles.active : ''}`}>
          <span className={styles.icon}>📊</span>
          <span className={styles.text}>Dashboard</span>
        </Link>
        <Link href="/pacientes" className={`${styles.navItem} ${pathname === '/pacientes' ? styles.active : ''}`}>
          <span className={styles.icon}>👥</span>
          <span className={styles.text}>Pacientes</span>
        </Link>
        <Link href="/citas" className={`${styles.navItem} ${pathname === '/citas' ? styles.active : ''}`}>
          <span className={styles.icon}>📅</span>
          <span className={styles.text}>Citas</span>
        </Link>
      </nav>
    </aside>
  );
}
