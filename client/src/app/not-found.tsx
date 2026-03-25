"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";

const Particle = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute rounded-full pointer-events-none" style={style} />
);

export default function NotFound() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [glitchActive, setGlitchActive] = useState(false);
  const [particles, setParticles] = useState<
    { id: number; style: React.CSSProperties }[]
  >([]);

  useEffect(() => {
    // Log the 404 attempt (only once on mount)
    console.error("404 Error: User attempted to access:", pathname);

    // Mount animation trigger
    const t = setTimeout(() => setMounted(true), 50);

    // Generate particles only on client (fixes hydration mismatch)
    const generatedParticles = Array.from({ length: 20 }, (_, i) => ({
      id: i,
      style: {
        width: `${Math.random() * 4 + 1}px`,
        height: `${Math.random() * 4 + 1}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        background:
          i % 4 === 0
            ? "#E50914"
            : i % 4 === 1
              ? "rgba(255,255,255,0.5)"
              : "rgba(229,9,20,0.4)",
        animation: `floatUp ${Math.random() * 8 + 6}s ease-in-out ${Math.random() * 4}s infinite`,
        opacity: Math.random() * 0.6 + 0.2,
      } as React.CSSProperties,
    }));

    setParticles(generatedParticles);

    // Random glitch effect interval
    const glitchInterval = setInterval(() => {
      setGlitchActive(true);
      setTimeout(() => setGlitchActive(false), 200);
    }, 3000);

    return () => {
      clearTimeout(t);
      clearInterval(glitchInterval);
    };
  }, [pathname]);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;600;700;900&family=Bebas+Neue&display=swap');

        * { box-sizing: border-box; }

        @keyframes floatUp {
          0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0.3; }
          33% { transform: translateY(-40px) translateX(10px); opacity: 0.8; }
          66% { transform: translateY(-20px) translateX(-8px); opacity: 0.5; }
        }

        @keyframes fadeSlideDown {
          from { opacity: 0; transform: translateY(-30px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(40px); filter: blur(4px); }
          to { opacity: 1; transform: translateY(0); filter: blur(0); }
        }

        @keyframes scanline {
          0% { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes logoGlow {
          0%, 100% { text-shadow: 0 0 20px rgba(229,9,20,0.3), 0 0 60px rgba(229,9,20,0.1); }
          50% { text-shadow: 0 0 40px rgba(229,9,20,0.6), 0 0 100px rgba(229,9,20,0.2); }
        }

        @keyframes pulseRed {
          0%, 100% { box-shadow: 0 0 0 0 rgba(229, 9, 20, 0.4); }
          50% { box-shadow: 0 0 0 12px rgba(229, 9, 20, 0); }
        }

        @keyframes glitch1 {
          0%   { clip-path: inset(10% 0 80% 0); transform: translate(-4px, 0); }
          20%  { clip-path: inset(60% 0 20% 0); transform: translate(4px, 0); }
          40%  { clip-path: inset(30% 0 50% 0); transform: translate(-2px, 0); }
          60%  { clip-path: inset(70% 0 10% 0); transform: translate(3px, 0); }
          80%  { clip-path: inset(5% 0 85% 0);  transform: translate(-3px, 0); }
          100% { clip-path: inset(40% 0 40% 0); transform: translate(0, 0); }
        }

        @keyframes glitch2 {
          0%   { clip-path: inset(50% 0 30% 0); transform: translate(4px, 0); color: #00ffff; }
          25%  { clip-path: inset(15% 0 65% 0); transform: translate(-4px, 0); color: #ff0050; }
          50%  { clip-path: inset(80% 0 5% 0);  transform: translate(2px, 0); color: #00ffff; }
          75%  { clip-path: inset(25% 0 55% 0); transform: translate(-2px, 0); color: #ff0050; }
          100% { clip-path: inset(60% 0 20% 0); transform: translate(0, 0); color: #fff; }
        }

        @keyframes bigNumEntry {
          from { opacity: 0; transform: scale(1.3) translateY(-20px); filter: blur(16px); }
          to   { opacity: 1; transform: scale(1) translateY(0);      filter: blur(0); }
        }

        @keyframes filmFlicker {
          0%, 100% { opacity: 1; }
          92%       { opacity: 1; }
          93%       { opacity: 0.85; }
          94%       { opacity: 1; }
          96%       { opacity: 0.9; }
          97%       { opacity: 1; }
        }

        .navbar-anim { animation: fadeSlideDown 0.7s cubic-bezier(0.16,1,0.3,1) both; }
        .logo-anim { font-family: 'Bebas Neue', cursive; animation: logoGlow 3s ease-in-out infinite; }

        .big-num {
          font-family: 'Bebas Neue', cursive;
          animation: bigNumEntry 1s cubic-bezier(0.16,1,0.3,1) 0.2s both, filmFlicker 5s ease-in-out 1.5s infinite;
          position: relative;
          letter-spacing: 0.02em;
        }

        .big-num::before,
        .big-num::after {
          content: '404';
          position: absolute;
          inset: 0;
          font-family: 'Bebas Neue', cursive;
          font-size: inherit;
          line-height: inherit;
        }

        .big-num.glitch::before {
          animation: glitch1 0.2s steps(2) both;
          color: #ff0050;
          left: 0;
        }
        .big-num.glitch::after {
          animation: glitch2 0.2s steps(2) both;
          color: #00ffff;
          left: 0;
        }

        .tagline-anim  { animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.7s  both; }
        .body-anim     { animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 0.9s  both; }
        .path-anim     { animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 1.05s both; }
        .cta-anim      { animation: fadeSlideUp 0.8s cubic-bezier(0.16,1,0.3,1) 1.2s  both; }

        .cta-btn {
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          background: linear-gradient(135deg, #E50914, #ff3d2e, #E50914);
          background-size: 200% 200%;
          animation: borderFlow 3s ease infinite;
        }
        .cta-btn::before {
          content: '';
          position: absolute; top: 50%; left: 50%;
          width: 0; height: 0;
          background: rgba(255,255,255,0.15);
          border-radius: 50%;
          transform: translate(-50%, -50%);
          transition: width 0.4s ease, height 0.4s ease;
        }
        .cta-btn:hover::before { width: 300px; height: 300px; }
        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 30px rgba(229,9,20,0.5);
          animation: ctaHoverPulse 1s ease-in-out infinite, borderFlow 3s ease infinite;
        }
        .cta-btn:active { transform: scale(0.97); }

        @keyframes ctaHoverPulse {
          0%, 100% { box-shadow: 0 0 0 0 rgba(229,9,20,0.4); }
          50%       { box-shadow: 0 0 0 10px rgba(229,9,20,0); }
        }

        .scanline-effect {
          position: absolute; inset: 0;
          pointer-events: none; overflow: hidden; z-index: 1;
        }
        .scanline-effect::after {
          content: '';
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(transparent, rgba(255,255,255,0.03), transparent);
          animation: scanline 6s linear infinite;
        }

        .noise-overlay {
          position: absolute; inset: 0; z-index: 2; pointer-events: none; opacity: 0.03;
          background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
          animation: staticNoise 0.5s steps(1) infinite;
        }

        @keyframes staticNoise {
          0%   { background-position: 0 0; }
          10%  { background-position: -5% -10%; }
          20%  { background-position: -15% 5%; }
          30%  { background-position: 7% -25%; }
          40%  { background-position: 20% 10%; }
          50%  { background-position: -25% 20%; }
          60%  { background-position: 15% -30%; }
          70%  { background-position: 0% 30%; }
          80%  { background-position: 25% 10%; }
          90%  { background-position: -10% 10%; }
          100% { background-position: 0 0; }
        }

        .divider-line {
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(229,9,20,0.5), rgba(255,255,255,0.2), rgba(229,9,20,0.5), transparent);
        }

        .ghost-text {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(120px, 25vw, 320px);
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          color: transparent;
          -webkit-text-stroke: 1px rgba(229,9,20,0.06);
          pointer-events: none;
          user-select: none;
          white-space: nowrap;
          z-index: 0;
          letter-spacing: 0.05em;
        }
      `}</style>

      <div
        className="relative min-h-screen w-full text-white overflow-hidden"
        style={{ fontFamily: "'Montserrat', sans-serif", background: "#0a0a0a" }}
      >
        {/* Background image — heavily dimmed */}
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "url('https://assets.nflxext.com/ffe/siteui/vlv3/9c5457b8-9ab0-4a04-9fc1-e608d5670f1a/710d74e0-7158-408e-8d9b-23c219dee5df/IN-en-20210719-popsignuptwoweeks-perspective_alpha_website_small.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            filter: "brightness(0.15) saturate(0.6)",
          }}
        />

        {/* Vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-black/70" />

        {/* Scanline + noise */}
        <div className="scanline-effect" />
        <div className="noise-overlay" />

        {/* Particles — only rendered after mount */}
        <div suppressHydrationWarning>
          {particles.map((p) => (
            <Particle key={p.id} style={p.style} />
          ))}
        </div>

        {/* Ghost watermark */}
        <div className="ghost-text" aria-hidden>404</div>

        {/* Navbar */}
        <nav className="absolute top-0 left-0 w-full flex justify-between items-center px-6 md:px-16 py-6 z-20 navbar-anim">
          <Link href="/" className="cursor-pointer">
            <h1 className="text-red-600 text-5xl tracking-widest logo-anim">
              BONGUFLIX
            </h1>
          </Link>
          <div
            className="w-2 h-2 rounded-full bg-red-500"
            style={{ animation: "pulseRed 2s ease-in-out infinite" }}
          />
        </nav>

        {/* Main content */}
        <div className="relative z-10 flex flex-col justify-center items-center min-h-screen text-center px-4 py-32">

          {/* Error badge */}
          <div
            className="tagline-anim mb-6 inline-flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-semibold uppercase tracking-widest"
            style={{
              background: "rgba(229,9,20,0.12)",
              border: "1px solid rgba(229,9,20,0.35)",
              backdropFilter: "blur(8px)",
            }}
          >
            <span
              className="w-1.5 h-1.5 rounded-full bg-red-500 inline-block"
              style={{ animation: "pulseRed 1.5s ease-in-out infinite" }}
            />
            Signal Lost
          </div>

          {/* 404 big number */}
          <div
            className={`big-num relative text-white select-none ${glitchActive ? "glitch" : ""}`}
            style={{
              fontSize: "clamp(120px, 22vw, 260px)",
              lineHeight: 0.85,
              color: "#fff",
            }}
          >
            404
          </div>

          {/* Divider */}
          <div className="body-anim w-full max-w-xs mt-6 mb-6">
            <div className="divider-line" />
          </div>

          {/* Headline */}
          <h2
            className="body-anim text-2xl md:text-3xl font-black uppercase tracking-widest text-white"
            style={{ letterSpacing: "0.15em" }}
          >
            Scene Not Found
          </h2>

          {/* Description */}
          <p className="body-anim mt-4 text-sm md:text-base font-light text-white/50 max-w-md leading-relaxed">
            Looks like this reel went missing from our vault. The page you're
            looking for doesn't exist, was removed, or took the night off.
          </p>

          {/* Attempted path pill */}
          {pathname && pathname !== "/" && (
            <div
              className="path-anim mt-5 inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-mono text-white/40"
              style={{
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.08)",
              }}
            >
              <span className="text-red-500/70">✗</span>
              <span className="truncate max-w-[240px]">{pathname}</span>
            </div>
          )}

          {/* CTA */}
          <div className="cta-anim mt-10 flex flex-col sm:flex-row gap-3 items-center">
            <Link href="/">
              <button
                className="cta-btn px-8 py-4 rounded-lg font-bold text-sm tracking-widest uppercase cursor-pointer"
                style={{ letterSpacing: "0.08em", minWidth: "180px" }}
              >
                ← Back to Home
              </button>
            </Link>

            <Link href="/">
              <button
                className="px-8 py-4 rounded-lg font-semibold text-sm tracking-widest uppercase cursor-pointer transition-all duration-200 hover:bg-white/10"
                style={{
                  letterSpacing: "0.08em",
                  minWidth: "180px",
                  background: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  backdropFilter: "blur(8px)",
                }}
              >
                Browse Content
              </button>
            </Link>
          </div>

          {/* Feature row */}
          <div className="cta-anim mt-12 flex flex-wrap justify-center gap-6 text-white/25 text-xs uppercase tracking-widest font-semibold">
            {["HD Streaming", "No Interruptions", "Cancel Anytime"].map((item, i) => (
              <span key={item} className="flex items-center gap-2">
                {i > 0 && <span className="text-red-800">·</span>}
                {item}
              </span>
            ))}
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
      </div>
    </>
  );
}