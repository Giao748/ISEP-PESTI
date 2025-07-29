import React from "react";

const HeroSection = () => {
  return (
    <section className="relative h-[60vh] overflow-hidden">
      {/* Vídeo de fundo */}
      <video
        autoPlay
        muted
        loop
        playsInline
        className="absolute top-0 left-0 w-full h-full object-cover z-0"
      >
        <source src="/pp-turtle.mp4" type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    </section>
  );
};

export default HeroSection;
