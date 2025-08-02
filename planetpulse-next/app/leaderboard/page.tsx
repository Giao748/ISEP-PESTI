"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

interface LeaderboardEntry {
  user_id: number;
  username: string;
  total_points: number;
  posts_count: number;
  likes_received: number;
  comments_received: number;
  rank_position: number;
}

export default function LeaderboardPage() {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [currentMonth, setCurrentMonth] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      setLoading(true);
      const response = await axios.get("/api/gamification/leaderboard");
      setLeaderboard(response.data.leaderboard);
      setCurrentMonth(response.data.currentMonth);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to fetch leaderboard");
    } finally {
      setLoading(false);
    }
  };

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return "🥇";
      case 2:
        return "🥈";
      case 3:
        return "🥉";
      default:
        return `#${rank}`;
    }
  };

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-100 border-yellow-300 text-yellow-800";
      case 2:
        return "bg-gray-100 border-gray-300 text-gray-800";
      case 3:
        return "bg-orange-100 border-orange-300 text-orange-800";
      default:
        return "bg-white border-gray-200 text-gray-700";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading leaderboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center">
            <h1 className="text-4xl font-bold mb-2">🏆 Monthly Leaderboard</h1>
            <p className="text-green-100">
              Top environmental advocates for {currentMonth}
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Prizes Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h2 className="text-2xl font-bold mb-4 text-gray-800">🎁 Monthly Prizes</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-6 border-2 border-yellow-300 rounded-lg bg-yellow-50">
              <div className="text-4xl mb-2">🥇</div>
              <h3 className="text-xl font-bold text-yellow-800 mb-2">1st Place</h3>
              <p className="text-yellow-700">€500 Cash Prize + Environmental Trip</p>
            </div>
            <div className="text-center p-6 border-2 border-gray-300 rounded-lg bg-gray-50">
              <div className="text-4xl mb-2">🥈</div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">2nd Place</h3>
              <p className="text-gray-700">€300 Cash Prize + Eco-friendly Gadgets</p>
            </div>
            <div className="text-center p-6 border-2 border-orange-300 rounded-lg bg-orange-50">
              <div className="text-4xl mb-2">🥉</div>
              <h3 className="text-xl font-bold text-orange-800 mb-2">3rd Place</h3>
              <p className="text-orange-700">€150 Cash Prize + Sustainable Products</p>
            </div>
          </div>
        </div>

        {/* Leaderboard */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">📊 Current Rankings</h2>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          )}

          {leaderboard.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🏆</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No rankings yet
              </h3>
              <p className="text-gray-500">
                Start posting to climb the leaderboard!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {leaderboard.map((entry) => (
                <div
                  key={entry.user_id}
                  className={`p-6 border-2 rounded-lg transition-all duration-200 hover:shadow-lg ${getRankColor(entry.rank_position)}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <div className="text-2xl font-bold">
                        {getRankIcon(entry.rank_position)}
                      </div>
                      <div>
                        <h3 className="text-xl font-bold text-gray-800">
                          {entry.username}
                        </h3>
                        <div className="flex gap-4 text-sm text-gray-600 mt-1">
                          <span>📝 {entry.posts_count} posts</span>
                          <span>👍 {entry.likes_received} likes</span>
                          <span>💬 {entry.comments_received} comments</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-600">
                        {entry.total_points}
                      </div>
                      <div className="text-sm text-gray-500">points</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* How to Earn Points */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">⭐ How to Earn Points</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Creating Content</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>📝 Create a post</span>
                  <span className="font-bold text-green-600">+20 points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>💬 Add a comment</span>
                  <span className="font-bold text-green-600">+3 points</span>
                </div>
              </div>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-gray-800">Receiving Engagement</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span>👍 Receive a like</span>
                  <span className="font-bold text-green-600">+2 points</span>
                </div>
                <div className="flex justify-between items-center">
                  <span>💬 Receive a comment</span>
                  <span className="font-bold text-green-600">+5 points</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Achievements Info */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-2xl font-bold mb-6 text-gray-800">🏅 Achievements</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-2">🌱</div>
              <h4 className="font-semibold">First Post</h4>
              <p className="text-sm text-gray-600">Create your first post</p>
              <span className="text-xs text-green-600 font-bold">+10 points</span>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-2">🔥</div>
              <h4 className="font-semibold">Popular Post</h4>
              <p className="text-sm text-gray-600">Get 10+ likes on a post</p>
              <span className="text-xs text-green-600 font-bold">+25 points</span>
            </div>
            <div className="text-center p-4 border border-gray-200 rounded-lg">
              <div className="text-3xl mb-2">🏆</div>
              <h4 className="font-semibold">Environmental Expert</h4>
              <p className="text-sm text-gray-600">Create 20+ posts</p>
              <span className="text-xs text-green-600 font-bold">+200 points</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 