"use client";

import { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import { Play, ChevronLeft, ChevronRight, Star, Plus, Loader2 } from "lucide-react";

import { Hero } from "@/components/Hero";
import { Navbar } from "@/components/Navbar";
import { SearchOverlay } from "@/components/SearchOverlay";
import type { MediaItem, HomeResponse } from "@/types/media.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6942";

const getTitle = (item: MediaItem) => item.title || (item as any).name || "Untitled";
const getYear = (item: MediaItem) => {
  if (item.year_released) return item.year_released;
  if (item.release_date) return new Date(item.release_date).getFullYear();
  if ((item as any).first_air_date) return new Date((item as any).first_air_date).getFullYear();
  return "N/A";
};
const getRating = (item: MediaItem) => item.vote_average?.toFixed(1) || "N/A";
const getRuntime = (item: MediaItem) => item.runtime ? `${item.runtime} min` : "";

const imgUrl = (path?: string, size = "w342") => 
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

// ─── MediaCard ────────────────────────────────────────────────────────────────
const MediaCard = ({
  item,
  focused,
  onHover,
  onClick,
}: {
  item: MediaItem;
  focused: boolean;
  onHover: () => void;
  onClick: () => void;
}) => {
  const poster = imgUrl(item.poster_path);
  const title = getTitle(item);

  return (
    <div
      role="button"
      tabIndex={0}
      onMouseEnter={onHover}
      onFocus={onHover}
      onClick={onClick}
      onKeyDown={(e) => e.key === "Enter" && onClick()}
      style={{
        flexShrink: 0,
        width: "clamp(130px, 12vw, 200px)",
        aspectRatio: "2/3",
        borderRadius: "6px",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        transition: "transform 0.3s cubic-bezier(0.4,0,0.2,1), box-shadow 0.3s ease",
        transform: focused ? "scale(1.12)" : "scale(1)",
        zIndex: focused ? 15 : 1,
        boxShadow: focused
          ? "0 24px 70px rgba(0,0,0,0.9), 0 0 0 2px rgba(229,9,20,0.6)"
          : "0 4px 20px rgba(0,0,0,0.5)",
      }}
    >
      {poster ? (
        <img
          src={poster}
          alt={title}
          loading="lazy"
          style={{ width: "100%", height: "100%", objectFit: "cover" }}
        />
      ) : (
        <div style={{
          width: "100%", height: "100%", background: "linear-gradient(135deg,#141414,#2a2a2a)",
          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 8
        }}>
          <Play size={20} color="rgba(255,255,255,0.3)" />
          <span style={{ color: "rgba(255,255,255,0.5)", fontSize: 11 }}>{title}</span>
        </div>
      )}

      {/* Hover Overlay */}
      <div style={{
        position: "absolute", inset: 0,
        background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.4) 60%, transparent)",
        opacity: focused ? 1 : 0,
        transition: "opacity 0.25s ease",
        padding: "12px",
        display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 6,
      }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button 
            onClick={(e) => { e.stopPropagation(); onClick(); }}
            style={{ width: 28, height: 28, borderRadius: "50%", background: "#fff", border: "none" }}
          >
            <Play size={12} fill="black" color="black" />
          </button>
          <button 
            onClick={(e) => e.stopPropagation()}
            style={{ width: 28, height: 28, borderRadius: "50%", background: "rgba(40,40,40,0.9)", border: "1px solid rgba(255,255,255,0.4)" }}
          >
            <Plus size={13} color="#fff" />
          </button>
        </div>

        <div style={{ fontSize: 13, fontWeight: 700 }}>{title}</div>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 11 }}>
          <Star size={10} color="#E50914" fill="#E50914" />
          <span>{getRating(item)}</span>
          <span style={{ color: "rgba(255,255,255,0.4)" }}>·</span>
          <span>{getYear(item)}</span>
          {item.age_certification && (
            <span style={{ border: "1px solid rgba(255,255,255,0.4)", padding: "0 5px", borderRadius: 3, fontSize: 10 }}>
              {item.age_certification}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── MediaRow ────────────────────────────────────────────────────────────────
const MediaRow = ({
  row,
  rowIdx,
  focusedRow,
  focusedCol,
  onHover,
  onClick,
}: {
  row: any;
  rowIdx: number;
  focusedRow: number;
  focusedCol: number;
  onHover: (row: number, col: number) => void;
  onClick: (item: MediaItem) => void;
}) => {
  const active = focusedRow === rowIdx;
  const stripRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!stripRef.current) return;
    const amount = stripRef.current.clientWidth * 0.75;
    stripRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <div style={{ marginBottom: "2.5vw", position: "relative" }}>
      <h2 style={{
        fontSize: "clamp(13px, 1.25vw, 19px)",
        fontWeight: 700,
        color: active ? "#fff" : "rgba(255,255,255,0.8)",
        marginBottom: 12,
        paddingLeft: "4%",
      }}>
        {row.title}
      </h2>

      <div style={{ position: "relative" }}>
        <button 
          onClick={() => scroll("left")}
          style={{ position: "absolute", left: 0, top: "50%", transform: "translateY(-50%)", zIndex: 20, background: "none", border: "none", color: "#fff", cursor: "pointer" }}
        >
          <ChevronLeft size={28} />
        </button>

        <div
          ref={stripRef}
          style={{
            display: "flex",
            gap: "6px",
            overflowX: "auto",
            scrollBehavior: "smooth",
            paddingLeft: "4%",
            paddingRight: "4%",
            scrollbarWidth: "none",
          }}
        >
          {row.items.map((item: MediaItem, colIdx: number) => (
            <MediaCard
              key={`${item.media_type}-${item.id}`}
              item={item}
              focused={active && focusedCol === colIdx}
              onHover={() => onHover(rowIdx, colIdx)}
              onClick={() => onClick(item)}
            />
          ))}
        </div>

        <button 
          onClick={() => scroll("right")}
          style={{ position: "absolute", right: 0, top: "50%", transform: "translateY(-50%)", zIndex: 20, background: "none", border: "none", color: "#fff", cursor: "pointer" }}
        >
          <ChevronRight size={28} />
        </button>
      </div>
    </div>
  );
};

