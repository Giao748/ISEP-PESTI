import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/firabase';
import { getDbConnection, logUserAction } from '../../../lib/database';
import { signInWithEmailAndPassword } from 'firebase/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Sign in with Firebase Auth
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    const connection = getDbConnection();

    // Get user data from MySQL with actual schema
    const [users] = await connection.execute(
      `SELECT id, firebase_uid, username, email, role, password
        FROM users WHERE email = ?`,
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      // Log failed login attempt
      const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      await logUserAction(
        null,
        user.uid,
        'LOGIN_FAILED',
        `Failed login attempt for email: ${email} - User not found in database`,
        clientIp,
        userAgent
      );

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const userData = users[0] as any;

    // Verify Firebase UID matches
    if (userData.firebase_uid !== user.uid) {
      // Log failed login attempt
      const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      await logUserAction(
        userData.id,
        user.uid,
        'LOGIN_FAILED',
        'Failed login attempt - Firebase UID mismatch',
        clientIp,
        userAgent
      );

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Log successful login
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logUserAction(
      userData.id,
      user.uid,
      'LOGIN_SUCCESS',
      'Successful login',
      clientIp,
      userAgent
    );

    // Return user info and token (excluding sensitive data)
    return NextResponse.json(
      {
        message: 'Login successful',
        user: {
          id: userData.id,
          firebaseUid: userData.firebase_uid,
          username: userData.username,
          email: userData.email,
          role: userData.role
        },
        token: await user.getIdToken() // Firebase JWT token
      },
      { status: 200 }
    );

  } catch (error: any) {
    console.error('Login error:', error);
    
    // Handle Firebase Auth errors
    if (error.code === 'auth/user-not-found') {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (error.code === 'auth/wrong-password') {
      return NextResponse.json(
        { error: 'Invalid password' },
        { status: 401 }
      );
    }
    
    if (error.code === 'auth/too-many-requests') {
      return NextResponse.json(
        { error: 'Too many failed attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // Log failed login attempt
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logUserAction(
      null,
      null,
      'LOGIN_ERROR',
      `System error during login: ${error.message || 'Unknown error'}`,
      clientIp,
      userAgent
    );

    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}