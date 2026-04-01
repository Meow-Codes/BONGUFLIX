"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  ChevronLeft,
  Database,
  Shield,
  Monitor,
  Cpu,
  Cloud,
  EyeOff,
} from "lucide-react";
import { FaLinkedin as LinkedIn, FaGithub as GitHub, FaTwitter as Twitter, FaInstagram as Insta } from "react-icons/fa";

// ─── Team data ────────────────────────────────────────────────────────────────

type SocialType = "linkedin" | "github" | "twitter" | "instagram";

type Member = {
  name: string;
  role: string;
  image: string;
  linkedin: string;
  github: string;
  social: { type: SocialType; url: string };
};

const TEAM: Member[] = [
  {
    name: "KV Modak",
    role: "ML",
    image: "https://static.wikia.nocookie.net/jujutsu-kaisen/images/5/53/GojoP.png",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    social: { type: "twitter", url: "https://twitter.com" },
  },
  {
    name: "Barghav B R",
    role: "Backend · Database",
    image: "https://static.wikia.nocookie.net/jujutsu-kaisen/images/6/64/YujiP.png",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    social: { type: "instagram", url: "https://instagram.com" },
  },
  {
    name: "Rishik N",
    role: "ML · Recommendation Engine",
    image: "https://static.wikia.nocookie.net/jujutsu-kaisen/images/e/e4/TojiFushiguroP.png",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    social: { type: "twitter", url: "https://twitter.com" },
  },
  {
    name: "Aneesh P",
    role: "ML · Recommendation Engine",
    image: "https://static.wikia.nocookie.net/jujutsu-kaisen/images/6/65/YutaOkkotsuP_%28Second-Year%29.png",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    social: { type: "instagram", url: "https://instagram.com" },
  },
  {
    name: "Rithwik M",
    role: "Frontend · UI/UX · Backend",
    image: "https://static.wikia.nocookie.net/jujutsu-kaisen/images/3/3a/SukunaP.png",
    linkedin: "https://linkedin.com",
    github: "https://github.com",
    social: { type: "twitter", url: "https://twitter.com" },
  },
];

const OBJECTIVES = [
  {
    icon: Database,
    title: "Data Engineering",
    desc: "Ingest and normalise 10,000+ movies & TV shows from Kaggle CSV into a relational Postgres schema with genres, cast, and ratings.",
  },
  {
    icon: Shield,
    title: "Secure Auth",
    desc: "Session management with secure tokens, preventing XSS attacks and unauthorised access across the platform.",
  },
  {
    icon: Monitor,
    title: "Netflix-grade UI",
    desc: "Keyboard-navigable carousels, hero banner, smooth hover states, modal detail view — all matching Netflix's design language.",
  },
  {
    icon: Cpu,
    title: "Recommendation Engine",
    desc: "Personalised movie suggestions based on user history, stored in JSONB preferences and served via a dedicated API.",
  },
  {
    icon: Cloud,
    title: "Cloud Deployment",
    desc: "Backend on Render with Render Postgres, frontend on Vercel — fully CI/CD with GitHub integration.",
  },
  {
    icon: EyeOff,
    title: "Content Safety",
    desc: "Frontend content filter stripping adult-rated material before display, using certification codes and keyword heuristics.",
  },
];

// ─── Social icon map ──────────────────────────────────────────────────────────

const SocialIcon = ({ type, size = 14 }: { type: SocialType; size?: number }) => {
  if (type === "linkedin")  return <LinkedIn size={size} />;
  if (type === "github")    return <GitHub    size={size} />;
  if (type === "twitter")   return <Twitter   size={size} />;
  if (type === "instagram") return <Insta size={size} />;
  return null;
};

// ─── MemberCard ───────────────────────────────────────────────────────────────

