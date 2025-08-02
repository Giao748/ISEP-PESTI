import mysql from 'mysql2/promise';

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'Setamurcha12!',
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

    // Create posts table for student posts
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS posts (
        id INT AUTO_INCREMENT PRIMARY KEY,
        author_id INT NOT NULL,
        title VARCHAR(255) NOT NULL,
        content TEXT NOT NULL,
        category ENUM('Good Practice', 'Environmental Problem') NOT NULL,
        location VARCHAR(255),
        tags VARCHAR(500),
        likes_count INT DEFAULT 0,
        comments_count INT DEFAULT 0,
        is_published BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_author_id (author_id),
        INDEX idx_category (category),
        INDEX idx_created_at (created_at),
        INDEX idx_is_published (is_published)
      )
    `);

    // Create comments table for post comments
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS comments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        author_id INT NOT NULL,
        content TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_post_id (post_id),
        INDEX idx_author_id (author_id),
        INDEX idx_created_at (created_at)
      )
    `);

    // Create post_likes table for post likes
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS post_likes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        post_id INT NOT NULL,
        user_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE KEY unique_like (post_id, user_id),
        FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        INDEX idx_post_id (post_id),
        INDEX idx_user_id (user_id)
      )
    `);

    // Create gamification tables
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_points (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        points INT DEFAULT 0,
        level INT DEFAULT 1,
        total_posts INT DEFAULT 0,
        total_likes_received INT DEFAULT 0,
        total_comments_received INT DEFAULT 0,
        total_likes_given INT DEFAULT 0,
        total_comments_given INT DEFAULT 0,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_points (user_id)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS point_transactions (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        action_type ENUM('CREATE_POST', 'RECEIVE_LIKE', 'RECEIVE_COMMENT', 'GIVE_LIKE', 'GIVE_COMMENT', 'BONUS', 'ACHIEVEMENT') NOT NULL,
        points_earned INT NOT NULL,
        description TEXT,
        related_post_id INT,
        related_user_id INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (related_post_id) REFERENCES posts(id) ON DELETE SET NULL,
        FOREIGN KEY (related_user_id) REFERENCES users(id) ON DELETE SET NULL
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS monthly_leaderboard (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        month_year VARCHAR(7) NOT NULL,
        total_points INT DEFAULT 0,
        posts_count INT DEFAULT 0,
        likes_received INT DEFAULT 0,
        comments_received INT DEFAULT 0,
        rank_position INT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        UNIQUE KEY unique_monthly_user (user_id, month_year)
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        description TEXT NOT NULL,
        icon VARCHAR(50),
        points_reward INT DEFAULT 0,
        criteria_type ENUM('POSTS_COUNT', 'LIKES_RECEIVED', 'COMMENTS_RECEIVED', 'LEVEL_REACHED', 'STREAK_DAYS') NOT NULL,
        criteria_value INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    await connection.execute(`
      CREATE TABLE IF NOT EXISTS user_achievements (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        achievement_id INT NOT NULL,
        earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
        UNIQUE KEY unique_user_achievement (user_id, achievement_id)
      )
    `);

    // Insert default achievements if they don't exist
    await connection.execute(`
      INSERT IGNORE INTO achievements (name, description, icon, points_reward, criteria_type, criteria_value) VALUES
      ('First Post', 'Create your first environmental post', '🌱', 10, 'POSTS_COUNT', 1),
      ('Environmental Advocate', 'Create 5 posts about environmental issues', '🌍', 50, 'POSTS_COUNT', 5),
      ('Popular Post', 'Receive 10 likes on a single post', '🔥', 25, 'LIKES_RECEIVED', 10),
      ('Community Helper', 'Receive 5 comments on your posts', '💬', 30, 'COMMENTS_RECEIVED', 5),
      ('Environmental Expert', 'Create 20 posts about environmental issues', '🏆', 200, 'POSTS_COUNT', 20),
      ('Viral Content', 'Receive 50 likes on a single post', '🚀', 100, 'LIKES_RECEIVED', 50),
      ('Discussion Starter', 'Receive 20 comments on your posts', '📢', 75, 'COMMENTS_RECEIVED', 20),
      ('Level 5', 'Reach level 5', '⭐', 50, 'LEVEL_REACHED', 5),
      ('Level 10', 'Reach level 10', '⭐⭐', 100, 'LEVEL_REACHED', 10),
      ('Consistent Contributor', 'Post for 7 consecutive days', '📅', 150, 'STREAK_DAYS', 7)
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