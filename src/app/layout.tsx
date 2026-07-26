import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { Toaster } from "react-hot-toast";
import Sidebar from "@/components/Sidebar";
import TopBar from "@/components/TopBar";

const poppins = Poppins({ subsets: ["latin"], weight: ["300", "400", "500", "600", "700"] });

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
      <body className={poppins.className}>
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
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', height: '100vh', overflow: 'hidden' }}>
            <TopBar />
            <div style={{ flex: 1, padding: '1.25rem 3rem', overflowY: 'auto' }}>
              {children}
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
