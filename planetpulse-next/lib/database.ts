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

// Initialize database tables
export async function initializeDatabase() {
  const connection = getDbConnection();
  
  try {
    // Create users table with GDPR compliance fields
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        email VARCHAR(255) NOT NULL UNIQUE,
        password_hash VARCHAR(255) NOT NULL,
        role ENUM('Admin', 'Validator', 'Member', 'Partner') DEFAULT 'Member',
        name VARCHAR(255) NOT NULL,
        nationality VARCHAR(100) NOT NULL,
        consent_given BOOLEAN DEFAULT FALSE,
        data_processing_consent BOOLEAN DEFAULT FALSE,
        marketing_consent BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        data_retention_until DATE NULL,
        is_active BOOLEAN DEFAULT TRUE,
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
        action VARCHAR(100) NOT NULL,
        details TEXT,
        ip_address VARCHAR(45),
        user_agent TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_user_id (user_id),
        INDEX idx_action (action),
        INDEX idx_created_at (created_at)
      )
    `);

    console.log('Database tables initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
    throw error;
  }
}

// Helper function to log user actions for GDPR compliance
export async function logUserAction(
  userId: number | null,
  action: string,
  details: string,
  ipAddress?: string,
  userAgent?: string
) {
  const connection = getDbConnection();
  
  try {
    await connection.execute(
      `INSERT INTO user_audit_log (user_id, action, details, ip_address, user_agent) 
       VALUES (?, ?, ?, ?, ?)`,
      [userId, action, details, ipAddress || null, userAgent || null]
    );
  } catch (error) {
    console.error('Error logging user action:', error);
  }
}

export default getDbConnection;