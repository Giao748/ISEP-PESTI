#!/usr/bin/env node

/**
 * Database Setup Script for PlanetPulse
 * 
 * This script sets up the MariaDB database with proper tables
 * and GDPR-compliant schema for user management.
 */

const mysql = require('mysql2/promise');
require('dotenv').config({ path: '.env.local' });

async function setupDatabase() {
  const config = {
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || 'Setamurcha12!',
    port: parseInt(process.env.DB_PORT || '3306'),
  };

  const dbName = process.env.DB_NAME || 'PlanetPulse';

  try {
    console.log('Connecting to MariaDB...');
    
    // Connect without selecting a database first
    const connection = await mysql.createConnection(config);
    
    console.log('✅ Connected to MariaDB successfully');
    
    // Create database if it doesn't exist
    console.log(`📊 Creating database '${dbName}' if it doesn't exist...`);
    await connection.execute(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    
    // Use the database
    await connection.execute(`USE \`${dbName}\``);
    
    console.log('  Creating tables...');
    
    // Create users table with GDPR compliance
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
      ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    
    // Create audit log table for GDPR compliance
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
      ) ENGINE=InnoDB CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci
    `);
    
    console.log(' Tables created successfully');
    
    // Show table status
    const [tables] = await connection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS, CREATE_TIME 
      FROM information_schema.TABLES 
      WHERE TABLE_SCHEMA = ? 
      ORDER BY TABLE_NAME
    `, [dbName]);
    
    console.log('\nDatabase tables:');
    console.table(tables);
    
    await connection.end();

    console.log('Database setup completed successfully!');
    console.log('\nNext steps:');
    console.log('1. Start your application: npm run dev');
    console.log('2. Test database connection: GET /api/db-test');
    console.log('3. Test user registration: POST /api/register');
    
  } catch (error) {
    console.error(' Database setup failed:', error.message);
    console.error('\n Troubleshooting:');
    console.error('1. Make sure MariaDB/MySQL is running');
    console.error('2. Check your .env.local file for correct database credentials');
    console.error('3. Ensure the database user has CREATE privileges');
    process.exit(1);
  }
}

// Run the setup
setupDatabase().catch(console.error);