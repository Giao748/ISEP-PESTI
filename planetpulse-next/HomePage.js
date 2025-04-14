import React from "react";
import "./HomePage.css";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center font-bold">
            PP
          </div>
          <ul className="hidden md:flex space-x-6 font-semibold">
            <li>Home</li>
            <li>Posts</li>
            <li>Partnerships</li>
            <li>Gamification</li>
            <li>About</li>
          </ul>
        </div>
        <div className="space-x-4">
          <button className="text-sm">Login</button>
          <button className="bg-blue-600 text-white px-4 py-1 rounded">
            Register
          </button>
        </div>
      </nav>

      {/* Hero Section with background video */}
      <section className="relative text-center py-20 bg-cover bg-center">
        {/* Background video */}
          <video
            autoPlay
            loop
            muted
            playsInline
            className="absolute inset-0 w-full h-full object-cover"
          >
            <source src="/turtle.mp4" type="video/mp4" />
            Your browser does not support HTML5 videos.
          </video>

          {/* Dark overlay */}
        <div className="absolute inset-0 bg-black bg-opacity-50" />

        {/* Content over the video */}
        <div className="relative z-10 text-white px-4">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Youth transforming the future and the planet!
          </h1>
          <button className="mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-md">
            Start Now!
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="py-16 px-4 md:px-20 bg-white">
        <h2 className="text-2xl font-bold text-center mb-10">
          How does it work?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 text-center">
          <div>
            <div className="text-4xl mb-4">1</div>
            <p>Create photos, videos, or content about sustainability</p>
          </div>
          <div>
            <div className="text-4xl mb-4">2</div>
            <p>Share with the PlanetPulse community and generate impact</p>
          </div>
          <div>
            <div className="text-4xl mb-4">3</div>
            <p>Earn points and rewards with your participation</p>
          </div>
        </div>
      </section>
    </div>
  );
}