import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection, initializeDatabase } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    // Initialize database tables
    await initializeDatabase();
    
    const connection = getDbConnection();
    
    // Test connection by running a simple query
    const [result] = await connection.execute('SELECT 1 as test');
    
    // Get table info
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('users', 'user_audit_log')
    `, [process.env.DB_NAME || 'PlanetPulse']);

    return NextResponse.json({
      status: 'success',
      message: 'Database connection successful',
      connection_test: result,
      tables: tables,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Database connection test failed:', error);
    
    return NextResponse.json({
      status: 'error',
      message: 'Database connection failed',
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}