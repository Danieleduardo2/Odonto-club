"use client";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Stethoscope, LayoutDashboard, Users, CalendarDays, Settings, Calendar } from "lucide-react";
import styles from "./Sidebar.module.css";

export default function Sidebar() {
  const pathname = usePathname();
  
  const navItems = [
    { name: "Dashboard", href: "/", icon: LayoutDashboard },
    { name: "Pacientes", href: "/pacientes", icon: Users },
    { name: "Citas", href: "/citas", icon: CalendarDays },
    { name: "WhatsApp Config", href: "/configuracion", icon: Settings },
  ];

  return (
    <aside className={styles.sidebar}>
      <div className={styles.logoContainer}>
        <div className={styles.logoText}>
          ODONTOCL<span style={{ color: '#e74c3c', display: 'inline', fontSize: 'inherit', fontWeight: 'inherit' }}>U</span>B
          <span>La sonrisa que todos queremos</span>
        </div>
      </div>
      
      <nav className={styles.nav}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link href={item.href} key={item.name} className={`${styles.navItem} ${isActive ? styles.active : ""}`}>
              <span className={styles.icon}><item.icon size={20} /></span>
              <span className={styles.text}>{item.name}</span>
            </Link>
          );
        })}
        <Link href="/agenda" className={`${styles.navItem} ${pathname.startsWith('/agenda') ? styles.active : ''}`}>
          <span className={styles.icon}><Calendar size={20} /></span>
          <span className={styles.text}>Agenda</span>
        </Link>
      </nav>

      <div className={styles.bottomLogoContainer} style={{ marginTop: 'auto' }}>
        <div className={styles.logoIconBottom}>
          <Image src="/logo.png" alt="OdontoClub Logo" width={104} height={104} style={{ objectFit: 'contain' }} />
        </div>
      </div>
    </aside>
  );
}
