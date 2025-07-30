-- PlanetPulse Database Setup with GDPR Compliance
-- MariaDB/MySQL Compatible Schema

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS PlanetPulse
CHARACTER SET utf8mb4 
COLLATE utf8mb4_unicode_ci;

USE PlanetPulse;

-- Users table with GDPR compliance fields
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
  INDEX idx_created_at (created_at),
  INDEX idx_account_status (account_status)
);

-- Members table with additional profile information
CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  nationality VARCHAR(100),
  profile_data TEXT, -- Encrypted profile information
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id)
);

-- GDPR Data Processing Log
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
  INDEX idx_processed_at (processed_at),
  INDEX idx_processing_type (processing_type)
);

-- User Consent History
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
  INDEX idx_consent_date (consent_date),
  INDEX idx_consent_type (consent_type)
);

-- Environmental Posts/News table (for future expansion)
CREATE TABLE IF NOT EXISTS posts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  content TEXT NOT NULL,
  category ENUM('biodiversity', 'sustainability', 'climate_change', 'conservation', 'pollution') NOT NULL,
  status ENUM('draft', 'pending_review', 'approved', 'rejected') DEFAULT 'pending_review',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  approved_by INT NULL,
  approved_at TIMESTAMP NULL,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (approved_by) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user_id (user_id),
  INDEX idx_status (status),
  INDEX idx_category (category),
  INDEX idx_created_at (created_at)
);

-- Data Breach Log for GDPR Article 33/34 compliance
CREATE TABLE IF NOT EXISTS data_breach_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  breach_type ENUM('confidentiality', 'integrity', 'availability') NOT NULL,
  severity ENUM('low', 'medium', 'high', 'critical') NOT NULL,
  description TEXT NOT NULL,
  affected_users_count INT DEFAULT 0,
  discovery_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  notification_date TIMESTAMP NULL,
  resolution_date TIMESTAMP NULL,
  reported_to_authority BOOLEAN DEFAULT FALSE,
  authority_reference VARCHAR(100),
  
  INDEX idx_discovery_date (discovery_date),
  INDEX idx_severity (severity),
  INDEX idx_reported_to_authority (reported_to_authority)
);

-- User Data Export Requests for GDPR Article 20 compliance
CREATE TABLE IF NOT EXISTS data_export_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_date TIMESTAMP NULL,
  export_file_path VARCHAR(500),
  status ENUM('pending', 'processing', 'completed', 'failed') DEFAULT 'pending',
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_request_date (request_date),
  INDEX idx_status (status)
);

-- User Data Deletion Requests for GDPR Article 17 compliance
CREATE TABLE IF NOT EXISTS data_deletion_requests (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  request_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  processed_date TIMESTAMP NULL,
  deletion_reason ENUM('withdrawal_consent', 'unlawful_processing', 'erasure_obligation', 'object_processing') NOT NULL,
  status ENUM('pending', 'processing', 'completed', 'denied') DEFAULT 'pending',
  denial_reason TEXT,
  
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_user_id (user_id),
  INDEX idx_request_date (request_date),
  INDEX idx_status (status)
);

-- Insert default admin user (password should be changed immediately)
INSERT IGNORE INTO users (username, email, password_hash, role, gdpr_consent, gdpr_consent_date) 
VALUES ('admin', 'admin@planetpulse.com', '$pbkdf2-sha512$100000$salt$hash', 'Admin', TRUE, NOW());

-- Create indexes for performance
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_posts_category_status ON posts(category, status);
CREATE INDEX idx_consent_history_type_date ON user_consent_history(consent_type, consent_date);

-- Views for GDPR compliance reporting
CREATE OR REPLACE VIEW user_consent_summary AS
SELECT 
    u.id,
    u.username,
    u.email,
    u.gdpr_consent,
    u.gdpr_consent_date,
    u.data_processing_consent,
    u.marketing_consent,
    COUNT(uch.id) as consent_changes
FROM users u
LEFT JOIN user_consent_history uch ON u.id = uch.user_id
GROUP BY u.id, u.username, u.email, u.gdpr_consent, u.gdpr_consent_date, u.data_processing_consent, u.marketing_consent;

CREATE OR REPLACE VIEW data_processing_summary AS
SELECT 
    DATE(processed_at) as processing_date,
    processing_type,
    legal_basis,
    COUNT(*) as operation_count
FROM gdpr_processing_log
GROUP BY DATE(processed_at), processing_type, legal_basis
ORDER BY processing_date DESC;

-- Triggers for automatic GDPR logging
DELIMITER $$

CREATE TRIGGER user_update_log 
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    IF OLD.email != NEW.email OR OLD.username != NEW.username THEN
        INSERT INTO gdpr_processing_log 
        (user_id, processing_type, legal_basis, data_categories, processing_purpose, processed_by)
        VALUES 
        (NEW.id, 'update', 'legitimate_interests', 'personal_data', 'User profile update', 'system');
    END IF;
END$$

CREATE TRIGGER user_delete_log 
AFTER DELETE ON users
FOR EACH ROW
BEGIN
    INSERT INTO gdpr_processing_log 
    (user_id, processing_type, legal_basis, data_categories, processing_purpose, processed_by)
    VALUES 
    (OLD.id, 'delete', 'erasure_obligation', 'all_personal_data', 'User account deletion', 'system');
END$$

DELIMITER ;

-- Data retention cleanup procedure
DELIMITER $$

CREATE PROCEDURE CleanupExpiredData()
BEGIN
    -- Mark users for deletion after 7 years of inactivity
    UPDATE users 
    SET account_status = 'deleted', 
        data_retention_until = CURDATE()
    WHERE last_login < DATE_SUB(CURDATE(), INTERVAL 7 YEAR)
    AND account_status = 'active';
    
    -- Delete processing logs older than 3 years
    DELETE FROM gdpr_processing_log 
    WHERE processed_at < DATE_SUB(NOW(), INTERVAL 3 YEAR);
    
    -- Delete consent history older than 7 years
    DELETE FROM user_consent_history 
    WHERE consent_date < DATE_SUB(NOW(), INTERVAL 7 YEAR);
END$$

DELIMITER ;

-- Create event for automatic cleanup (if EVENT_SCHEDULER is enabled)
-- CREATE EVENT IF NOT EXISTS daily_gdpr_cleanup
-- ON SCHEDULE EVERY 1 DAY
-- STARTS CURDATE() + INTERVAL 1 DAY
-- DO CALL CleanupExpiredData();
