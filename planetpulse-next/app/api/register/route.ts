import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getDbConnection, initializeDatabase, logUserAction } from '../../../lib/database';

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

    // Check if user already exists
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

    // Hash password
    const saltRounds = parseInt(process.env.BCRYPT_ROUNDS || '12');
    const passwordHash = await bcrypt.hash(password, saltRounds);

    // Calculate data retention date (GDPR compliance)
    const retentionDays = parseInt(process.env.DATA_RETENTION_DAYS || '2555'); // 7 years default
    const retentionDate = new Date();
    retentionDate.setDate(retentionDate.getDate() + retentionDays);

    // Insert new user
    const [result] = await connection.execute(
      `INSERT INTO users (
        email, password_hash, name, nationality, role,
        consent_given, data_processing_consent, marketing_consent,
        data_retention_until
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        email,
        passwordHash,
        name,
        nationality,
        role,
        true,
        consent.data_processing || false,
        consent.marketing || false,
        retentionDate.toISOString().split('T')[0]
      ]
    );

    const insertResult = result as any;
    const userId = insertResult.insertId;

    // Log registration action for GDPR compliance
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logUserAction(
      userId,
      'USER_REGISTRATION',
      `User registered with role: ${role}, consents: ${JSON.stringify(consent)}`,
      clientIp,
      userAgent
    );

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        userId: userId,
        gdprCompliant: true
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Registration error:', error);
    
    // Log failed registration attempt
    const clientIp = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    const userAgent = request.headers.get('user-agent') || 'unknown';
    
    await logUserAction(
      null,
      'REGISTRATION_FAILED',
      `Registration failed: ${error instanceof Error ? error.message : 'Unknown error'}`,
      clientIp,
      userAgent
    );

    return NextResponse.json(
      { error: 'Internal server error during registration' },
      { status: 500 }
    );
  }
}