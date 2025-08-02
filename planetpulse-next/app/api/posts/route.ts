import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection, logUserAction } from '@/lib/database';
import { addPoints, POINT_VALUES } from '@/lib/gamification';

// GET /api/posts - Get all posts
export async function GET(request: NextRequest) {
  try {
    const connection = getDbConnection();
    
    // Get query parameters for filtering
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = (page - 1) * limit;
    
    let query = `
      SELECT 
        p.*,
        u.username as author_name,
        u.firebase_uid as author_firebase_uid,
        COUNT(DISTINCT c.id) as actual_comments_count,
        COUNT(DISTINCT pl.id) as actual_likes_count
      FROM posts p
      LEFT JOIN users u ON p.author_id = u.id
      LEFT JOIN comments c ON p.id = c.post_id
      LEFT JOIN post_likes pl ON p.id = pl.post_id
      WHERE p.is_published = TRUE
    `;
    
    const params: any[] = [];
    
    if (category && category !== 'All Posts') {
      query += ' AND p.category = ?';
      params.push(category);
    }
    
    query += `
      GROUP BY p.id
      ORDER BY p.created_at DESC
      LIMIT ? OFFSET ?
    `;
    
    params.push(limit, offset);
    
    const [posts] = await connection.execute(query, params);
    
    // Get total count for pagination
    let countQuery = `
      SELECT COUNT(*) as total
      FROM posts p
      WHERE p.is_published = TRUE
    `;
    
    const countParams: any[] = [];
    if (category && category !== 'All Posts') {
      countQuery += ' AND p.category = ?';
      countParams.push(category);
    }
    
    const [countResult] = await connection.execute(countQuery, countParams);
    const total = (countResult as any)[0]?.total || 0;
    
    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    });
    
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch posts' },
      { status: 500 }
    );
  }
}

// POST /api/posts - Create a new post
export async function POST(request: NextRequest) {
  try {
    const connection = getDbConnection();
    const body = await request.json();
    
    const { title, content, category, location, tags, authorId } = body;
    
    // Validate required fields
    if (!title || !content || !category || !authorId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }
    
    // Validate category
    const validCategories = [
      'Good Practice',
      'Environmental Problem'
    ];
    
    if (!validCategories.includes(category)) {
      return NextResponse.json(
        { error: 'Invalid category' },
        { status: 400 }
      );
    }
    
    // Insert the new post
    const [result] = await connection.execute(
      `INSERT INTO posts (author_id, title, content, category, location, tags) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [authorId, title, content, category, location || null, tags || null]
    );
    
    const postId = (result as any).insertId;
    
    // Add gamification points for creating a post
    await addPoints(
      authorId,
      'CREATE_POST',
      POINT_VALUES.CREATE_POST,
      `Created post: ${title}`,
      postId,
      undefined
    );
    
    // Log the action
    await logUserAction(
      authorId,
      null,
      'CREATE_POST',
      `Created post: ${title}`,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      request.headers.get('user-agent') || undefined
    );
    
    // Fetch the created post with author info
    const [posts] = await connection.execute(
      `SELECT 
        p.*,
        u.username as author_name,
        u.firebase_uid as author_firebase_uid
       FROM posts p
       LEFT JOIN users u ON p.author_id = u.id
       WHERE p.id = ?`,
      [postId]
    );
    
    return NextResponse.json(
      { 
        message: 'Post created successfully',
        post: (posts as any[])[0]
      },
      { status: 201 }
    );
    
  } catch (error) {
    console.error('Error creating post:', error);
    return NextResponse.json(
      { error: 'Failed to create post' },
      { status: 500 }
    );
  }
} 