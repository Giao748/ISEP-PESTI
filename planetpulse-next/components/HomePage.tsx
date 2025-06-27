"use client";
import React from "react";
import styles from "./HomePage.module.css";
import Link from "next/link";

function HomePage() {
  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
        <div className="flex items-center space-x-4">
          <div className="bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center font-bold">
            PP
          </div>
          <ul className="hidden md:flex space-x-6 font-semibold">
            <li>
              <a
              href="/"
              onClick={e => {
                e.preventDefault();
                window.location.reload();
              }}>Home</a>
            </li>
            <li><Link href="/posts">Posts</Link></li>
            <li><Link href="/partners">Partners</Link></li>
            <li><Link href="/gamification">Gamification</Link></li>
            <li><Link href="/about">About</Link></li>
          </ul>
        </div>
        <div className="space-x-4 ml-auto flex items-center">
          <Link href="/login" className="text-sm hover:underline transition-colors">Login</Link>
          <Link href="/register" className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition">Register</Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <video autoPlay muted loop playsInline className="absolute w-full h-full object-cover z-0">
          <source src="/pp-turtle.mp4" type="video/mp4" />
        </video>
        <div className={styles.overlay} />
        <div className={styles.heroContent}>
          <h1 className="text-4xl md:text-5xl font-bold mb-6 text-white">
            Youth transforming the future and the planet!
          </h1>
          <button
            className="mt-6 bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-md"
            onClick={() => window.location.href = "/posts"}
          >
            Start Now!
          </button>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 md:px-20 bg-white text-center">
        <h2 className="text-3xl font-bold mb-12 text-gray-900">How does it work?</h2>
        <div className="grid md:grid-cols-3 gap-12">
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-green-600 mb-4">1</div>
            <p className="text-lg text-gray-700">Create photos, videos, or content about sustainability</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-green-600 mb-4">2</div>
            <p className="text-lg text-gray-700">Share with the PlanetPulse community and generate impact</p>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-5xl font-bold text-green-600 mb-4">3</div>
            <p className="text-lg text-gray-700">Earn points and rewards with your participation</p>
          </div>
        </div>
      </section>

      {/* Recent Highlights */}
      <section className="bg-gray-50 py-16 px-6 md:px-20">
        <h2 className="text-2xl font-bold mb-8 text-center">Recent Highlights</h2>
        <div className="grid md:grid-cols-3 gap-8">
          {[1, 2, 3].map((_, idx) => (
            <div key={idx} className="bg-white shadow-md rounded-md overflow-hidden text-center p-4">
              <div className="bg-gray-100 h-40 flex items-center justify-center mb-4">Placeholder</div>
              <h3 className="text-lg font-semibold mb-1">Post title</h3>
              <p className="text-sm text-gray-500 mb-1">Organization Name</p>
              <p className="text-sm text-gray-400">Jan 1, 2024</p>
            </div>
          ))}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white border-t py-8 px-6 text-sm text-gray-600">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="text-center md:text-left">
            <p>&copy; PlanetPulse 2025. All rights reserved.</p>
            <div className="space-x-4 mt-2">
              <Link href="/about">About</Link>
              <Link href="/contact">Contact</Link>
              <Link href="/terms">Terms & Conditions</Link>
              <Link href="/privacy">Privacy Policy</Link>
            </div>
          </div>
          <div className="flex space-x-4">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer">Instagram</a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer">TikTok</a>
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer">LinkedIn</a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer">Facebook</a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
