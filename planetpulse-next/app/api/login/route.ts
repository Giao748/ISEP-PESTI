import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { getDbConnection, logUserAction } from '../../../lib/database';

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

    const connection = getDbConnection();

    // Find user by email
    const [users] = await connection.execute(
      `SELECT id, email, password_hash, name, role, is_active, 
              consent_given, data_processing_consent 
       FROM users WHERE email = ? AND is_active = TRUE`,
      [email]
    );

    if (!Array.isArray(users) || users.length === 0) {
      // Log failed login attempt
      const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      await logUserAction(
        null,
        'LOGIN_FAILED',
        `Failed login attempt for email: ${email} - User not found`,
        clientIp,
        userAgent
      );

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const user = users[0] as any;

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password_hash);
    
    if (!isValidPassword) {
      // Log failed login attempt
      const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
      const userAgent = request.headers.get('user-agent') || 'unknown';
      
      await logUserAction(
        user.id,
        'LOGIN_FAILED',
        'Failed login attempt - Invalid password',
        clientIp,
        userAgent
      );

      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if user has given data processing consent (GDPR)
    if (!user.data_processing_consent) {
      return NextResponse.json(
        { error: 'Data processing consent required. Please contact support.' },
        { status: 403 }
      );
    }

    // Update last login timestamp
    await connection.execute(
      'UPDATE users SET last_login = CURRENT_TIMESTAMP WHERE id = ?',
      [user.id]
    );

    // Generate JWT token
    const jwtSecret = process.env.JWT_SECRET || 'fallback-secret-key';
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        name: user.name
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    // Log successful login
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logUserAction(
      user.id,
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
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        },
        token
      },
      { status: 200 }
    );

  } catch (error) {
    console.error('Login error:', error);
    
    // Log system error
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logUserAction(
      null,
      'LOGIN_ERROR',
      `System error during login: ${error instanceof Error ? error.message : 'Unknown error'}`,
      clientIp,
      userAgent
    );

    return NextResponse.json(
      { error: 'Internal server error during login' },
      { status: 500 }
    );
  }
}