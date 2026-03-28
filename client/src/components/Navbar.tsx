"use client";

import Link from "next/link";
import { Search, Bell, ChevronDown } from "lucide-react";

interface UserData {
  username: string;
  slug: string;
  randomSeed: number;
}

interface NavbarProps {
  user: UserData;
  slug: string;
  scrolled: boolean;
  onSearch: () => void;
}

const NAV_LINKS = ["Home", "TV Shows", "Movies", "New & Popular", "My List"];

export const Navbar = ({ user, slug, scrolled, onSearch }: NavbarProps) => {
  const avatarHue = user.randomSeed % 360;

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700&display=swap');

        .bongu-navbar {
          position: fixed;
          top: 0; left: 0; right: 0;
          z-index: 200;
          height: 68px;
          padding: 0 4%;
          display: flex;
          align-items: center;
          gap: 0;
          font-family: 'Outfit', sans-serif;
          transition: background 0.45s ease, backdrop-filter 0.45s ease, box-shadow 0.45s ease;
          animation: navSlide 0.7s cubic-bezier(0.16,1,0.3,1) both;
        }
        .bongu-navbar.scrolled {
          background: rgba(14,14,14,0.97);
          backdrop-filter: blur(18px);
          box-shadow: 0 1px 0 rgba(255,255,255,0.06);
        }
        .bongu-navbar.top {
          background: linear-gradient(to bottom, rgba(0,0,0,0.82) 0%, transparent 100%);
        }

        @keyframes navSlide {
          from { opacity: 0; transform: translateY(-20px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .bongu-logo {
          font-family: 'Bebas Neue', cursive;
          font-size: clamp(22px, 2.4vw, 30px);
          letter-spacing: 0.14em;
          color: #E50914;
          flex-shrink: 0;
          cursor: pointer;
          text-decoration: none;
          animation: logoGlow 3.5s ease-in-out infinite;
          transition: transform 0.2s ease;
        }
        .bongu-logo:hover { transform: scale(1.04); }
        @keyframes logoGlow {
          0%,100% { text-shadow: 0 0 18px rgba(229,9,20,0.25); }
          50%      { text-shadow: 0 0 50px rgba(229,9,20,0.65), 0 0 90px rgba(229,9,20,0.2); }
        }

        .nav-links {
          display: flex;
          gap: 4px;
          margin-left: 32px;
        }
        .nav-link-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.72);
          font-family: 'Outfit', sans-serif;
          font-size: clamp(11px, 0.85vw, 13px);
          font-weight: 500;
          cursor: pointer;
          padding: 6px 10px;
          border-radius: 5px;
          transition: color 0.18s ease, background 0.18s ease;
          white-space: nowrap;
          letter-spacing: 0.01em;
        }
        .nav-link-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.07);
        }

        .nav-right {
          margin-left: auto;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .nav-icon-btn {
          background: none;
          border: none;
          color: rgba(255,255,255,0.72);
          cursor: pointer;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: color 0.18s, background 0.18s;
        }
        .nav-icon-btn:hover {
          color: #fff;
          background: rgba(255,255,255,0.1);
        }

        .nav-avatar-wrap {
          display: flex;
          align-items: center;
          gap: 6px;
          cursor: pointer;
          padding: 5px 8px;
          border-radius: 8px;
          transition: background 0.18s;
          margin-left: 4px;
        }
        .nav-avatar-wrap:hover { background: rgba(255,255,255,0.07); }

        .nav-avatar {
          width: 32px;
          height: 32px;
          border-radius: 6px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 700;
          font-size: 14px;
          color: #fff;
          font-family: 'Outfit', sans-serif;
          flex-shrink: 0;
          position: relative;
          overflow: hidden;
        }
        .nav-avatar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
        }

        .nav-chevron {
          color: rgba(255,255,255,0.55);
          transition: transform 0.22s ease;
          flex-shrink: 0;
        }
        .nav-avatar-wrap:hover .nav-chevron { transform: rotate(180deg); }

        /* Notification dot */
        .bell-wrap { position: relative; }
        .bell-dot {
          position: absolute;
          top: 6px; right: 6px;
          width: 7px; height: 7px;
          border-radius: 50%;
          background: #E50914;
          border: 1.5px solid #0e0e0e;
          animation: dotPulse 2.5s ease-in-out infinite;
        }
        @keyframes dotPulse {
          0%,100% { box-shadow: 0 0 0 0 rgba(229,9,20,0.5); }
          50%      { box-shadow: 0 0 0 5px rgba(229,9,20,0); }
        }
      `}</style>

      <nav className={`bongu-navbar ${scrolled ? "scrolled" : "top"}`}>
        <Link href={`/dashboard/${slug}`} className="bongu-logo">
          BONGUFLIX
        </Link>

        <div className="nav-links">
          {NAV_LINKS.map((label) => (
            <button key={label} className="nav-link-btn">{label}</button>
          ))}
        </div>

        <div className="nav-right">
          <button className="nav-icon-btn" onClick={onSearch} aria-label="Search">
            <Search size={18} />
          </button>

          <div className="nav-icon-btn bell-wrap" style={{ position: "relative" }}>
            <button className="nav-icon-btn" style={{ width: "100%", height: "100%" }}>
              <Bell size={18} />
            </button>
            <span className="bell-dot" />
          </div>

          <div className="nav-avatar-wrap">
            <div
              className="nav-avatar"
              style={{ background: `hsl(${avatarHue},55%,32%)` }}
            >
              {user.username[0].toUpperCase()}
            </div>
            <ChevronDown size={14} className="nav-chevron" />
          </div>
        </div>
      </nav>
    </>
  );
};