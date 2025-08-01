import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'PlanetPulse',
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  acquireTimeout: 60000,
  timeout: 60000,
};

// Create connection pool
let pool: mysql.Pool | null = null;

export function getDbConnection(): mysql.Pool {
  if (!pool) {
    pool = mysql.createPool(dbConfig);
  }
  return pool;
}

// Migration function to add firebase_uid column
async function migrateDatabase() {
  const connection = getDbConnection();
  
  try {
    console.log('Starting database migration...');
    
    // Check if firebase_uid column exists in users table
    const [columns] = await connection.execute(
      "SHOW COLUMNS FROM users LIKE 'firebase_uid'"
    );
    
    if (Array.isArray(columns) && columns.length === 0) {
      console.log('Adding firebase_uid column to users table...');
      await connection.execute(
        'ALTER TABLE users ADD COLUMN firebase_uid VARCHAR(128) UNIQUE AFTER id'
      );
      console.log('firebase_uid column added to users table');
    } else {
      console.log('firebase_uid column already exists in users table');
    }
    
    // Check if firebase_uid column exists in user_audit_log table
    const [auditColumns] = await connection.execute(
      "SHOW COLUMNS FROM user_audit_log LIKE 'firebase_uid'"
    );
    
    if (Array.isArray(auditColumns) && auditColumns.length === 0) {
      console.log('Adding firebase_uid column to user_audit_log table...');
      await connection.execute(
        'ALTER TABLE user_audit_log ADD COLUMN firebase_uid VARCHAR(128) AFTER user_id'
      );
      console.log('firebase_uid column added to user_audit_log table');
    } else {
      console.log('firebase_uid column already exists in user_audit_log table');
    }
    
    console.log('Database migration completed successfully!');
  } catch (error) {
    console.error('Migration error:', error);
    throw error;
  }
}

// Initialize database tables
export async function initializeDatabase() {
  const connection = getDbConnection();
  
  try {
    // Create users table with actual schema
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        firebase_uid VARCHAR(128) UNIQUE,
        username VARCHAR(255) NOT NULL,
        email VARCHAR(255) NOT NULL UNIQUE,
        role ENUM('Admin', 'Validator', 'Member', 'Partner') DEFAULT 'Member',
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_firebase_uid (firebase_uid),
        INDEX idx_email (email),
        INDEX idx_role (role),
        INDEX idx_created_at (created_at)
      )
    `);

    // Create user_audit_log for GDPR compliance
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_audit_log (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT,
        firebase_uid VARCHAR(128),
        action VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_firebase_uid (firebase_uid),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      )
    `);

    console.log('Database tables initialized successfully');
    
    // Run migration to add firebase_uid column if needed
    await migrateDatabase();
    
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Helper function to log user actions for GDPR compliance
export async function logUserAction(
  userId: number | null,
  firebaseUid: string | null,
  action: string,
  details: string,
  ipAddress?: string,
  userAgent?: string
) {
  const connection = getDbConnection();
  
  try {
    await connection.execute(
      `INSERT INTO user_audit_log (user_id, firebase_uid, action, details, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, firebaseUid, action, details, ipAddress || null, userAgent || null]
    );
  } catch (error) {
    console.error('Error logging user action:', error);
  }
}

export default getDbConnection; 