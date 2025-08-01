import { getDbConnection } from './database';

export async function migrateDatabase() {
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