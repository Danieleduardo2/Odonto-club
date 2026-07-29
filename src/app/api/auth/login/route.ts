import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { username, password } = body;

    if (username === 'admin123' && password === 'contraseña123') {
      const response = NextResponse.json({ success: true });
      
      // Set a simple secure cookie to identify the user
      response.cookies.set({
        name: 'odontoclub_auth',
        value: 'authenticated-admin-token',
        httpOnly: true,
        path: '/',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7 // 1 week
      });
      
      return response;
    }

    return NextResponse.json(
      { error: 'Credenciales incorrectas' },
      { status: 401 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}