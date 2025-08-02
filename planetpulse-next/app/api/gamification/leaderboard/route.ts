import { NextRequest, NextResponse } from 'next/server';
import { getMonthlyLeaderboard, updateMonthlyLeaderboard } from '@/lib/gamification';

// GET /api/gamification/leaderboard - Get monthly leaderboard
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const monthYear = searchParams.get('monthYear'); // Optional: YYYY-MM format

    // Update leaderboard for current month
    await updateMonthlyLeaderboard();

    const leaderboard = await getMonthlyLeaderboard(monthYear || undefined);

    return NextResponse.json({
      leaderboard,
      currentMonth: new Date().toISOString().slice(0, 7)
    });

  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return NextResponse.json(
      { error: 'Failed to fetch leaderboard' },
      { status: 500 }
    );
  }
} 