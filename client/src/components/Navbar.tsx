"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useRef, useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Bell, ChevronDown, LogOut, UserCircle, SlidersHorizontal, Trash2, ImageIcon } from "lucide-react";
import toast from "react-hot-toast";
import type { UserResponse } from "@/utils/api";
import { flushPreferencesApi, logoutApi } from "@/utils/api";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface NavbarProps {
  user: UserResponse;
  slug: string;
  scrolled: boolean;
  onSearch: () => void;
}

const scrollToRow = (rowId: string) => {
  if (typeof document === "undefined") return;
  document.getElementById(`row-${rowId}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
};

export const Navbar = ({ user, slug, scrolled, onSearch }: NavbarProps) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [menuOpen, setMenuOpen] = useState(false);
  const [flushOpen, setFlushOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  const avatarHue = user.randomSeed % 360;
  const profileSrc = user.profilePic?.trim() || null;

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setMenuOpen(false);
    };
    document.addEventListener("click", close);
    return () => document.removeEventListener("click", close);
  }, []);

  const aboutHref = `/about-us?returnTo=${encodeURIComponent(`/dashboard/${slug}`)}`;

  const handleLogout = async () => {
    try {
      await logoutApi();
      toast.success("Signed out");
      router.push("/auth");
    } catch {
      toast.error("Could not sign out");
    }
    setMenuOpen(false);
  };

  const runFlush = async () => {
    try {
      await flushPreferencesApi(slug);
      toast.success("Preferences cleared");
      setFlushOpen(false);
      setMenuOpen(false);
      void queryClient.invalidateQueries({ queryKey: ["home", slug] });
      void queryClient.invalidateQueries({ queryKey: ["user", slug] });
      router.push(`/onboarding/${slug}?force=1`);
    } catch {
      toast.error("Could not clear preferences");
    }
  };

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
          flex-wrap: wrap;
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
          position: relative;
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
          object-fit: cover;
        }
        .nav-avatar::after {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(135deg, rgba(255,255,255,0.15), transparent);
          pointer-events: none;
        }

        .nav-chevron {
          color: rgba(255,255,255,0.55);
          transition: transform 0.22s ease;
          flex-shrink: 0;
        }
        .nav-avatar-wrap.menu-open .nav-chevron { transform: rotate(180deg); }

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

        .profile-dropdown {
          position: absolute;
          top: calc(100% + 8px);
          right: 0;
          min-width: 220px;
          background: rgba(20,20,20,0.98);
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 10px;
          padding: 8px 0;
          box-shadow: 0 24px 60px rgba(0,0,0,0.85);
          z-index: 300;
          animation: ddIn 0.18s ease both;
        }
        @keyframes ddIn {
          from { opacity: 0; transform: translateY(-6px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .profile-dd-item {
          display: flex;
          align-items: center;
          gap: 10px;
          width: 100%;
          padding: 10px 16px;
          border: none;
          background: none;
          color: rgba(255,255,255,0.88);
          font-family: 'Outfit', sans-serif;
          font-size: 13px;
          font-weight: 500;
          cursor: pointer;
          text-align: left;
          text-decoration: none;
          transition: background 0.15s, color 0.15s;
        }
        .profile-dd-item:hover {
          background: rgba(255,255,255,0.06);
          color: #fff;
        }
        .profile-dd-item.danger { color: #ff6b6b; }
        .profile-dd-item.danger:hover { background: rgba(229,9,20,0.12); }
        .profile-dd-divider {
          height: 1px;
          background: rgba(255,255,255,0.08);
          margin: 6px 0;
        }
      `}</style>

      <nav className={`bongu-navbar ${scrolled ? "scrolled" : "top"}`}>
        <Link href={`/dashboard/${slug}`} className="bongu-logo">
          BONGUFLIX
        </Link>

        <div className="nav-links">
          <button type="button" className="nav-link-btn" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}>
            Home
          </button>
          <button type="button" className="nav-link-btn" onClick={() => scrollToRow("trending_tv")}>
            TV Shows
          </button>
          <button type="button" className="nav-link-btn" onClick={() => scrollToRow("trending_movies")}>
            Movies
          </button>
          <button type="button" className="nav-link-btn" onClick={() => scrollToRow("new_movies")}>
            New & Popular
          </button>
          <button
            type="button"
            className="nav-link-btn"
            onClick={() => toast("My List is coming soon.", { icon: "📋" })}
          >
            My List
          </button>
          <Link href={aboutHref} className="nav-link-btn" style={{ textDecoration: "none" }}>
            About Us
          </Link>
        </div>

        <div className="nav-right">
          <button className="nav-icon-btn" onClick={onSearch} aria-label="Search">
            <Search size={18} />
          </button>

          <div className="nav-icon-btn bell-wrap" style={{ position: "relative" }}>
            <button
              type="button"
              className="nav-icon-btn"
              style={{ width: "100%", height: "100%" }}
              aria-label="Notifications"
              onClick={() => toast("No new notifications yet.", { icon: "🔔" })}
            >
              <Bell size={18} />
            </button>
            <span className="bell-dot" />
          </div>

          <div
            ref={wrapRef}
            className={`nav-avatar-wrap ${menuOpen ? "menu-open" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              setMenuOpen((o) => !o);
            }}
          >
            {profileSrc ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img className="nav-avatar" src={profileSrc} alt="" width={32} height={32} />
            ) : (
              <div
                className="nav-avatar"
                style={{ background: `hsl(${avatarHue},55%,32%)` }}
              >
                {user.username[0]?.toUpperCase() ?? "?"}
              </div>
            )}
            <ChevronDown size={14} className="nav-chevron" />

            {menuOpen && (
              <div className="profile-dropdown" onClick={(e) => e.stopPropagation()}>
                <Link
                  href={`/onboarding/${slug}?start=2&force=1`}
                  className="profile-dd-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <ImageIcon size={16} /> Set profile picture
                </Link>
                <Link
                  href={`/onboarding/${slug}?start=3&force=1`}
                  className="profile-dd-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <SlidersHorizontal size={16} /> Edit preferences
                </Link>
                <button type="button" className="profile-dd-item danger" onClick={() => { setFlushOpen(true); setMenuOpen(false); }}>
                  <Trash2 size={16} /> Flush preferences
                </button>
                <div className="profile-dd-divider" />
                <Link
                  href={`/onboarding/${slug}?force=1`}
                  className="profile-dd-item"
                  onClick={() => setMenuOpen(false)}
                >
                  <UserCircle size={16} /> Full onboarding
                </Link>
                <button type="button" className="profile-dd-item danger" onClick={handleLogout}>
                  <LogOut size={16} /> Log out
                </button>
              </div>
            )}
          </div>
        </div>
      </nav>

      <AlertDialog open={flushOpen} onOpenChange={setFlushOpen}>
        <AlertDialogContent className="z-[20050] border-white/10 bg-[#141414] text-white sm:max-w-md">
          <AlertDialogHeader>
            <AlertDialogTitle>Clear all preferences?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This clears your saved preferences. You&apos;ll be taken to onboarding to set them again.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 bg-transparent text-white hover:bg-white/10">Cancel</AlertDialogCancel>
            <button
              type="button"
              className="inline-flex h-10 items-center justify-center rounded-md bg-[#E50914] px-4 py-2 text-sm font-semibold text-white hover:bg-[#c50812]"
              onClick={() => void runFlush()}
            >
              Clear preferences
            </button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

    </>
  );
};
