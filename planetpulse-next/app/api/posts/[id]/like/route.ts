import { NextRequest, NextResponse } from 'next/server';
import { getDbConnection, logUserAction } from '@/lib/database';
import { addPoints, POINT_VALUES } from '@/lib/gamification';

// POST /api/posts/[id]/like - Like or unlike a post
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = getDbConnection();
    const postId = parseInt(params.id);
    const body = await request.json();
    const { userId } = body;

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user already liked the post
    const [existingLike] = await connection.execute(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [postId, userId]
    );

    if ((existingLike as any[]).length > 0) {
      // Unlike the post
      await connection.execute(
        'DELETE FROM post_likes WHERE post_id = ? AND user_id = ?',
        [postId, userId]
      );

      // Update likes count
      await connection.execute(
        'UPDATE posts SET likes_count = likes_count - 1 WHERE id = ?',
        [postId]
      );

      // Log the action
      await logUserAction(
        userId,
        null,
        'UNLIKE_POST',
        `Unliked post ID: ${postId}`,
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        request.headers.get('user-agent') || undefined
      );

      return NextResponse.json({ 
        message: 'Post unliked successfully',
        liked: false
      });
    } else {
      // Like the post
      await connection.execute(
        'INSERT INTO post_likes (post_id, user_id) VALUES (?, ?)',
        [postId, userId]
      );

      // Update likes count
      await connection.execute(
        'UPDATE posts SET likes_count = likes_count + 1 WHERE id = ?',
        [postId]
      );

      // Get post author for gamification
      const [postResult] = await connection.execute(
        'SELECT author_id FROM posts WHERE id = ?',
        [postId]
      );
      const postAuthorId = (postResult as any[])[0]?.author_id;

      // Add points for giving a like
      await addPoints(
        userId,
        'GIVE_LIKE',
        POINT_VALUES.GIVE_LIKE,
        `Liked a post`,
        postId,
        undefined
      );

      // Add points to post author for receiving a like (if not liking own post)
      if (postAuthorId && postAuthorId !== userId) {
        await addPoints(
          postAuthorId,
          'RECEIVE_LIKE',
          POINT_VALUES.RECEIVE_LIKE,
          `Received a like on post`,
          postId,
          userId
        );
      }

      // Log the action
      await logUserAction(
        userId,
        null,
        'LIKE_POST',
        `Liked post ID: ${postId}`,
        request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || undefined,
        request.headers.get('user-agent') || undefined
      );

      return NextResponse.json({ 
        message: 'Post liked successfully',
        liked: true
      });
    }

  } catch (error) {
    console.error('Error liking/unliking post:', error);
    return NextResponse.json(
      { error: 'Failed to like/unlike post' },
      { status: 500 }
    );
  }
}

// GET /api/posts/[id]/like - Check if user liked the post
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const connection = getDbConnection();
    const postId = parseInt(params.id);
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }

    // Check if user liked the post
    const [like] = await connection.execute(
      'SELECT id FROM post_likes WHERE post_id = ? AND user_id = ?',
      [postId, parseInt(userId)]
    );

    return NextResponse.json({ 
      liked: (like as any[]).length > 0
    });

  } catch (error) {
    console.error('Error checking like status:', error);
    return NextResponse.json(
      { error: 'Failed to check like status' },
      { status: 500 }
    );
  }
} 