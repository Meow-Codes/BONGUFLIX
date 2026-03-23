"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import "@fontsource/bebas-neue"; // Official Netflix-like font

// Simple floating particle
const Particle = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute rounded-full pointer-events-none" style={style} />
);

export default function Home() {
  const [username, setUsername] = useState("");
  const [focused, setFocused] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [particles, setParticles] = useState<
    { id: number; style: React.CSSProperties }[]
  >([]);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(t);
  }, []);

  const handleSubmit = async () => {
    if (!username.trim()) {
      inputRef.current?.focus();
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:6942/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username }),
      });

      if (!response.ok) {
        const err = await response.json();
        throw new Error(err.error || "Login failed");
      }

      const data = await response.json();

      if (data.success) {
        // Option A: store sessionId in localStorage (simple for demo)
        localStorage.setItem("sessionId", data.sessionId);

        // Option B: pass in URL (more stateless, but longer URL)
        // window.location.href = `http://localhost:3000${data.redirect}?sid=${data.sessionId}`;

        // We'll use localStorage for cleaner URLs
        setSubmitted(true);

        setTimeout(() => {
          window.location.href = `http://localhost:3000${data.redirect}`;
        }, 800);
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Something went wrong. Is backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSubmit();
    }
  };

  // Gentle floating particles — slower, less directional, more ambient
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

        .navbar { animation: fadeInDown 0.9s cubic-bezier(0.16,1,0.3,1) both; }
        .hero    { animation: fadeInUp 1s cubic-bezier(0.16,1,0.3,1) 0.4s both; }
        .subtitle{ animation: fadeInUp 1s cubic-bezier(0.16,1,0.3,1) 0.7s both; }
        .form    { animation: fadeInUp 1s cubic-bezier(0.16,1,0.3,1) 1s both; }

        .text-red-netflix { color: #E50914; }

        .fill-hover {
          position: relative;
          display: inline-block;
          background: linear-gradient(to right, #E50914 50%, white 50%);
          background-size: 200% 100%;
          background-position: right bottom;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          transition: background-position 0.55s cubic-bezier(0.215, 0.61, 0.355, 1);
        }

        .fill-hover:hover {
          background-position: left bottom;
        }

        .input-wrapper {
          position: relative;
        }

        .input-wrapper::after {
          content: '';
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: #E50914;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.4s cubic-bezier(0.4,0,0.2,1);
        }

        .input-wrapper.focused::after {
          transform: scaleX(1);
        }

        .cta-btn {
          transition: all 0.25s ease;
        }

        .cta-btn:hover {
          transform: translateY(-2px);
          box-shadow: 0 10px 30px rgba(229,9,20,0.45);
        }

        .cta-btn:active {
          transform: translateY(0);
        }

        .cta-btn.success {
          background: #16a34a !important;
          box-shadow: 0 0 0 0 rgba(22,163,74,0.4);
          animation: none;
        }
      `}</style>

      <div className="relative h-screen w-full text-white overflow-hidden font-['Montserrat',sans-serif]">
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage:
              "url('https://assets.nflxext.com/ffe/siteui/vlv3/9c5457b8-9ab0-4a04-9fc1-e608d5670f1a/710d74e0-7158-408e-8d9b-23c219dee5df/IN-en-20210719-popsignuptwoweeks-perspective_alpha_website_small.jpg')",
            filter: "brightness(0.38) saturate(1.15)",
          }}
        />

        {/* Soft vignette */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent pointer-events-none" />

        {/* Particles */}
        {particles.map((p) => (
          <Particle key={p.id} style={p.style} />
        ))}

        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 flex justify-between items-center px-6 md:px-16 py-8 z-20 navbar">
          <Link href="/">
            <h1
              className="text-3xl md:text-4xl font-['Bebas_Neue',cursive] tracking-wider text-red-netflix"
              style={{ fontWeight: 400 }}
            >
              BONGUFLIX
            </h1>
          </Link>
        </nav>

        {/* Hero */}
        <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-5">
          <h1 className="hero text-4xl sm:text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tight max-w-5xl mb-6">
            <span className="fill-hover">Unlimited</span>{" "}
            <span className="fill-hover">Movies</span>
            <span className="fill-hover">,</span>{" "}
            <span className="fill-hover">TV</span>{" "}
            <span className="fill-hover">Shows</span>{" "}
            <span className="fill-hover">& More</span>
          </h1>

          <p className="subtitle text-xl sm:text-xl md:text-2xl font-light text-white/90 mb-10">
            Watch anywhere. <span className="font-medium">Cancel anytime.</span>
          </p>

          <div className="form w-full max-w-xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-3 items-stretch sm:items-center">
              <div
                className={`input-wrapper flex-1 ${focused ? "focused" : ""}`}
              >
                <input
                  ref={inputRef}
                  type="text"
                  placeholder="Enter your username…"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  onFocus={() => setFocused(true)}
                  onBlur={() => setFocused(false)}
                  onKeyDown={handleKeyDown}
                  className="
          w-full px-5 py-4 
          rounded-lg 
          bg-black/65 
          border border-white/20 
          text-white text-base md:text-lg 
          placeholder-white/50 
          focus:border-[#E50914]/70 
          focus:bg-black/75 
          focus:outline-none 
          transition-all duration-200
        "
                  disabled={isLoading} // optional: disable input during loading
                />
              </div>

              <button
                onClick={handleSubmit}
                disabled={isLoading || submitted}
                className={`
        cta-btn 
        flex items-center justify-center gap-3
        px-8 py-4 
        rounded-lg 
        font-bold text-base md:text-lg 
        uppercase tracking-wide 
        cursor-pointer 
        whitespace-nowrap 
        transition-all duration-200
        disabled:cursor-not-allowed disabled:opacity-70
        ${
          isLoading
            ? "bg-[#E50914]/80"
            : submitted
              ? "bg-green-600 hover:bg-green-700"
              : "bg-[#E50914] hover:bg-[#f40612]"
        }
      `}
                style={{ minWidth: "180px" }}
              >
                {isLoading ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </>
                ) : submitted ? (
                  <>✓ Redirecting...</>
                ) : (
                  "Get Started"
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
      </div>
    </>
  );
}
