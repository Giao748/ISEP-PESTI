import { createPool, Pool, RowDataPacket, ResultSetHeader } from "mysql2/promise";
import crypto from "crypto";

// Database connection pool
let pool: Pool | null = null;

// Initialize database connection
export function getDbConnection(): Pool {
  if (!pool) {
    pool = createPool({
      host: process.env.DB_HOST || "localhost",
      user: process.env.DB_USER || "root",
      password: process.env.DB_PASSWORD || "",
      database: process.env.DB_NAME || "PlanetPulse",
      port: parseInt(process.env.DB_PORT || "3306"),
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      // Remove ssl: false since false is not valid for ssl option
    });
  }
  return pool;
}

// Encryption utilities for GDPR compliance
export function encryptSensitiveData(data: string): string {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.length !== 32) {
    throw new Error("ENCRYPTION_SECRET must be exactly 32 characters long");
  }
  
  const cipher = crypto.createCipher("aes-256-cbc", secret);
  let encrypted = cipher.update(data, "utf8", "hex");
  encrypted += cipher.final("hex");
  return encrypted;
}

export function decryptSensitiveData(encryptedData: string): string {
  const secret = process.env.ENCRYPTION_SECRET;
  if (!secret || secret.length !== 32) {
    throw new Error("ENCRYPTION_SECRET must be exactly 32 characters long");
  }
  
  const decipher = crypto.createDecipher("aes-256-cbc", secret);
  let decrypted = decipher.update(encryptedData, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}

// Hash passwords securely
export async function hashPassword(password: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const salt = crypto.randomBytes(16).toString("hex");
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      resolve(salt + ":" + derivedKey.toString("hex"));
    });
  });
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return new Promise((resolve, reject) => {
    const [salt, key] = hash.split(":");
    crypto.pbkdf2(password, salt, 100000, 64, "sha512", (err, derivedKey) => {
      if (err) reject(err);
      resolve(key === derivedKey.toString("hex"));
    });
  });
}

// Initialize database tables with GDPR-compliant schema
export async function initializeDatabase(): Promise<void> {
  const db = getDbConnection();
  
  // Users table with GDPR compliance fields
  await db.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password_hash VARCHAR(255) NOT NULL,
      role ENUM('Admin', 'Validator', 'Member', 'Partner') DEFAULT 'Member',
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      -- GDPR Compliance fields
      gdpr_consent BOOLEAN DEFAULT FALSE,
      gdpr_consent_date TIMESTAMP NULL,
      data_processing_consent BOOLEAN DEFAULT FALSE,
      marketing_consent BOOLEAN DEFAULT FALSE,
      last_login TIMESTAMP NULL,
      account_status ENUM('active', 'suspended', 'deleted') DEFAULT 'active',
      data_retention_until DATE NULL,
      
      INDEX idx_email (email),
      INDEX idx_username (username),
      INDEX idx_created_at (created_at)
    )
  `);

  // Members table with additional profile information
  await db.execute(`
    CREATE TABLE IF NOT EXISTS members (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      nationality VARCHAR(100),
      profile_data TEXT, -- Encrypted profile information
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id)
    )
  `);

  // GDPR Data Processing Log
  await db.execute(`
    CREATE TABLE IF NOT EXISTS gdpr_processing_log (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      processing_type ENUM('create', 'read', 'update', 'delete', 'export', 'anonymize') NOT NULL,
      legal_basis ENUM('consent', 'contract', 'legal_obligation', 'vital_interests', 'public_task', 'legitimate_interests') NOT NULL,
      data_categories TEXT NOT NULL,
      processing_purpose TEXT NOT NULL,
      processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      processed_by VARCHAR(100),
      
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_processed_at (processed_at)
    )
  `);

  // User Consent History
  await db.execute(`
    CREATE TABLE IF NOT EXISTS user_consent_history (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      consent_type ENUM('gdpr', 'data_processing', 'marketing', 'cookies') NOT NULL,
      consent_given BOOLEAN NOT NULL,
      consent_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      ip_address VARCHAR(45),
      user_agent TEXT,
      
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      INDEX idx_user_id (user_id),
      INDEX idx_consent_date (consent_date)
    )
  `);
}

// Log GDPR processing activities
export async function logGdprProcessing(
  userId: number,
  processingType: string,
  legalBasis: string,
  dataCategories: string,
  processingPurpose: string,
  processedBy?: string
): Promise<void> {
  const db = getDbConnection();
  
  await db.execute(
    `INSERT INTO gdpr_processing_log 
     (user_id, processing_type, legal_basis, data_categories, processing_purpose, processed_by) 
     VALUES (?, ?, ?, ?, ?, ?)`,
    [userId, processingType, legalBasis, dataCategories, processingPurpose, processedBy]
  );
}

// Record user consent
export async function recordUserConsent(
  userId: number,
  consentType: string,
  consentGiven: boolean,
  ipAddress?: string,
  userAgent?: string
): Promise<void> {
  const db = getDbConnection();
  
  await db.execute(
    `INSERT INTO user_consent_history 
     (user_id, consent_type, consent_given, ip_address, user_agent) 
     VALUES (?, ?, ?, ?, ?)`,
    [userId, consentType, consentGiven, ipAddress, userAgent]
  );
}

// User data export for GDPR Article 20 (Data Portability)
export async function exportUserData(userId: number): Promise<any> {
  const db = getDbConnection();
  
  // Get user data
  const [userRows] = await db.execute(
    `SELECT id, username, email, role, created_at, updated_at, last_login 
     FROM users WHERE id = ?`,
    [userId]
  ) as [RowDataPacket[], any];

  if (userRows.length === 0) {
    throw new Error("User not found");
  }

  // Get member data
  const [memberRows] = await db.execute(
    `SELECT nationality, created_at, updated_at 
     FROM members WHERE user_id = ?`,
    [userId]
  ) as [RowDataPacket[], any];

  // Get consent history
  const [consentRows] = await db.execute(
    `SELECT consent_type, consent_given, consent_date 
     FROM user_consent_history WHERE user_id = ? 
     ORDER BY consent_date DESC`,
    [userId]
  ) as [RowDataPacket[], any];

  // Get processing log
  const [processingRows] = await db.execute(
    `SELECT processing_type, legal_basis, data_categories, processing_purpose, processed_at 
     FROM gdpr_processing_log WHERE user_id = ? 
     ORDER BY processed_at DESC`,
    [userId]
  ) as [RowDataPacket[], any];

  return {
    user: userRows[0],
    profile: memberRows[0] || null,
    consentHistory: consentRows,
    processingLog: processingRows,
    exportedAt: new Date().toISOString()
  };
}