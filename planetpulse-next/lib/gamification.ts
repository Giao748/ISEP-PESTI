import { getDbConnection } from './database';

// Point values for different actions
export const POINT_VALUES = {
  CREATE_POST: 20,
  RECEIVE_LIKE: 2,
  RECEIVE_COMMENT: 5,
  GIVE_LIKE: 1,
  GIVE_COMMENT: 3,
  BONUS: 10,
  ACHIEVEMENT: 50
};

// Level calculation (every 100 points = 1 level)
export const POINTS_PER_LEVEL = 100;

export interface UserPoints {
  id: number;
  user_id: number;
  points: number;
  level: number;
  total_posts: number;
  total_likes_received: number;
  total_comments_received: number;
  total_likes_given: number;
  total_comments_given: number;
  updated_at: string;
}

export interface Achievement {
  id: number;
  name: string;
  description: string;
  icon: string;
  points_reward: number;
  criteria_type: string;
  criteria_value: number;
}

export interface LeaderboardEntry {
  user_id: number;
  username: string;
  total_points: number;
  posts_count: number;
  likes_received: number;
  comments_received: number;
  rank_position: number;
}

// Initialize user points record
export async function initializeUserPoints(userId: number): Promise<void> {
  const connection = getDbConnection();
  
  try {
    await connection.execute(
      'INSERT IGNORE INTO user_points (user_id) VALUES (?)',
      [userId]
    );
  } catch (error) {
    console.error('Error initializing user points:', error);
    throw error;
  }
}

