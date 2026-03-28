// components/Navbar.tsx
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

export const Navbar = ({ user, slug, scrolled, onSearch }: NavbarProps) => {
  return (
    <nav style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      zIndex: 100,
      height: "68px",
      padding: "0 4%",
      display: "flex",
      alignItems: "center",
      background: scrolled ? "rgba(20,20,20,0.98)" : "linear-gradient(to bottom, rgba(0,0,0,0.8), transparent)",
      backdropFilter: scrolled ? "blur(12px)" : "none",
      transition: "all 0.4s ease",
    }}>
      <Link href={`/dashboard/${slug}`}>
        <div style={{
          fontFamily: "'Bebas Neue', sans-serif",
          fontSize: "2.2rem",
          fontWeight: 700,
          color: "#E50914",
          letterSpacing: "2px",
          cursor: "pointer",
        }}>
          BONGUFLIX
        </div>
      </Link>

      <div style={{ display: "flex", gap: "24px", marginLeft: "48px" }}>
        {["Home", "TV Shows", "Movies", "New & Popular", "My List"].map((label) => (
          <button
            key={label}
            style={{
              background: "none",
              border: "none",
              color: "rgba(255,255,255,0.85)",
              fontSize: "0.95rem",
              fontWeight: 500,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}
      </div>

      <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: "22px" }}>
        <button onClick={onSearch} style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
          <Search size={22} />
        </button>
        <button style={{ background: "none", border: "none", color: "#fff", cursor: "pointer" }}>
          <Bell size={22} />
        </button>

        <div style={{ display: "flex", alignItems: "center", gap: "8px", cursor: "pointer" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "4px",
            background: `hsl(${user.randomSeed % 360}, 70%, 45%)`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            color: "#fff",
            fontSize: "15px",
          }}>
            {user.username[0].toUpperCase()}
          </div>
          <ChevronDown size={18} />
        </div>
      </div>
    </nav>
  );
};