"use client";
import React, { useState, useEffect } from "react";
import axios from "axios";

interface Post {
  id: number;
  title: string;
  content: string;
  category: string;
  location?: string;
  tags?: string;
  likes_count: number;
  comments_count: number;
  created_at: string;
  author_name: string;
  author_firebase_uid: string;
}

interface Comment {
  id: number;
  content: string;
  author_name: string;
  created_at: string;
}

interface CreatePostForm {
  title: string;
  content: string;
  category: string;
  location: string;
  tags: string;
}

interface UserPoints {
  points: number;
  level: number;
  total_posts: number;
  total_likes_received: number;
  total_comments_received: number;
}

export default function PostsPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All Posts");
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userPoints, setUserPoints] = useState<UserPoints | null>(null);
  const [showComments, setShowComments] = useState<number | null>(null);
  const [comments, setComments] = useState<{ [postId: number]: Comment[] }>({});
  const [newComment, setNewComment] = useState("");
  const [commenting, setCommenting] = useState<number | null>(null);
  const [likedPosts, setLikedPosts] = useState<Set<number>>(new Set());

  const [createForm, setCreateForm] = useState<CreatePostForm>({
    title: "",
    content: "",
    category: "",
    location: "",
    tags: "",
  });

  const categories = [
    "All Posts",
    "Good Practice",
    "Environmental Problem",
  ];

  // Get current user from localStorage
  useEffect(() => {
    const userStr = localStorage.getItem("user");
    if (userStr) {
      try {
        const user = JSON.parse(userStr);
        setCurrentUser(user);
        fetchUserPoints(user.id);
      } catch (error) {
        console.error("Error parsing user data:", error);
      }
    }
  }, []);

  // Fetch user points and achievements
  const fetchUserPoints = async (userId: number) => {
    try {
      const response = await axios.get(`/api/gamification/points?userId=${userId}`);
      setUserPoints(response.data.userPoints);
    } catch (error) {
      console.error("Error fetching user points:", error);
    }
  };

  // Fetch posts
  const fetchPosts = async (category = selectedCategory) => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (category && category !== "All Posts") {
        params.append("category", category);
      }
      
      const response = await axios.get(`/api/posts?${params.toString()}`);
      setPosts(response.data.posts);
      
      // Check which posts the user has liked
      if (currentUser?.id) {
        const likedPostsSet = new Set<number>();
        for (const post of response.data.posts) {
          try {
            const likeResponse = await axios.get(`/api/posts/${post.id}/like?userId=${currentUser.id}`);
            if (likeResponse.data.liked) {
              likedPostsSet.add(post.id);
            }
          } catch (error) {
            console.error("Error checking like status:", error);
          }
        }
        setLikedPosts(likedPostsSet);
      }
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to fetch posts");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    fetchPosts(category);
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!currentUser?.id) {
      setError("You must be logged in to create a post");
      return;
    }

    try {
      setCreating(true);
      setError("");

      const response = await axios.post("/api/posts", {
        ...createForm,
        authorId: currentUser.id,
      });

      // Add the new post to the beginning of the list
      setPosts([response.data.post, ...posts]);
      
      // Refresh user points
      fetchUserPoints(currentUser.id);
      
      // Reset form
      setCreateForm({
        title: "",
        content: "",
        category: "",
        location: "",
        tags: "",
      });
      
      setShowCreateForm(false);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to create post");
    } finally {
      setCreating(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setCreateForm({
      ...createForm,
      [e.target.name]: e.target.value,
    });
  };

  const handleLike = async (postId: number) => {
    if (!currentUser?.id) {
      setError("You must be logged in to like posts");
      return;
    }

    try {
      const response = await axios.post(`/api/posts/${postId}/like`, {
        userId: currentUser.id,
      });

      // Update posts list
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            likes_count: response.data.liked ? post.likes_count + 1 : post.likes_count - 1
          };
        }
        return post;
      }));

      // Update liked posts set
      const newLikedPosts = new Set(likedPosts);
      if (response.data.liked) {
        newLikedPosts.add(postId);
      } else {
        newLikedPosts.delete(postId);
      }
      setLikedPosts(newLikedPosts);

      // Refresh user points
      fetchUserPoints(currentUser.id);

    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to like post");
    }
  };

  const handleShowComments = async (postId: number) => {
    if (showComments === postId) {
      setShowComments(null);
      return;
    }

    try {
      const response = await axios.get(`/api/posts/${postId}/comments`);
      setComments({ ...comments, [postId]: response.data.comments });
      setShowComments(postId);
    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to fetch comments");
    }
  };

  const handleAddComment = async (postId: number) => {
    if (!currentUser?.id || !newComment.trim()) return;

    try {
      setCommenting(postId);
      const response = await axios.post(`/api/posts/${postId}/comments`, {
        content: newComment,
        authorId: currentUser.id,
      });

      // Update comments
      const updatedComments = {
        ...comments,
        [postId]: [...(comments[postId] || []), response.data.comment]
      };
      setComments(updatedComments);

      // Update posts list
      setPosts(posts.map(post => {
        if (post.id === postId) {
          return { ...post, comments_count: post.comments_count + 1 };
        }
        return post;
      }));

      setNewComment("");
      fetchUserPoints(currentUser.id);

    } catch (error: any) {
      setError(error.response?.data?.error || "Failed to add comment");
    } finally {
      setCommenting(null);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));
    
    if (diffInHours < 1) return "Just now";
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? 's' : ''} ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-green-600 to-green-700 text-white p-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex justify-between items-center">
            <h1 className="text-3xl font-bold">🌍 PlanetPulse - Student Posts</h1>
            <div className="flex items-center gap-4">
              {currentUser && (
                <div className="flex items-center gap-3">
                  <span className="text-green-100">
                    Welcome, {currentUser.username}
                  </span>
                  {userPoints && (
                    <div className="bg-white/20 px-3 py-1 rounded-lg">
                      <span className="text-sm">⭐ Level {userPoints.level} | {userPoints.points} pts</span>
                    </div>
                  )}
                </div>
              )}
              <button
                onClick={() => setShowCreateForm(!showCreateForm)}
                className="bg-white text-green-600 px-4 py-2 rounded-lg font-semibold hover:bg-green-50 transition-colors"
              >
                {showCreateForm ? "Cancel" : "📝 Create Post"}
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto p-6">
        {/* Create Post Section */}
        {showCreateForm && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-2 border-dashed border-green-200">
            <h2 className="text-xl font-semibold mb-4 text-gray-800">
              📝 Create New Post
            </h2>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}

            <form onSubmit={handleCreatePost} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Title
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={createForm.title}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="Enter post title..."
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Category
                  </label>
                  <select
                    name="category"
                    value={createForm.category}
                    onChange={handleInputChange}
                    required
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  >
                    <option value="">Select category...</option>
                    {categories.slice(1).map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content
                </label>
                <textarea
                  name="content"
                  value={createForm.content}
                  onChange={handleInputChange}
                  required
                  rows={4}
                  className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                  placeholder="Share your environmental insights, projects, or ideas..."
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location (Optional)
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={createForm.location}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="Where is this happening?"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tags (Optional)
                  </label>
                  <input
                    type="text"
                    name="tags"
                    value={createForm.tags}
                    onChange={handleInputChange}
                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                    placeholder="Add tags separated by commas"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={creating}
                className={`w-full py-3 rounded-lg font-semibold text-lg transition-all duration-200 ${
                  creating
                    ? "bg-gray-400 cursor-not-allowed text-gray-600"
                    : "bg-green-600 hover:bg-green-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
                }`}
              >
                {creating ? "Creating..." : "🚀 Publish Post"}
              </button>
            </form>
          </div>
        )}

        {/* Posts Section */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-6 text-gray-800">
            📰 Recent Posts
          </h2>

          {/* Category Filters */}
          <div className="flex gap-3 mb-6 flex-wrap">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => handleCategoryChange(category)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === category
                    ? "bg-green-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {category}
              </button>
            ))}
          </div>

          {/* Posts Grid */}
          {posts.length === 0 ? (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">🌱</div>
              <h3 className="text-xl font-semibold text-gray-600 mb-2">
                No posts yet
              </h3>
              <p className="text-gray-500">
                Be the first to share your environmental insights!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {posts.map((post) => (
                <div
                  key={post.id}
                  className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-lg transition-all duration-200"
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                        {getInitials(post.author_name)}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-800">
                          {post.author_name}
                        </h4>
                        <p className="text-sm text-gray-500">
                          {formatDate(post.created_at)}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                      post.category === 'Good Practice' 
                        ? 'bg-green-100 text-green-800' 
                        : 'bg-red-100 text-red-800'
                    }`}>
                      {post.category}
                    </span>
                  </div>

                  <h3 className="text-xl font-semibold text-gray-800 mb-3">
                    {post.title}
                  </h3>
                  
                  <p className="text-gray-600 mb-4 leading-relaxed">
                    {post.content}
                  </p>

                  <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                    <div className="flex gap-6 text-sm text-gray-500">
                      <span>👍 {post.likes_count} likes</span>
                      <span>💬 {post.comments_count} comments</span>
                      {post.location && (
                        <span>📍 {post.location}</span>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <button 
                        onClick={() => handleLike(post.id)}
                        className={`px-3 py-1 text-sm border rounded transition-colors ${
                          likedPosts.has(post.id)
                            ? 'bg-green-600 text-white border-green-600'
                            : 'border-green-600 text-green-600 hover:bg-green-600 hover:text-white'
                        }`}
                      >
                        {likedPosts.has(post.id) ? '❤️ Liked' : '👍 Like'}
                      </button>
                      <button 
                        onClick={() => handleShowComments(post.id)}
                        className="px-3 py-1 text-sm border border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white transition-colors"
                      >
                        💬 Comment
                      </button>
                      <button className="px-3 py-1 text-sm border border-green-600 text-green-600 rounded hover:bg-green-600 hover:text-white transition-colors">
                        Share
                      </button>
                    </div>
                  </div>

                  {/* Comments Section */}
                  {showComments === post.id && (
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <h4 className="font-semibold text-gray-800 mb-3">Comments</h4>
                      
                      {/* Add Comment */}
                      <div className="mb-4">
                        <textarea
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                          placeholder="Write a comment..."
                          className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500 focus:outline-none transition-colors"
                          rows={2}
                        />
                        <button
                          onClick={() => handleAddComment(post.id)}
                          disabled={commenting === post.id || !newComment.trim()}
                          className={`mt-2 px-4 py-2 rounded-lg font-medium transition-colors ${
                            commenting === post.id || !newComment.trim()
                              ? 'bg-gray-400 cursor-not-allowed text-gray-600'
                              : 'bg-green-600 hover:bg-green-700 text-white'
                          }`}
                        >
                          {commenting === post.id ? 'Posting...' : 'Post Comment'}
                        </button>
                      </div>

                      {/* Comments List */}
                      <div className="space-y-3">
                        {comments[post.id]?.map((comment) => (
                          <div key={comment.id} className="bg-gray-50 p-3 rounded-lg">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-800">
                                {comment.author_name}
                              </span>
                              <span className="text-sm text-gray-500">
                                {formatDate(comment.created_at)}
                              </span>
                            </div>
                            <p className="text-gray-600">{comment.content}</p>
                          </div>
                        ))}
                        {(!comments[post.id] || comments[post.id].length === 0) && (
                          <p className="text-gray-500 text-center py-4">
                            No comments yet. Be the first to comment!
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
