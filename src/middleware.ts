import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Rutas públicas que NO requieren inicio de sesión
  const publicPaths = ['/login', '/api/auth/login', '/api/auth/logout'];
  
  // Archivos estáticos o internos de Next.js
  if (pathname.startsWith('/_next') || pathname.includes('.')) {
    return NextResponse.next();
  }

  // Permitir acceso directo a webhooks o APIs públicas (para Meta/WhatsApp)
  if (publicPaths.includes(pathname) || pathname.startsWith('/api/whatsapp')) {
    return NextResponse.next();
  }

  // Verificar si existe la cookie de seguridad
  const authCookie = request.cookies.get('odontoclub_auth');

  // Si no hay cookie o es incorrecta, expulsar al login
  if (!authCookie || authCookie.value !== 'authenticated-admin-token') {
    const loginUrl = request.nextUrl.clone();
    loginUrl.pathname = '/login';
    return NextResponse.redirect(loginUrl);
  }

  // Si está autenticado, permitir el paso
  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
};