// ─── DetailModal (Simplified) ────────────────────────────────────────────────
const DetailModal = ({ item, onClose, sessionId }: { 
  item: MediaItem; 
  onClose: () => void; 
  sessionId: string;
}) => {
  const [display, setDisplay] = useState<MediaItem>(item);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDetail = async () => {
      try {
        const res = await fetch(`${API_URL}/api/${item.media_type}/${item.id}`, {
          headers: { "X-Session-Id": sessionId },
        });
        const data = await res.json();
        setDisplay(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    loadDetail();
  }, [item, sessionId]);

  const backdrop = imgUrl(display.backdrop_path, "original") || imgUrl(display.poster_path, "w780");

  return (
    <div 
      onClick={onClose}
      style={{ position: "fixed", inset: 0, zIndex: 1000, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center" }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(920px, 96vw)", background: "#181818", borderRadius: 12, overflow: "hidden" }}
      >
        <div style={{ position: "relative", aspectRatio: "16/9" }}>
          {backdrop && <img src={backdrop} alt={getTitle(display)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />}
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(to top, #181818, transparent)" }} />

          <div style={{ position: "absolute", bottom: 32, left: 32 }}>
            <h1 style={{ fontSize: "clamp(28px, 4vw, 52px)", fontWeight: 900 }}>{getTitle(display)}</h1>
            <div style={{ display: "flex", gap: 12, marginTop: 16 }}>
              <button style={{ padding: "10px 28px", background: "#fff", color: "#000", border: "none", borderRadius: 4, fontWeight: 700 }}>
                <Play size={18} fill="black" /> Play
              </button>
              <button style={{ padding: "10px 28px", background: "rgba(255,255,255,0.15)", color: "#fff", border: "none", borderRadius: 4 }}>
                <Plus size={18} /> My List
              </button>
            </div>
          </div>
        </div>

        <div style={{ padding: "24px" }}>
          {loading ? (
            <div style={{ textAlign: "center", padding: "60px" }}>
              <Loader2 size={28} className="animate-spin" />
            </div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                <span style={{ color: "#46d369", fontWeight: 700 }}>{getRating(display)}</span>
                <span>{getYear(display)}</span>
                {display.age_certification && <span style={{ border: "1px solid #666", padding: "2px 8px", borderRadius: 4 }}>{display.age_certification}</span>}
              </div>

              <p style={{ lineHeight: 1.6, color: "#ddd", marginBottom: 24 }}>
                {display.overview || "No overview available."}
              </p>

              {display.genres && display.genres.length > 0 && (
                <p><strong>Genres:</strong> {display.genres.join(", ")}</p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

// ─── Main Dashboard ──────────────────────────────────────────────────────────
export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const [user, setUser] = useState<any>(null);           // Simple any for now
  const [homeData, setHomeData] = useState<HomeResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedRow, setFocusedRow] = useState(0);
  const [focusedCol, setFocusedCol] = useState(0);
  const [modalItem, setModalItem] = useState<MediaItem | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [navScrolled, setNavScrolled] = useState(false);

  const sessionId = typeof window !== "undefined" ? localStorage.getItem("sessionId") : null;

  // Load User + Home Data
  useEffect(() => {
    if (!sessionId) {
      router.push("/auth");
      return;
    }

    const loadData = async () => {
      try {
        const headers = { "X-Session-Id": sessionId };

        const [userRes, homeRes] = await Promise.all([
          fetch(`${API_URL}/api/user/${slug}`, { headers }),
          fetch(`${API_URL}/api/home`, { headers }),
        ]);

        if (!userRes.ok) throw new Error("Session invalid");

        const userData = await userRes.json();
        const home = await homeRes.json();

        setUser(userData);
        setHomeData(home);
      } catch (err) {
        console.error(err);
        setError("Failed to load dashboard");
        setTimeout(() => router.push("/auth"), 1500);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [slug, router, sessionId]);

  // Keyboard Navigation
  useEffect(() => {
    const handleKey = (e: KeyboardEvent) => {
      if (modalItem || searchOpen) return;

      if (e.key === "/") {
        e.preventDefault();
        setSearchOpen(true);
        return;
      }

      if (e.key === "ArrowRight") setFocusedCol(c => Math.min(c + 1, (homeData?.rows[focusedRow]?.items.length || 1) - 1));
      if (e.key === "ArrowLeft") setFocusedCol(c => Math.max(c - 1, 0));
      if (e.key === "ArrowDown") { 
        setFocusedRow(r => Math.min(r + 1, (homeData?.rows.length || 1) - 1)); 
        setFocusedCol(0); 
      }
      if (e.key === "ArrowUp") { 
        setFocusedRow(r => Math.max(r - 1, 0)); 
        setFocusedCol(0); 
      }
      if (e.key === "Enter" && homeData?.rows[focusedRow]?.items[focusedCol]) {
        setModalItem(homeData.rows[focusedRow].items[focusedCol]);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [homeData, focusedRow, focusedCol, modalItem, searchOpen]);

  // Navbar scroll effect
  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  if (loading) {
    return (
      <div style={{ 
        background: "#000", 
        minHeight: "100vh", 
        color: "#fff", 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        fontSize: "1.5rem" 
      }}>
        Loading BONGUFLIX...
      </div>
    );
  }

  if (error || !homeData || !user) {
    return (
      <div style={{ 
        color: "red", 
        textAlign: "center", 
        padding: "100px", 
        background: "#000", 
        minHeight: "100vh" 
      }}>
        {error || "Something went wrong"}
      </div>
    );
  }

  return (
    <>
      <style jsx global>{`
        body { background: #000; color: #fff; font-family: 'Montserrat', sans-serif; }
        ::-webkit-scrollbar { display: none; }
      `}</style>

      <div style={{ minHeight: "100vh", background: "#000" }}>
        <Navbar 
          user={user} 
          slug={slug} 
          scrolled={navScrolled} 
          onSearch={() => setSearchOpen(true)} 
        />

        {homeData.hero && (
          <Hero 
            item={homeData.hero} 
            onMoreInfo={() => setModalItem(homeData.hero!)} 
          />
        )}

        <div style={{ 
          marginTop: homeData.hero ? "-12vw" : "80px", 
          padding: "0 4%" 
        }}>
          {homeData.rows.map((row, rowIdx) => (
            <MediaRow
              key={row.id}
              row={row}
              rowIdx={rowIdx}
              focusedRow={focusedRow}
              focusedCol={focusedCol}
              onHover={(r: number, c: number) => { setFocusedRow(r); setFocusedCol(c); }}
              onClick={(item: MediaItem) => setModalItem(item)}
            />
          ))}
        </div>

        {modalItem && (
          <DetailModal 
            item={modalItem} 
            onClose={() => setModalItem(null)} 
            sessionId={sessionId!} 
          />
        )}

        {searchOpen && (
          <SearchOverlay 
            onClose={() => setSearchOpen(false)} 
            onSelect={setModalItem} 
            sessionId={sessionId!} 
          />
        )}
      </div>
    </>
  );
}