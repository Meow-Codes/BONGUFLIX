"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import "@fontsource/bebas-neue";

const Particle = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute rounded-full pointer-events-none" style={style} />
);

export default function Home() {
  const [particles, setParticles] = useState<{ id: number; style: React.CSSProperties }[]>([]);

  useEffect(() => {
    const generated = Array.from({ length: 12 }, (_, i) => {
      const size = Math.random() * 3 + 1;
      return {
        id: i,
        style: {
          width: `${size}px`,
          height: `${size}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: i % 4 === 0 ? "#E50914" : "rgba(255, 255, 255, 0.35)",
          opacity: Math.random() * 0.4 + 0.15,
          animation: `gentleFloat ${Math.random() * 20 + 18}s linear infinite`,
          willChange: "transform, opacity",
        },
      };
    });
    setParticles(generated);
  }, []);

  return (
    <>
      <style>{`
        @keyframes gentleFloat {
          0%   { transform: translate(0, 0); }
          25%  { transform: translate(18px, -22px); }
          50%  { transform: translate(-12px, -35px); }
          75%  { transform: translate(-25px, -8px); }
          100% { transform: translate(0, 0); }
        }
        @keyframes fadeInDown {
          from { opacity: 0; transform: translateY(-24px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(36px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .navbar   { animation: fadeInDown 0.9s cubic-bezier(0.16,1,0.3,1) both; }
        .hero     { animation: fadeInUp 1s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
        .subtitle { animation: fadeInUp 1s cubic-bezier(0.16,1,0.3,1) 0.7s both; }
        .form     { animation: fadeInUp 1s cubic-bezier(0.16,1,0.3,1) 1s both; }
        .text-red-netflix { color: #E50914; }
        .fill-hover {
          display: inline-block;
          background: linear-gradient(to right, #E50914 50%, white 50%);
          background-size: 200% 100%;
          background-position: right bottom;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          transition: background-position 0.55s cubic-bezier(0.215, 0.61, 0.355, 1);
        }
        .fill-hover:hover { background-position: left bottom; }
        .cta-btn {
          transition: transform 0.25s ease, box-shadow 0.25s ease;
        }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(229,9,20,0.45);
        }
        .cta-btn:active { transform: translateY(0); }
      `}</style>

      <div className="relative h-screen w-full text-white overflow-hidden font-['Montserrat',sans-serif]">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/9c5457b8-9ab0-4a04-9fc1-e608d5670f1a/710d74e0-7158-408e-8d9b-23c219dee5df/IN-en-20210719-popsignuptwoweeks-perspective_alpha_website_small.jpg')",
            filter: "brightness(0.38) saturate(1.15)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

        {/* Particles */}
        {particles.map((p) => <Particle key={p.id} style={p.style} />)}

        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 md:px-16 py-8 z-20 navbar">
          <Link href="/">
            <h1 className="text-3xl md:text-4xl font-['Bebas_Neue'] tracking-wider text-red-netflix" style={{ fontWeight: 400 }}>
              BONGUFLIX
            </h1>
          </Link>
        </nav>

        {/* Hero content */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-5">
          <h1 className="hero text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight max-w-5xl mb-6">
            <span className="fill-hover">Unlimited</span>{" "}
            <span className="fill-hover">Movies</span>
            <span className="fill-hover">,</span>{" "}
            <span className="fill-hover">TV</span>{" "}
            <span className="fill-hover">Shows</span>{" "}
            <span className="fill-hover">& More</span>
          </h1>

          <p className="subtitle text-xl md:text-2xl font-light text-white/90 mb-10">
            Watch anywhere. <span className="font-medium">Cancel anytime.</span>
          </p>

          {/* Centered Get Started */}
          <div className="form flex justify-center">
            <Link href="/auth">
              <button className="cta-btn bg-[#E50914] hover:bg-[#f40612] px-10 py-4 rounded-lg font-bold text-base md:text-lg uppercase tracking-wide cursor-pointer whitespace-nowrap">
                Get Started
              </button>
            </Link>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
      </div>
    </>
  );
}