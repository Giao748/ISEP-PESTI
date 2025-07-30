"use client";
import React from "react";
import styles from "./HomePage.module.css";
import Link from "next/link";
import LanguageSelector from "../LanguageSelector";
import { event } from "../../lib/gtags"; // <- tracking GA
import { useRouter } from "next/navigation";

function HomePage() {
  const router = useRouter();

  const handleStartNowClick = () => {
    event({
      action: "start_now_click",
      category: "engagement",
      label: "Start Now Button",
      value: 1,
    });

    // Aguarda um pouco antes de redirecionar para garantir que o evento é enviado
    setTimeout(() => {
      router.push("/posts");
    }, 150);
  };

  return (
    <div className="min-h-screen bg-gray-100 text-gray-800 flex flex-col">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-6 py-4 bg-white shadow-md">
        <div className="flex items-center space-x-4">
          <div
            className="bg-gray-300 w-10 h-10 rounded-full flex items-center justify-center font-bold cursor-pointer"
            onClick={() => window.location.reload()}
          >
            PP
          </div>
          <ul className="hidden md:flex items-center space-x-6 font-semibold">
            <li>
              <a
                href="/"
                onClick={(e) => {
                  e.preventDefault();
                  window.location.reload();
                }}
              >
                Home
              </a>
            </li>
            <li><Link href="/posts">Posts</Link></li>
            <li><Link href="/partners">Partners</Link></li>
            <li><Link href="/gamification">Gamification</Link></li>
            <li><Link href="/about">About</Link></li>
            <li className="flex items-center">
              <LanguageSelector />
            </li>
          </ul>
        </div>

        <div className="space-x-4 ml-auto flex items-center">
          <Link href="/login" className="text-sm hover:underline transition-colors">
            Login
          </Link>
          <Link
            href="/register"
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700 transition"
          >
            Register
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <video autoPlay muted loop playsInline className="absolute w-full h-full object-cover z-0">
          <source src="/pp-turtle.mp4" type="video/mp4" />
        </video>
        <div className={styles.overlay} />
        <div className={styles.heroContent}>
          <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white text-center">
            Youth transforming the future and the planet!
          </h1>
          <p className="text-xl md:text-2xl text-white/90 mb-8 text-center max-w-3xl mx-auto">
            Join the global movement of young changemakers sharing sustainability content, 
            connecting with partners, and earning rewards for positive environmental impact.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              className="bg-green-500 hover:bg-green-600 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all transform hover:scale-105"
              onClick={handleStartNowClick}
            >
              Start Now!
            </button>
            <Link
              href="/about"
              className="bg-white/20 hover:bg-white/30 text-white font-semibold px-8 py-4 rounded-lg text-lg transition-all transform hover:scale-105 text-center backdrop-blur-sm"
            >
              Learn More
            </Link>
          </div>
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

      {/* Key Features Section */}
      <section className="py-20 px-6 md:px-20 bg-gradient-to-br from-green-50 to-blue-50">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900">
            Discover PlanetPulse Features
          </h2>
          <p className="text-lg text-gray-600 text-center mb-16 max-w-3xl mx-auto">
            Explore our platform's key features designed to empower youth and drive sustainable change
          </p>
          
          <div className="grid md:grid-cols-3 gap-8">
            {/* Partners Section */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Partners</h3>
              <p className="text-gray-600 mb-6">
                Connect with environmental organizations, NGOs, and sustainability-focused companies 
                that support youth-led initiatives and provide resources for impact.
              </p>
              <Link
                href="/partners"
                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Explore Partners
              </Link>
            </div>

            {/* Gamification Section */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">Gamification</h3>
              <p className="text-gray-600 mb-6">
                Earn points, unlock achievements, and climb leaderboards as you share content, 
                engage with the community, and drive positive environmental change.
              </p>
              <Link
                href="/gamification"
                className="inline-block bg-yellow-600 hover:bg-yellow-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                View Rewards
              </Link>
            </div>

            {/* About Section */}
            <div className="bg-white rounded-xl shadow-lg p-8 text-center hover:shadow-xl transition-shadow">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-2xl font-bold mb-4 text-gray-900">About</h3>
              <p className="text-gray-600 mb-6">
                Learn about our mission to empower youth in driving sustainability, 
                our impact so far, and how you can be part of the global movement for change.
              </p>
              <Link
                href="/about"
                className="inline-block bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-lg transition-colors"
              >
                Our Mission
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Recent Highlights */}
      <section className="bg-white py-16 px-6 md:px-20">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold mb-4 text-center text-gray-900">Recent Highlights</h2>
          <p className="text-lg text-gray-600 text-center mb-12">
            Discover the latest sustainability content and initiatives from our community
          </p>
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { title: "Ocean Cleanup Initiative", org: "Youth for Oceans", date: "Jan 15, 2024", color: "blue" },
              { title: "Urban Gardening Project", org: "Green Schools Network", date: "Jan 12, 2024", color: "green" },
              { title: "Renewable Energy Workshop", org: "Future Energy Leaders", date: "Jan 8, 2024", color: "yellow" }
            ].map((post, idx) => (
              <div key={idx} className="bg-white shadow-lg rounded-xl overflow-hidden hover:shadow-xl transition-shadow">
                <div className={`h-40 flex items-center justify-center text-white font-bold text-lg bg-gradient-to-br ${
                  post.color === 'blue' ? 'from-blue-400 to-blue-600' : 
                  post.color === 'green' ? 'from-green-400 to-green-600' : 
                  'from-yellow-400 to-yellow-600'
                }`}>
                  {post.title}
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-semibold mb-2 text-gray-900">{post.title}</h3>
                  <p className="text-sm text-blue-600 font-medium mb-1">{post.org}</p>
                  <p className="text-sm text-gray-500">{post.date}</p>
                  <button className="mt-4 text-blue-600 hover:text-blue-800 font-medium text-sm">
                    Read more →
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link
              href="/posts"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 py-3 rounded-lg transition-colors"
            >
              View All Posts
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <div className="bg-green-500 w-10 h-10 rounded-full flex items-center justify-center font-bold">
                  PP
                </div>
                <span className="text-xl font-bold">PlanetPulse</span>
              </div>
              <p className="text-gray-400 text-sm">
                Empowering youth to transform the future and the planet through sustainable action and community engagement.
              </p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="font-bold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/posts" className="text-gray-400 hover:text-white transition">Posts</Link></li>
                <li><Link href="/partners" className="text-gray-400 hover:text-white transition">Partners</Link></li>
                <li><Link href="/gamification" className="text-gray-400 hover:text-white transition">Gamification</Link></li>
                <li><Link href="/about" className="text-gray-400 hover:text-white transition">About</Link></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h4 className="font-bold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-gray-400 hover:text-white transition">Terms & Conditions</Link></li>
                <li><Link href="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
                <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
              </ul>
            </div>

            {/* Social Media */}
            <div>
              <h4 className="font-bold mb-4">Follow Us</h4>
              <div className="flex space-x-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Instagram</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 6.618 5.367 11.986 11.988 11.986s11.987-5.368 11.987-11.986C24.014 5.367 18.635.001 12.017.001zM8.449 16.988c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348zm7.718 0c-1.297 0-2.348-1.051-2.348-2.348s1.051-2.348 2.348-2.348 2.348 1.051 2.348 2.348-1.051 2.348-2.348 2.348z"/>
                  </svg>
                </a>
                <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">TikTok</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"/>
                  </svg>
                </a>
                <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">LinkedIn</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                  </svg>
                </a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white transition">
                  <span className="sr-only">Facebook</span>
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
            <p>&copy; PlanetPulse 2025. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default HomePage;
