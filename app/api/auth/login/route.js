import { NextResponse } from 'next/server';
import { findUser } from '../../../../lib/users';

export async function POST(request) {
  try {
    const { email, password } = await request.json();
    
    console.log('Login attempt:', { email }); // Do debugowania
    
    const user = findUser(email, password);
    
    if (user) {
      const { password: _, ...userWithoutPassword } = user;
      return NextResponse.json({ 
        success: true, 
        user: userWithoutPassword 
      });
    } else {
      return NextResponse.json(
        { success: false, message: 'Nieprawidłowe dane logowania' }, 
        { status: 401 }
      );
    }
  } catch (error) {
    console.error('API Error:', error);
    return NextResponse.json(
      { success: false, message: 'Błąd serwera' }, 
      { status: 500 }
    );
  }
}