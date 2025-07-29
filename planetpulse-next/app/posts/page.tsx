"use client";
import React, { useState } from "react";
import countries from "world-countries";

type PostStatus = "Approved" | "Pending Review" | "Rejected" | "Draft";

const mockPosts: {
  id: number;
  title: string;
  student: string;
  school: string;
  country: string;
  date: string;
  type: string;
  category: string;
  image: string;
  likes: number;
  comments: number;
  status: PostStatus;
}[] = [
  {
    id: 1,
    title: "Saving Turtles at the Beach",
    student: "Ana M.",
    school: "Green High School",
    country: "Portugal",
    date: "2025-06-20",
    type: "Video",
    category: "Good Practice",
    image: "/turtle-thumbnail.jpg",
    likes: 12,
    comments: 3,
    status: "Approved",
  },
  {
    id: 2,
    title: "Plastic Waste Problem",
    student: "João R.",
    school: "Eco Academy",
    country: "Brazil",
    date: "2025-06-18",
    type: "Image",
    category: "Environmental Problem",
    image: "",
    likes: 8,
    comments: 5,
    status: "Pending Review",
  },
];

const statusColors: Record<PostStatus, string> = {
  Approved: "text-green-600",
  "Pending Review": "text-yellow-500",
  Rejected: "text-red-500",
  Draft: "text-gray-400",
};

export default function PostsPage() {
  const [search, setSearch] = useState("");

  return (
    <main className="min-h-screen bg-white px-6 py-8 md:px-20 font-sans">
      {/* Filters */}
      <section className="mb-10">
        <h1 className="text-4xl font-bold mb-6 text-green-700">🌍 Student Posts</h1>
        <div className="flex flex-col md:flex-row md:items-center md:space-x-4 gap-4">
          <input
            type="text"
            placeholder="🔍 Search by title, school, or country..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="border border-gray-300 px-4 py-2 rounded-xl w-full md:w-64 focus:outline-none focus:ring-2 focus:ring-green-400"
          />
          <select className="border border-gray-300 px-4 py-2 rounded-xl">
            <option>Country</option>
            {countries.map((country) => (
              <option key={country.cca2}>{country.name.common}</option>
            ))}
          </select>
          <select className="border border-gray-300 px-4 py-2 rounded-xl">
            <option>Category</option>
            <option>Good Practice</option>
            <option>Environmental Problem</option>
          </select>
        </div>
      </section>

      {/* Post Cards */}
      <section className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {mockPosts.map((post) => (
          <div
            key={post.id}
            className="bg-white border border-gray-200 shadow-md rounded-2xl overflow-hidden hover:shadow-xl hover:scale-[1.02] transition-transform duration-200"
          >
            <div className="h-48 bg-gray-100 flex items-center justify-center">
              {post.image ? (
                <img
                  src={post.image}
                  alt={post.title}
                  className="object-cover h-full w-full"
                />
              ) : (
                <span className="text-gray-400">📷 No image</span>
              )}
            </div>
            <div className="p-5 space-y-2">
              <h3 className="text-xl font-semibold text-gray-800">{post.title}</h3>
              <p className="text-sm text-gray-500">
                {post.student} – {post.school}
              </p>
              <p className="text-sm text-gray-400">
                📍 {post.country} | 📅 {post.date}
              </p>

              <div className="flex items-center justify-between mt-2 text-sm text-gray-600">
                <span>{post.likes}</span>
                <span>{post.comments}</span>
                <button className="text-blue-600 hover:underline">Share ↗</button>
              </div>

              <p className={`mt-2 text-xs font-semibold ${statusColors[post.status]}`}>
                {post.status === "Pending Review" && "⏳ Pending Review"}
                {post.status === "Approved" && " Approved"}
                {post.status === "Rejected" && " Rejected"}
                {post.status === "Draft" && " Draft"}
              </p>
            </div>
          </div>
        ))}
      </section>

      {/* Floating Create Post Button */}
      <button className="fixed bottom-6 right-6 bg-green-600 text-white px-6 py-3 rounded-full shadow-lg hover:bg-green-700 transition">
        ➕ Create Post
      </button>
    </main>
  );
}
