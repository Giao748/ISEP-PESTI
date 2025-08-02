CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(128) UNIQUE,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  role ENUM('Admin', 'Validator', 'Member', 'Partner') DEFAULT 'Member',
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS members (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  email VARCHAR(100) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  nationality VARCHAR(100) NOT NULL,
  role ENUM('Admin', 'Member') DEFAULT 'Member',
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Posts table for student posts
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
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Comments table for post comments
CREATE TABLE IF NOT EXISTS comments (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  author_id INT NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (author_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Likes table for post likes
CREATE TABLE IF NOT EXISTS post_likes (
  id INT AUTO_INCREMENT PRIMARY KEY,
  post_id INT NOT NULL,
  user_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE KEY unique_like (post_id, user_id),
  FOREIGN KEY (post_id) REFERENCES posts(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Gamification: User points and achievements
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
);

-- Gamification: Point transactions for audit trail
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
);

-- Gamification: Monthly leaderboard
CREATE TABLE IF NOT EXISTS monthly_leaderboard (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  month_year VARCHAR(7) NOT NULL, -- Format: YYYY-MM
  total_points INT DEFAULT 0,
  posts_count INT DEFAULT 0,
  likes_received INT DEFAULT 0,
  comments_received INT DEFAULT 0,
  rank_position INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE KEY unique_monthly_user (user_id, month_year)
);

-- Gamification: Achievements
CREATE TABLE IF NOT EXISTS achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  icon VARCHAR(50),
  points_reward INT DEFAULT 0,
  criteria_type ENUM('POSTS_COUNT', 'LIKES_RECEIVED', 'COMMENTS_RECEIVED', 'LEVEL_REACHED', 'STREAK_DAYS') NOT NULL,
  criteria_value INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Gamification: User achievements
CREATE TABLE IF NOT EXISTS user_achievements (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  achievement_id INT NOT NULL,
  earned_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE,
  UNIQUE KEY unique_user_achievement (user_id, achievement_id)
);

-- User audit log table
CREATE TABLE IF NOT EXISTS user_audit_log (
  id INT AUTO_INCREMENT PRIMARY KEY,
  firebase_uid VARCHAR(128),
  user_id INT,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  user_agent TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
);

-- Insert default achievements
INSERT INTO achievements (name, description, icon, points_reward, criteria_type, criteria_value) VALUES
('First Post', 'Create your first environmental post', '🌱', 10, 'POSTS_COUNT', 1),
('Environmental Advocate', 'Create 5 posts about environmental issues', '🌍', 50, 'POSTS_COUNT', 5),
('Popular Post', 'Receive 10 likes on a single post', '🔥', 25, 'LIKES_RECEIVED', 10),
('Community Helper', 'Receive 5 comments on your posts', '💬', 30, 'COMMENTS_RECEIVED', 5),
('Environmental Expert', 'Create 20 posts about environmental issues', '🏆', 200, 'POSTS_COUNT', 20),
('Viral Content', 'Receive 50 likes on a single post', '🚀', 100, 'LIKES_RECEIVED', 50),
('Discussion Starter', 'Receive 20 comments on your posts', '📢', 75, 'COMMENTS_RECEIVED', 20),
('Level 5', 'Reach level 5', '⭐', 50, 'LEVEL_REACHED', 5),
('Level 10', 'Reach level 10', '⭐⭐', 100, 'LEVEL_REACHED', 10),
('Consistent Contributor', 'Post for 7 consecutive days', '📅', 150, 'STREAK_DAYS', 7);
