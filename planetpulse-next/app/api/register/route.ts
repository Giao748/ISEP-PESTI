import { NextRequest, NextResponse } from 'next/server';
import { auth } from '../../../lib/firabase';
import { getDbConnection, initializeDatabase, logUserAction } from '../../../lib/database';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export async function POST(request: NextRequest) {
  try {
    // Initialize database tables if not exists
    await initializeDatabase();
    
    const { name, email, password, nationality, role = 'Member', consent } = await request.json();
    
    // Validate required fields
    if (!name || !email || !password || !nationality) {
      return NextResponse.json(
        { error: 'All fields (name, email, password, nationality) are required' },
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

    // Validate password strength
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters long' },
        { status: 400 }
      );
    }

    // GDPR: Ensure consent is given
    if (!consent?.data_processing) {
      return NextResponse.json(
        { error: 'Data processing consent is required for registration' },
        { status: 400 }
      );
    }

    // Validate role
    const validRoles = ['Admin', 'Validator', 'Member', 'Partner'];
    if (!validRoles.includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    const connection = getDbConnection();

    // Check if user already exists in MySQL
    const [existingUsers] = await connection.execute(
      'SELECT id FROM users WHERE email = ?',
      [email]
    );

    if (Array.isArray(existingUsers) && existingUsers.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }

    // Create user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Insert new user in MySQL with actual schema
    const [result] = await connection.execute(
      `INSERT INTO users (
        firebase_uid, username, email, role, password
      ) VALUES (?, ?, ?, ?, ?)`,
      [
        user.uid,
        name, // Using name as username
        email,
        role,
        password // Storing password in MySQL as well (Firebase handles the secure version)
      ]
    );

    const insertResult = result as any;
    const userId = insertResult.insertId;

    // Log registration action for GDPR compliance
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logUserAction(
      userId,
      user.uid,
      'USER_REGISTRATION',
      `User registered with role: ${role}, consents: ${JSON.stringify(consent)}`,
      clientIp,
      userAgent
    );

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        userId: userId,
        firebaseUid: user.uid,
        gdprCompliant: true
      },
      { status: 201 }
    );

  } catch (error: any) {
    console.error('Registration error:', error);
    
    // Handle Firebase Auth errors
    if (error.code === 'auth/email-already-in-use') {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 409 }
      );
    }
    
    if (error.code === 'auth/weak-password') {
      return NextResponse.json(
        { error: 'Password is too weak. Please choose a stronger password.' },
        { status: 400 }
      );
    }
    
    if (error.code === 'auth/invalid-email') {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Log failed registration attempt
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logUserAction(
      null,
      null,
      'REGISTRATION_FAILED',
      `Registration failed: ${error.message || 'Unknown error'}`,
      clientIp,
      userAgent
    );

    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}