// Add points to user
export async function addPoints(
  userId: number,
  actionType: string,
  points: number,
  description: string,
  relatedPostId?: number,
  relatedUserId?: number
): Promise<void> {
  const connection = getDbConnection();
  
  try {
    // Initialize user points if not exists
    await initializeUserPoints(userId);
    
    // Add points to user
    await connection.execute(
      'UPDATE user_points SET points = points + ? WHERE user_id = ?',
      [points, userId]
    );
    
    // Record transaction
    await connection.execute(
      `INSERT INTO point_transactions 
       (user_id, action_type, points_earned, description, related_post_id, related_user_id) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userId, actionType, points, description, relatedPostId || null, relatedUserId || null]
    );
    
    // Update specific counters based on action type
    switch (actionType) {
      case 'CREATE_POST':
        await connection.execute(
          'UPDATE user_points SET total_posts = total_posts + 1 WHERE user_id = ?',
          [userId]
        );
        break;
      case 'RECEIVE_LIKE':
        await connection.execute(
          'UPDATE user_points SET total_likes_received = total_likes_received + 1 WHERE user_id = ?',
          [userId]
        );
        break;
      case 'RECEIVE_COMMENT':
        await connection.execute(
          'UPDATE user_points SET total_comments_received = total_comments_received + 1 WHERE user_id = ?',
          [userId]
        );
        break;
      case 'GIVE_LIKE':
        await connection.execute(
          'UPDATE user_points SET total_likes_given = total_likes_given + 1 WHERE user_id = ?',
          [userId]
        );
        break;
      case 'GIVE_COMMENT':
        await connection.execute(
          'UPDATE user_points SET total_comments_given = total_comments_given + 1 WHERE user_id = ?',
          [userId]
        );
        break;
    }
    
    // Check for level up
    await checkLevelUp(userId);
    
    // Check for achievements
    await checkAchievements(userId);
    
  } catch (error) {
    console.error('Error adding points:', error);
    throw error;
  }
}

// Check if user leveled up
async function checkLevelUp(userId: number): Promise<void> {
  const connection = getDbConnection();
  
  try {
    const [result] = await connection.execute(
      'SELECT points FROM user_points WHERE user_id = ?',
      [userId]
    );
    
    const userPoints = (result as any[])[0];
    if (!userPoints) return;
    
    const currentLevel = Math.floor(userPoints.points / POINTS_PER_LEVEL) + 1;
    
    await connection.execute(
      'UPDATE user_points SET level = ? WHERE user_id = ?',
      [currentLevel, userId]
    );
    
  } catch (error) {
    console.error('Error checking level up:', error);
  }
}

// Check for achievements
async function checkAchievements(userId: number): Promise<void> {
  const connection = getDbConnection();
  
  try {
    // Get user stats
    const [userStats] = await connection.execute(
      'SELECT * FROM user_points WHERE user_id = ?',
      [userId]
    );
    
    const stats = (userStats as any[])[0];
    if (!stats) return;
    
    // Get all achievements
    const [achievements] = await connection.execute('SELECT * FROM achievements');
    
    // Get user's earned achievements
    const [userAchievements] = await connection.execute(
      'SELECT achievement_id FROM user_achievements WHERE user_id = ?',
      [userId]
    );
    
    const earnedAchievementIds = (userAchievements as any[]).map(ua => ua.achievement_id);
    
    // Check each achievement
    for (const achievement of achievements as any[]) {
      if (earnedAchievementIds.includes(achievement.id)) continue;
      
      let shouldAward = false;
      
      switch (achievement.criteria_type) {
        case 'POSTS_COUNT':
          shouldAward = stats.total_posts >= achievement.criteria_value;
          break;
        case 'LIKES_RECEIVED':
          shouldAward = stats.total_likes_received >= achievement.criteria_value;
          break;
        case 'COMMENTS_RECEIVED':
          shouldAward = stats.total_comments_received >= achievement.criteria_value;
          break;
        case 'LEVEL_REACHED':
          shouldAward = stats.level >= achievement.criteria_value;
          break;
        case 'STREAK_DAYS':
          // This would need more complex logic for streak tracking
          break;
      }
      
      if (shouldAward) {
        // Award achievement
        await connection.execute(
          'INSERT INTO user_achievements (user_id, achievement_id) VALUES (?, ?)',
          [userId, achievement.id]
        );
        
        // Add achievement points
        await addPoints(
          userId,
          'ACHIEVEMENT',
          achievement.points_reward,
          `Achievement unlocked: ${achievement.name}`,
          undefined,
          undefined
        );
      }
    }
    
  } catch (error) {
    console.error('Error checking achievements:', error);
  }
}

// Get user points and stats
export async function getUserPoints(userId: number): Promise<UserPoints | null> {
  const connection = getDbConnection();
  
  try {
    const [result] = await connection.execute(
      'SELECT * FROM user_points WHERE user_id = ?',
      [userId]
    );
    
    return (result as any[])[0] || null;
  } catch (error) {
    console.error('Error getting user points:', error);
    return null;
  }
}

// Get user achievements
export async function getUserAchievements(userId: number): Promise<Achievement[]> {
  const connection = getDbConnection();
  
  try {
    const [result] = await connection.execute(`
      SELECT a.* FROM achievements a
      INNER JOIN user_achievements ua ON a.id = ua.achievement_id
      WHERE ua.user_id = ?
      ORDER BY ua.earned_at DESC
    `, [userId]);
    
    return result as Achievement[];
  } catch (error) {
    console.error('Error getting user achievements:', error);
    return [];
  }
}

// Update monthly leaderboard
export async function updateMonthlyLeaderboard(): Promise<void> {
  const connection = getDbConnection();
  
  try {
    const currentMonth = new Date().toISOString().slice(0, 7); // YYYY-MM format
    
    // Get all users with their points for this month
    const [users] = await connection.execute(`
      SELECT 
        up.user_id,
        u.username,
        up.points as total_points,
        up.total_posts as posts_count,
        up.total_likes_received as likes_received,
        up.total_comments_received as comments_received
      FROM user_points up
      INNER JOIN users u ON up.user_id = u.id
      ORDER BY up.points DESC
    `);
    
    // Clear current month's leaderboard
    await connection.execute(
      'DELETE FROM monthly_leaderboard WHERE month_year = ?',
      [currentMonth]
    );
    
    // Insert new leaderboard entries
    for (let i = 0; i < (users as any[]).length; i++) {
      const user = (users as any[])[i];
      await connection.execute(`
        INSERT INTO monthly_leaderboard 
        (user_id, month_year, total_points, posts_count, likes_received, comments_received, rank_position)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `, [user.user_id, currentMonth, user.total_points, user.posts_count, user.likes_received, user.comments_received, i + 1]);
    }
    
  } catch (error) {
    console.error('Error updating monthly leaderboard:', error);
  }
}

// Get monthly leaderboard
export async function getMonthlyLeaderboard(monthYear?: string): Promise<LeaderboardEntry[]> {
  const connection = getDbConnection();
  
  try {
    const targetMonth = monthYear || new Date().toISOString().slice(0, 7);
    
    const [result] = await connection.execute(`
      SELECT 
        ml.user_id,
        u.username,
        ml.total_points,
        ml.posts_count,
        ml.likes_received,
        ml.comments_received,
        ml.rank_position
      FROM monthly_leaderboard ml
      INNER JOIN users u ON ml.user_id = u.id
      WHERE ml.month_year = ?
      ORDER BY ml.rank_position ASC
      LIMIT 50
    `, [targetMonth]);
    
    return result as LeaderboardEntry[];
  } catch (error) {
    console.error('Error getting monthly leaderboard:', error);
    return [];
  }
}

// Get top 10 users for current month
export async function getTopUsers(): Promise<LeaderboardEntry[]> {
  return getMonthlyLeaderboard();
} 