function MemberCard({ member, index }: { member: Member; index: number }) {
  const [hovered, setHovered] = useState(false);
  const [imgError, setImgError] = useState(!member.image);

  const initials = member.name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Deterministic hue from name
  const hue = member.name
    .split("")
    .reduce((acc, c) => acc + c.charCodeAt(0), 0) % 360;

  return (
    <div
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        position: "relative",
        borderRadius: "14px",
        overflow: "hidden",
        background: "#0f0f0f",
        border: `1px solid ${hovered ? "rgba(229,9,20,0.35)" : "rgba(255,255,255,0.07)"}`,
        transition: "transform 0.32s cubic-bezier(0.4,0,0.2,1), box-shadow 0.32s ease, border-color 0.22s",
        transform: hovered ? "translateY(-6px)" : "translateY(0)",
        boxShadow: hovered
          ? "0 20px 56px rgba(0,0,0,0.75), 0 0 0 1px rgba(229,9,20,0.15)"
          : "0 6px 24px rgba(0,0,0,0.45)",
        animation: `cardRise 0.55s cubic-bezier(0.16,1,0.3,1) ${index * 0.08}s both`,
      }}
    >
      {/* Photo area */}
      <div style={{ position: "relative", aspectRatio: "1/1", overflow: "hidden", background: `linear-gradient(135deg, hsl(${hue},30%,12%), #0a0a0a)` }}>
        {!imgError && member.image ? (
          <img
            src={member.image}
            alt={member.name}
            onError={() => setImgError(true)}
            style={{
              width: "100%", height: "100%", objectFit: "cover",
              objectPosition: "top center", display: "block",
              transition: "transform 0.4s ease",
              transform: hovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        ) : (
          <div style={{
            width: "100%", height: "100%",
            display: "flex", alignItems: "center", justifyContent: "center",
          }}>
            <span style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "clamp(36px, 5vw, 52px)",
              letterSpacing: "0.05em",
              color: `hsl(${hue},45%,55%)`,
              opacity: 0.9,
            }}>
              {initials}
            </span>
          </div>
        )}

        {/* Bottom fade */}
        <div style={{
          position: "absolute", inset: 0,
          background: "linear-gradient(to top, #0f0f0f 0%, transparent 55%)",
        }} />

        {/* Red top accent line — only on hover */}
        <div style={{
          position: "absolute", top: 0, left: 0, right: 0, height: "2px",
          background: "linear-gradient(to right, transparent, #E50914, transparent)",
          opacity: hovered ? 1 : 0,
          transition: "opacity 0.25s ease",
        }} />
      </div>

      {/* Info */}
      <div style={{ padding: "16px 18px 18px" }}>
        <h3 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: "15px", fontWeight: 700,
          color: "#fff", marginBottom: "4px",
          letterSpacing: "-0.01em", lineHeight: 1.2,
        }}>
          {member.name}
        </h3>
        <p style={{
          fontSize: "11px", fontWeight: 500,
          color: "rgba(255,255,255,0.38)",
          letterSpacing: "0.07em", textTransform: "uppercase",
          marginBottom: "16px",
        }}>
          {member.role}
        </p>

        {/* Social links */}
        <div style={{ display: "flex", gap: "8px" }}>
          {[
            { href: member.linkedin, icon: <LinkedIn size={13} />, label: "LinkedIn" },
            { href: member.github,   icon: <GitHub   size={13} />, label: "GitHub"   },
            { href: member.social.url, icon: <SocialIcon type={member.social.type} size={13} />, label: member.social.type },
          ].map(({ href, icon, label }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              title={label}
              style={{
                width: "30px", height: "30px",
                borderRadius: "8px",
                background: "rgba(255,255,255,0.05)",
                border: "1px solid rgba(255,255,255,0.1)",
                display: "flex", alignItems: "center", justifyContent: "center",
                color: "rgba(255,255,255,0.5)",
                textDecoration: "none",
                transition: "background 0.18s, color 0.18s, border-color 0.18s, transform 0.18s",
              }}
              onMouseEnter={(e) => {
                const el = e.currentTarget;
                el.style.background = "rgba(229,9,20,0.15)";
                el.style.borderColor = "rgba(229,9,20,0.4)";
                el.style.color = "#fff";
                el.style.transform = "translateY(-2px)";
              }}
              onMouseLeave={(e) => {
                const el = e.currentTarget;
                el.style.background = "rgba(255,255,255,0.05)";
                el.style.borderColor = "rgba(255,255,255,0.1)";
                el.style.color = "rgba(255,255,255,0.5)";
                el.style.transform = "translateY(0)";
              }}
            >
              {icon}
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function AboutNav() {
  const searchParams = useSearchParams();
  const returnTo = searchParams?.get("returnTo") ?? null;
  const backHref =
    returnTo && returnTo.startsWith("/") && !returnTo.startsWith("//")
      ? returnTo
      : "/";
  const backLabel = returnTo?.startsWith("/dashboard") ? "Dashboard" : "Home";

  return (
    <nav style={{
      position: "fixed", top: 0, left: 0, right: 0, zIndex: 100,
      height: "64px", padding: "0 4%",
      display: "flex", alignItems: "center", gap: "20px",
      background: "rgba(8,8,8,0.94)",
      backdropFilter: "blur(14px)",
      borderBottom: "1px solid rgba(255,255,255,0.05)",
      animation: "navIn 0.6s ease both",
    }}>
      <Link href="/" style={{ textDecoration: "none" }}>
        <span style={{
          fontFamily: "'Bebas Neue', cursive",
          fontSize: "26px", color: "#E50914",
          letterSpacing: "0.14em",
          animation: "logoGlow 3.5s ease-in-out infinite",
        }}>BONGUFLIX</span>
      </Link>

      <Link href={backHref} className="nav-back">
        <ChevronLeft size={14} />
        {backLabel}
      </Link>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "9px" }}>
        <div style={{
          width: "7px", height: "7px", borderRadius: "50%", background: "#E50914",
          animation: "pulseRed 2.2s ease-in-out infinite",
        }} />
        <span style={{ fontSize: "11px", color: "rgba(255,255,255,0.3)", textTransform: "uppercase", letterSpacing: "0.12em", fontWeight: 500 }}>
          About
        </span>
      </div>
    </nav>
  );
}

export default function AboutPage() {
  const [particles, setParticles] = useState<{ id: number; style: React.CSSProperties }[]>([]);

  useEffect(() => {
    setParticles(
      Array.from({ length: 18 }, (_, i) => ({
        id: i,
        style: {
          position: "absolute" as const,
          width: `${Math.random() * 2.5 + 1}px`,
          height: `${Math.random() * 2.5 + 1}px`,
          left: `${Math.random() * 100}%`,
          top: `${Math.random() * 100}%`,
          background: i % 4 === 0 ? "#E50914" : "rgba(255,255,255,0.2)",
          borderRadius: "50%",
          opacity: Math.random() * 0.35 + 0.08,
          animation: `gentleFloat ${Math.random() * 22 + 16}s linear ${Math.random() * 6}s infinite`,
          pointerEvents: "none" as const,
        },
      }))
    );
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;900&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        @keyframes gentleFloat {
          0%,100% { transform: translate(0,0); }
          33%      { transform: translate(14px,-18px); }
          66%      { transform: translate(-10px,-8px); }
        }
        @keyframes navIn    { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes heroIn   { from{opacity:0;transform:translateY(26px)} to{opacity:1;transform:translateY(0)} }
        @keyframes cardRise { from{opacity:0;transform:translateY(22px) scale(0.97)} to{opacity:1;transform:translateY(0) scale(1)} }
        @keyframes logoGlow { 0%,100%{text-shadow:0 0 20px rgba(229,9,20,.3)} 50%{text-shadow:0 0 50px rgba(229,9,20,.7)} }
        @keyframes pulseRed { 0%,100%{box-shadow:0 0 0 0 rgba(229,9,20,.45)} 50%{box-shadow:0 0 0 7px rgba(229,9,20,0)} }

        .nav-back {
          display: inline-flex; align-items: center; gap: 5px;
          background: none; border: none;
          color: rgba(255,255,255,0.5); font-family: 'Outfit', sans-serif;
          font-size: 13px; font-weight: 500; cursor: pointer;
          padding: 6px 10px; border-radius: 7px;
          transition: color 0.16s, background 0.16s;
          text-decoration: none;
        }
        .nav-back:hover { color: #fff; background: rgba(255,255,255,0.07); }

        .obj-card {
          background: rgba(255,255,255,0.025);
          border: 1px solid rgba(255,255,255,0.07);
          border-radius: 12px;
          padding: 22px 24px;
          transition: border-color 0.2s, background 0.2s, transform 0.25s;
        }
        .obj-card:hover {
          border-color: rgba(229,9,20,0.28);
          background: rgba(229,9,20,0.03);
          transform: translateY(-3px);
        }
        .obj-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(229,9,20,0.1); border: 1px solid rgba(229,9,20,0.2);
          display: flex; align-items: center; justify-content: center;
          color: #E50914; margin-bottom: 14px;
          flex-shrink: 0;
        }

        /* 5-col grid — falls back gracefully */
        .team-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 18px;
        }
        @media (max-width: 1100px) { .team-grid { grid-template-columns: repeat(3, 1fr); } }
        @media (max-width: 700px)  { .team-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 420px)  { .team-grid { grid-template-columns: 1fr; } }

        .obj-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 16px;
        }
        @media (max-width: 900px) { .obj-grid { grid-template-columns: repeat(2, 1fr); } }
        @media (max-width: 560px) { .obj-grid { grid-template-columns: 1fr; } }

        .section-divider {
          height: 1px;
          background: linear-gradient(to right, transparent, rgba(255,255,255,0.08), transparent);
          margin: 60px 0;
        }
      `}</style>

      <div style={{
        minHeight: "100vh",
        background: "#080808",
        fontFamily: "'Outfit', sans-serif",
        color: "#fff",
        position: "relative",
        overflowX: "hidden",
      }}>
        {/* Fixed bg */}
        <div style={{
          position: "fixed", inset: 0,
          backgroundImage: "url('https://assets.nflxext.com/ffe/siteui/vlv3/9c5457b8-9ab0-4a04-9fc1-e608d5670f1a/710d74e0-7158-408e-8d9b-23c219dee5df/IN-en-20210719-popsignuptwoweeks-perspective_alpha_website_small.jpg')",
          backgroundSize: "cover", backgroundPosition: "center",
          filter: "brightness(0.06) saturate(0.3)",
          pointerEvents: "none",
        }} />
        <div style={{
          position: "fixed", inset: 0,
          background: "linear-gradient(to bottom, rgba(8,8,8,0.5), rgba(8,8,8,0.97))",
          pointerEvents: "none",
        }} />

        {/* Particles */}
        <div style={{ position: "fixed", inset: 0, pointerEvents: "none" }}>
          {particles.map((p) => <div key={p.id} style={p.style} />)}
        </div>

        <Suspense fallback={null}>
          <AboutNav />
        </Suspense>

        {/* Page content */}
        <div style={{
          position: "relative", zIndex: 1,
          maxWidth: "1280px", margin: "0 auto",
          padding: "104px 5% 80px",
        }}>

          {/* ── Hero ── */}
          <div style={{ textAlign: "center", marginBottom: "64px", animation: "heroIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.1s both" }}>
            <div style={{
              display: "inline-flex", alignItems: "center", gap: "8px",
              padding: "5px 16px", borderRadius: "20px",
              background: "rgba(229,9,20,0.1)", border: "1px solid rgba(229,9,20,0.25)",
              marginBottom: "22px",
            }}>
              <div style={{
                width: "6px", height: "6px", borderRadius: "50%", background: "#E50914",
                animation: "pulseRed 1.6s ease-in-out infinite",
              }} />
              <span style={{ fontSize: "11px", fontWeight: 600, letterSpacing: "0.12em", textTransform: "uppercase", color: "rgba(255,255,255,0.75)" }}>
                CS205 · Graph Theory Project · 2025
              </span>
            </div>

            <h1 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "clamp(52px, 9vw, 96px)",
              letterSpacing: "0.06em", lineHeight: 0.88,
              marginBottom: "20px",
            }}>
              BONGU<span style={{ color: "#E50914" }}>FLIX</span>
            </h1>

            <p style={{
              fontSize: "clamp(14px, 1.3vw, 17px)",
              color: "rgba(255,255,255,0.48)",
              maxWidth: "620px", margin: "0 auto 14px",
              lineHeight: 1.75, fontWeight: 300,
            }}>
              A full-stack streaming platform built from scratch — featuring a PostgreSQL database of 10,000+ titles, real-time session auth, content recommendation engine, and a pixel-perfect Netflix-inspired interface.
            </p>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.22)", letterSpacing: "0.06em" }}>
              Next.js 16 · Express · PostgreSQL · TMDB API · Render · Vercel
            </p>
          </div>

          <div className="section-divider" />

          {/* ── Objectives ── */}
          <div style={{ animation: "heroIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.2s both", marginBottom: "64px" }}>
            <h2 style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "26px", letterSpacing: "0.1em",
              color: "rgba(255,255,255,0.85)",
              marginBottom: "28px",
            }}>
              Project Objectives
            </h2>

            <div className="obj-grid">
              {OBJECTIVES.map(({ icon: Icon, title, desc }) => (
                <div key={title} className="obj-card">
                  <div className="obj-icon"><Icon size={18} /></div>
                  <h3 style={{ fontSize: "14px", fontWeight: 700, color: "#fff", marginBottom: "8px", letterSpacing: "0.01em" }}>
                    {title}
                  </h3>
                  <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)", lineHeight: 1.7, margin: 0 }}>
                    {desc}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="section-divider" />

          {/* ── Team ── */}
          <div style={{ animation: "heroIn 0.8s cubic-bezier(0.16,1,0.3,1) 0.35s both" }}>
            <div style={{ marginBottom: "32px" }}>
              <h2 style={{
                fontFamily: "'Bebas Neue', cursive",
                fontSize: "26px", letterSpacing: "0.1em",
                color: "rgba(255,255,255,0.85)",
                marginBottom: "6px",
              }}>
                The Team
              </h2>
              <p style={{ fontSize: "13px", color: "rgba(255,255,255,0.3)", fontWeight: 400 }}>
                Five people. One platform.
              </p>
            </div>

            <div className="team-grid">
              {TEAM.map((member, i) => (
                <MemberCard key={member.name} member={member} index={i} />
              ))}
            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{
            marginTop: "80px", textAlign: "center",
            borderTop: "1px solid rgba(255,255,255,0.05)",
            paddingTop: "40px",
          }}>
            <div style={{
              fontFamily: "'Bebas Neue', cursive",
              fontSize: "18px", color: "rgba(229,9,20,0.5)",
              letterSpacing: "0.15em", marginBottom: "10px",
            }}>
              BONGUFLIX
            </div>
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.18)", lineHeight: 1.9 }}>
              Built by 5 IIIT Dharwad students.<br />
              All content metadata belongs to respective rights holders.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}