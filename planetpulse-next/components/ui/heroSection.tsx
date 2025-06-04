'use client';
import React from "react";
import { Button } from "@/components/button";

export default function HeroSection() {
  return (
    <section className="relative text-center py-20 bg-cover bg-center min-h-[60vh] md:min-h-[80vh]">
      <div
        className="absolute inset-0 w-full h-full bg-[url('/banner-fallback.jpg')] bg-cover bg-center"
        style={{ zIndex: 0 }}
      />
      <video
        autoPlay
        loop
        muted
        playsInline
        aria-hidden="true"
        tabIndex={-1}
        className="absolute inset-0 w-full h-full object-cover hidden md:block"
        style={{ zIndex: 0 }}
      >
        <source src="/pp-turtle.mp4" type="video/mp4" />
      </video>
      <div className="absolute inset-0 bg-black bg-opacity-50 z-10" />
      <div className="relative z-20 text-white px-4 flex flex-col justify-center items-center h-full">
        <h1 className="text-4xl md:text-5xl font-bold mb-6">
          Youth transforming the future and the planet!
        </h1>
        <Button className="bg-green-500 hover:bg-green-600 text-white font-semibold px-6 py-3 rounded-md">
          Start Now!
        </Button>
      </div>
    </section>
  );
}
