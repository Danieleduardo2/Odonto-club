import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema Odontológico | Gestión Integral",
  description: "Sistema de gestión de pacientes y citas odontológicas con recordatorios automáticos por WhatsApp.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Toaster 
          position="top-right"
          toastOptions={{
            style: {
              background: '#ffffff',
              color: '#1e293b',
              boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
              border: '1px solid rgba(0,0,0,0.04)',
              borderRadius: '10px',
            },
            success: {
              iconTheme: {
                primary: '#0d6efd',
                secondary: '#ffffff',
              },
            },
          }}
        />
        <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: 'var(--bg-page)' }}>
          <Sidebar />
          <div style={{ flex: 1, padding: '2rem 3rem', overflowY: 'auto' }}>
            {children}
          </div>
        </div>
      </body>
    </html>
  );
}
