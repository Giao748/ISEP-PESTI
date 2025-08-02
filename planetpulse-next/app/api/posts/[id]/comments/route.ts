import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection, logUserAction } from '@/lib/database';
import { addPoints, POINT_VALUES } from '@/lib/gamification';

// GET /api/posts/[id]/comments - Get comments for a post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = getDbConnection();
    const postId = parseInt(params.id);

    const [comments] = await connection.execute(`
      SELECT 
        c.*,
        u.username as author_name,
        u.firebase_uid as author_firebase_uid
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.post_id = ?
      ORDER BY c.created_at ASC
    `, [postId]);

    return NextResponse.json({ comments });

  } catch (error) {
    console.error('Error fetching comments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

// POST /api/posts/[id]/comments - Add a comment to a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = getDbConnection();
    const postId = parseInt(params.id);
    const body = await request.json();
    const { content, authorId } = body;

    if (!content || !authorId) {
      return NextResponse.json(
        { error: 'Content and author ID are required' },
        { status: 400 }
      );
    }

    // Insert the comment
    const [result] = await connection.execute(
      'INSERT INTO comments (post_id, author_id, content) VALUES (?, ?, ?)',
      [postId, authorId, content]
    );

    const commentId = (result as any).insertId;

    // Update comments count on the post
    await connection.execute(
      'UPDATE posts SET comments_count = comments_count + 1 WHERE id = ?',
      [postId]
    );

    // Get post author for gamification
    const [postResult] = await connection.execute(
      'SELECT author_id FROM posts WHERE id = ?',
      [postId]
    );
    const postAuthorId = (postResult as any[])[0]?.author_id;

    // Add points for giving a comment
    await addPoints(
      authorId,
      'GIVE_COMMENT',
      POINT_VALUES.GIVE_COMMENT,
      `Commented on a post`,
      postId,
      undefined
    );

    // Add points to post author for receiving a comment (if not commenting on own post)
    if (postAuthorId && postAuthorId !== authorId) {
      await addPoints(
        postAuthorId,
        'RECEIVE_COMMENT',
        POINT_VALUES.RECEIVE_COMMENT,
        `Received a comment on post`,
        postId,
        authorId
      );
    }

    // Log the action
    await logUserAction(
      authorId,
      null,
      'ADD_COMMENT',
      `Added comment to post ID: ${postId}`,
      request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
      request.headers.get('user-agent') || undefined
    );

    // Fetch the created comment with author info
    const [comments] = await connection.execute(`
      SELECT 
        c.*,
        u.username as author_name,
        u.firebase_uid as author_firebase_uid
      FROM comments c
      LEFT JOIN users u ON c.author_id = u.id
      WHERE c.id = ?
    `, [commentId]);

    return NextResponse.json(
      { 
        message: 'Comment added successfully',
        comment: (comments as any[])[0]
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Error adding comment:', error);
    return NextResponse.json(
      { error: 'Failed to add comment' },
      { status: 500 }
    );
  }
} 