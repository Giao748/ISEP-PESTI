import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection, initializeDatabase } from '../../../lib/database';

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    const connection = getDbConnection();
    
    // Test basic connection
    const [result] = await connection.execute('SELECT 1 as test');
    
    // Initialize database tables and run migration
    await initializeDatabase();
    
    // Check table structure
    const [usersColumns] = await connection.execute('DESCRIBE users');
    const [auditColumns] = await connection.execute('DESCRIBE user_audit_log');
    
    return NextResponse.json({
      message: 'MySQL database connection successful!',
      test: result,
      tables: 'Database tables initialized successfully',
      migration: 'Migration completed successfully',
      usersTableColumns: usersColumns,
      auditTableColumns: auditColumns
    });
  } catch (error: any) {
    console.error('Database test error:', error);
    return NextResponse.json({
      error: 'Database connection failed',
      details: error.message
    }, { status: 500 });
  }
} 