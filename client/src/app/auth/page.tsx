"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import RandomUsername from "@/utils/randomUsername";
import { RandomPassword } from "@/utils/randomPassword";
import { toast } from "react-hot-toast";
import Link from "next/link";
import {
  Eye,
  EyeOff,
  ArrowRight,
  Loader2,
  User,
  Lock,
  Shield,
} from "lucide-react";

const Particle = ({ style }: { style: React.CSSProperties }) => (
  <div className="absolute rounded-full pointer-events-none" style={style} />
);

export default function AuthPage() {
  const router = useRouter();
  const [isLogin, setIsLogin] = useState(true);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [focusedField, setFocusedField] = useState<
    "username" | "password" | null
  >(null);
  const [particles, setParticles] = useState<
    { id: number; style: React.CSSProperties }[]
  >([]);
  const [transitioning, setTransitioning] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6942";

  useEffect(() => {
    const generated = Array.from({ length: 14 }, (_, i) => ({
      id: i,
      style: {
        width: `${Math.random() * 3 + 1}px`,
        height: `${Math.random() * 3 + 1}px`,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        background: i % 3 === 0 ? "#E50914" : "rgba(255,255,255,0.3)",
        opacity: Math.random() * 0.5 + 0.1,
        animation: `gentleFloat ${Math.random() * 22 + 16}s linear ${Math.random() * 6}s infinite`,
        willChange: "transform",
      } as React.CSSProperties,
    }));
    setParticles(generated);
  }, []);

  const switchMode = (login: boolean) => {
    if (transitioning || isLogin === login) return;
    setTransitioning(true);
    setTimeout(() => {
      setIsLogin(login);
      setUsername("");
      setPassword("");
      setTransitioning(false);
    }, 220);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!username.trim() || !password.trim()) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);
    const endpoint = isLogin ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include", // ESSENTIAL for browser to save the Set-Cookie header on cross-origin
        body: JSON.stringify({
          username: username.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        if (data.error === "USERNAME_TAKEN") {
          toast.error("Username is already taken. Please choose another.");
        } else if (data.error === "INVALID_CREDENTIALS") {
          toast.error("Invalid username or password.");
        } else {
          toast.error(data.error || "Something went wrong.");
        }
        return;
      }

      // Session is now securely stored in an HttpOnly cookie automatically.

      toast.success(isLogin ? "Welcome back!" : "Account created!");

      setTimeout(() => {
        if (data.slug) {
          router.push(`/dashboard/${data.slug}`);
        } else {
          toast.error("Redirect failed - missing slug");
        }
      }, 900);
    } catch (err) {
      console.error(err);
      toast.error("Cannot connect to server. Is backend running?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleRandomFill = () => {
    const randomName = RandomUsername();
    const randomPass = RandomPassword();
    setUsername(randomName);
    setPassword(randomPass);
    setShowPassword(true);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Bebas+Neue&display=swap');

        @keyframes gentleFloat {
          0%   { transform: translate(0,0) scale(1); }
          25%  { transform: translate(14px,-18px) scale(1.1); }
          50%  { transform: translate(-10px,-30px) scale(0.95); }
          75%  { transform: translate(-20px,-6px) scale(1.05); }
          100% { transform: translate(0,0) scale(1); }
        }

        @keyframes fadeUp {
          from { opacity:0; transform: translateY(28px); filter: blur(4px); }
          to   { opacity:1; transform: translateY(0);    filter: blur(0); }
        }

        @keyframes fadeDown {
          from { opacity:0; transform: translateY(-20px); }
          to   { opacity:1; transform: translateY(0); }
        }

        @keyframes cardIn {
          from { opacity:0; transform: translateY(40px) scale(0.97); filter: blur(8px); }
          to   { opacity:1; transform: translateY(0)   scale(1);    filter: blur(0); }
        }

        @keyframes logoGlow {
          0%,100% { text-shadow: 0 0 20px rgba(229,9,20,0.25); }
          50%      { text-shadow: 0 0 50px rgba(229,9,20,0.55), 0 0 100px rgba(229,9,20,0.15); }
        }

        @keyframes pulseRed {
          0%,100% { box-shadow: 0 0 0 0 rgba(229,9,20,0.45); }
          50%      { box-shadow: 0 0 0 10px rgba(229,9,20,0); }
        }

        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }

        @keyframes shimmerBar {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }

        @keyframes contentSwap {
          from { opacity:0; transform: translateY(10px); }
          to   { opacity:1; transform: translateY(0); }
        }

        .navbar-anim { animation: fadeDown 0.8s cubic-bezier(0.16,1,0.3,1) both; }
        .card-anim   { animation: cardIn  0.9s cubic-bezier(0.16,1,0.3,1) 0.15s both; }
        .logo-anim   {
          font-family: 'Bebas Neue', cursive;
          animation: logoGlow 3s ease-in-out infinite;
        }

        .scanline-wrap {
          position: absolute; inset: 0;
          pointer-events: none; overflow: hidden; z-index: 1;
        }
        .scanline-wrap::after {
          content: '';
          position: absolute; left: 0; right: 0; height: 2px;
          background: linear-gradient(transparent, rgba(255,255,255,0.025), transparent);
          animation: scanline 7s linear infinite;
        }

        /* Tab indicator */
        .tab-indicator {
          position: absolute;
          bottom: -1px;
          height: 2px;
          background: #E50914;
          border-radius: 2px 2px 0 0;
          transition: left 0.35s cubic-bezier(0.4,0,0.2,1), width 0.35s cubic-bezier(0.4,0,0.2,1);
        }

        /* Input field */
        .field-wrap {
          position: relative;
        }
        .field-wrap .field-border {
          position: absolute;
          bottom: 0; left: 0; right: 0;
          height: 2px;
          background: #E50914;
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.35s cubic-bezier(0.4,0,0.2,1);
          border-radius: 0 0 8px 8px;
        }
        .field-wrap.active .field-border { transform: scaleX(1); }

        /* CTA button */
        .cta {
          position: relative;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.2s ease;
        }
        .cta::before {
          content: '';
          position: absolute; top:50%; left:50%;
          width:0; height:0;
          background: rgba(255,255,255,0.12);
          border-radius: 50%;
          transform: translate(-50%,-50%);
          transition: width 0.5s ease, height 0.5s ease;
        }
        .cta:not(:disabled):hover::before { width: 500px; height: 500px; }
        .cta:not(:disabled):hover {
          transform: translateY(-2px);
          box-shadow: 0 12px 36px rgba(229,9,20,0.45);
        }
        .cta:not(:disabled):active { transform: scale(0.985); }

        /* Shimmer on card load */
        .shimmer-line {
          position: relative;
          overflow: hidden;
        }
        .shimmer-line::after {
          content: '';
          position: absolute; inset: 0;
          background: linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.04) 50%, transparent 100%);
          animation: shimmerBar 2.5s ease 0.8s 1;
        }

        /* Content transition */
        .content-anim { animation: contentSwap 0.3s cubic-bezier(0.4,0,0.2,1) both; }

        /* Ghost brand text */
        .ghost-brand {
          font-family: 'Bebas Neue', cursive;
          position: absolute;
          bottom: -40px;
          right: -20px;
          font-size: 200px;
          color: transparent;
          -webkit-text-stroke: 1px rgba(229,9,20,0.04);
          pointer-events: none;
          user-select: none;
          line-height: 1;
          letter-spacing: 0.05em;
          z-index: 0;
        }

        .divider-line {
          flex: 1;
          height: 1px;
          background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
        }
      `}</style>

      <div
        className="relative min-h-screen w-full text-white overflow-hidden"
        style={{ fontFamily: "'Montserrat', sans-serif" }}
      >
        {/* Background */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('https://assets.nflxext.com/ffe/siteui/vlv3/9c5457b8-9ab0-4a04-9fc1-e608d5670f1a/710d74e0-7158-408e-8d9b-23c219dee5df/IN-en-20210719-popsignuptwoweeks-perspective_alpha_website_small.jpg')`,
            filter: "brightness(0.28) saturate(1.1)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/65 to-black/20" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-black/50" />

        {/* Scanline */}
        <div className="scanline-wrap" />

        {/* Particles */}
        {particles.map((p) => (
          <Particle key={p.id} style={p.style} />
        ))}

        {/* Navbar */}
        <nav className="absolute top-0 left-0 right-0 flex items-center px-6 md:px-16 py-7 z-20 navbar-anim">
          <Link href="/">
            <h1 className="text-red-600 text-4xl tracking-widest logo-anim">
              BONGUFLIX
            </h1>
          </Link>
          <div className="ml-auto flex items-center gap-2">
            <div
              className="w-2 h-2 rounded-full bg-red-500"
              style={{ animation: "pulseRed 2s ease-in-out infinite" }}
            />
            <span className="text-white/30 text-xs font-medium uppercase tracking-widest hidden sm:block">
              {isLogin ? "Sign In" : "Register"}
            </span>
          </div>
        </nav>

        {/* Auth Card - YOUR FULL BEAUTIFUL UI KEPT INTACT */}
        <div className="relative z-10 flex items-center justify-center min-h-screen px-4 py-28">
          <div
            ref={cardRef}
            className="card-anim shimmer-line w-full max-w-md relative"
            style={{
              background: "rgba(10,10,10,0.88)",
              border: "1px solid rgba(255,255,255,0.08)",
              borderRadius: "20px",
              backdropFilter: "blur(24px)",
              boxShadow:
                "0 32px 80px rgba(0,0,0,0.7), 0 0 0 1px rgba(255,255,255,0.04) inset",
              overflow: "hidden",
            }}
          >
            {/* Ghost brand watermark */}
            <div className="ghost-brand" aria-hidden>
              BF
            </div>

            {/* Top accent bar */}
            <div
              className="absolute top-0 left-0 right-0 h-[2px]"
              style={{
                background:
                  "linear-gradient(90deg, transparent, #E50914 30%, #ff6b35 50%, #E50914 70%, transparent)",
              }}
            />

            <div className="relative z-10 p-8 md:p-10">
              {/* Tab switcher */}
              <div className="relative flex border-b border-white/10 mb-8">
                <div
                  className="tab-indicator"
                  style={{
                    left: isLogin ? "0" : "50%",
                    width: "50%",
                  }}
                />
                {[
                  {
                    label: "Sign In",
                    active: isLogin,
                    action: () => switchMode(true),
                  },
                  {
                    label: "Create Account",
                    active: !isLogin,
                    action: () => switchMode(false),
                  },
                ].map((tab) => (
                  <button
                    key={tab.label}
                    onClick={tab.action}
                    className="flex-1 pb-4 text-sm font-semibold uppercase tracking-widest transition-all duration-300 cursor-pointer"
                    style={{
                      color: tab.active ? "#fff" : "rgba(255,255,255,0.3)",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Heading */}
              <div className={`mb-7 ${transitioning ? "" : "content-anim"}`}>
                <h2
                  className="text-2xl font-black tracking-tight"
                  style={{ letterSpacing: "-0.01em" }}
                >
                  {isLogin ? "Welcome back" : "Join BONGUFLIX"}
                </h2>
                <p className="mt-1.5 text-sm text-white/40 font-light">
                  {isLogin
                    ? "Sign in to continue watching"
                    : "Create your account to start streaming"}
                </p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Username field */}
                <div
                  className={`field-wrap ${focusedField === "username" ? "active" : ""}`}
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
                    style={{
                      background:
                        focusedField === "username"
                          ? "rgba(229,9,20,0.06)"
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${focusedField === "username" ? "rgba(229,9,20,0.35)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <User
                      size={16}
                      style={{
                        color:
                          focusedField === "username"
                            ? "#E50914"
                            : "rgba(255,255,255,0.25)",
                        flexShrink: 0,
                        transition: "color 0.2s",
                      }}
                    />
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      onFocus={() => setFocusedField("username")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Username"
                      disabled={isLoading}
                      required
                      className="flex-1 bg-transparent text-white text-sm placeholder-white/25 focus:outline-none"
                      style={{ caretColor: "#E50914" }}
                    />
                  </div>
                  <div className="field-border" />
                </div>

                {/* Password field */}
                <div
                  className={`field-wrap ${focusedField === "password" ? "active" : ""}`}
                >
                  <div
                    className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-200"
                    style={{
                      background:
                        focusedField === "password"
                          ? "rgba(229,9,20,0.06)"
                          : "rgba(255,255,255,0.04)",
                      border: `1px solid ${focusedField === "password" ? "rgba(229,9,20,0.35)" : "rgba(255,255,255,0.08)"}`,
                    }}
                  >
                    <Lock
                      size={16}
                      style={{
                        color:
                          focusedField === "password"
                            ? "#E50914"
                            : "rgba(255,255,255,0.25)",
                        flexShrink: 0,
                        transition: "color 0.2s",
                      }}
                    />
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      onFocus={() => setFocusedField("password")}
                      onBlur={() => setFocusedField(null)}
                      placeholder="Password"
                      disabled={isLoading}
                      required
                      className="flex-1 bg-transparent text-white text-sm placeholder-white/25 focus:outline-none"
                      style={{ caretColor: "#E50914" }}
                      autoComplete={isLogin ? "current-password" : "new-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="transition-colors duration-200 flex-shrink-0 cursor-pointer"
                      style={{
                        color: showPassword
                          ? "#E50914"
                          : "rgba(255,255,255,0.25)",
                      }}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                  <div className="field-border" />
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="cta w-full py-4 rounded-xl font-bold text-sm uppercase tracking-widest disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    style={{
                      background: isLoading ? "rgba(229,9,20,0.7)" : "#E50914",
                      letterSpacing: "0.1em",
                    }}
                  >
                    {isLoading ? (
                      <span className="flex items-center justify-center gap-2.5">
                        <Loader2 size={16} className="animate-spin" />
                        {isLogin ? "Signing In…" : "Creating Account…"}
                      </span>
                    ) : (
                      <span className="flex items-center justify-center gap-2.5">
                        {isLogin ? "Sign In" : "Create Account"}
                        <ArrowRight size={15} />
                      </span>
                    )}
                  </button>
                </div>
              </form>

              {/* Divider */}
              <div className="flex items-center gap-3 my-6">
                <div className="divider-line" />
                <span className="text-white/20 text-xs uppercase tracking-widest font-semibold whitespace-nowrap">
                  {isLogin ? "New here?" : "Have an account?"}
                </span>
                <div className="divider-line" />
              </div>

              {/* Secondary CTA */}
              <button
                onClick={() => switchMode(!isLogin)}
                disabled={transitioning}
                className="w-full py-3.5 rounded-xl text-sm font-semibold transition-all duration-200 hover:bg-white/8 active:scale-[0.99] cursor-pointer"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.08)",
                  color: "rgba(255,255,255,0.7)",
                }}
              >
                {isLogin ? "Create a free account" : "Sign in to your account"}
              </button>

              {/* Random Fill */}
              {!isLogin && (
                <div className="mt-6 flex items-center justify-center gap-4 text-white/20 text-xs">
                  <button
                    onClick={handleRandomFill}
                    className="flex items-center gap-1.5 transition-colors duration-200 hover:text-white/40 cursor-pointer"
                  >
                    <Shield size={11} />
                    Auto Fill Username and Password?
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Bottom fade */}
        <div className="absolute bottom-0 left-0 right-0 h-28 bg-gradient-to-t from-black to-transparent pointer-events-none z-10" />
      </div>
    </>
  );
}
