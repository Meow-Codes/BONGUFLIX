"use client";

import { useEffect, useState, useRef, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Play,
  Info,
  ChevronLeft,
  ChevronRight,
  Bell,
  Search,
  ChevronDown,
  Volume2,
  VolumeX,
  X,
  Star,
  Clock,
} from "lucide-react";

// ─── Types ────────────────────────────────────────────────────────────────────

type UserData = {
  username: string;
  slug: string;
  sessionId: string;
  lastActive: string;
  preferences: Record<string, unknown>;
  randomSeed: number;
};

type Movie = {
  id: number;
  tmdb_id: number | null;
  imdb_id: string | null;
  title: string;
  overview: string | null;
  release_date: string | null;
  year_released: number | null;
  runtime: number | null;
  vote_average: number | null;
  poster_path: string | null;
  backdrop_path: string | null;
  age_certification: string | null;
  genres?: string[];
};

type TVShow = {
  id: number;
  tmdb_id: number | null;
  name: string;
  overview: string | null;
  first_air_date: string | null;
  number_of_seasons: number | null;
  vote_average: number | null;
  poster_path: string | null;
  backdrop_path: string | null;
  age_certification: string | null;
  genres?: string[];
};

type MediaItem = (Movie | TVShow) & { mediaType: "movie" | "tv" };
type Row = { title: string; items: MediaItem[] };

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TMDB = "https://image.tmdb.org/t/p";
const MISSING = "[MISSING_FIELD]";

const posterUrl = (p: string | null, s = "w342") =>
  !p ? null : p.startsWith("http") ? p : `${TMDB}/${s}${p}`;
const backdropUrl = (p: string | null, s = "w1280") =>
  !p ? null : p.startsWith("http") ? p : `${TMDB}/${s}${p}`;
const getTitle = (i: MediaItem) => ("title" in i ? i.title : i.name);
const getYear = (i: MediaItem) => {
  if ("year_released" in i && i.year_released) return i.year_released;
  const d = "release_date" in i ? i.release_date : i.first_air_date;
  return d ? new Date(d).getFullYear() : MISSING;
};
const getRating = (i: MediaItem) =>
  i.vote_average ? i.vote_average.toFixed(1) : MISSING;
const getRuntime = (i: MediaItem) => {
  if ("runtime" in i && i.runtime) return `${i.runtime}m`;
  if ("number_of_seasons" in i && i.number_of_seasons)
    return `${i.number_of_seasons} Season${i.number_of_seasons > 1 ? "s" : ""}`;
  return MISSING;
};

// ─── MediaCard ────────────────────────────────────────────────────────────────

function MediaCard({
  item,
  isFocused,
  onHover,
  onClick,
}: {
  item: MediaItem;
  isFocused: boolean;
  onHover: () => void;
  onClick: () => void;
}) {
  const poster = posterUrl(item.poster_path);
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
        width: "clamp(120px, 11.5vw, 190px)",
        aspectRatio: "2 / 3",
        borderRadius: "6px",
        overflow: "hidden",
        cursor: "pointer",
        position: "relative",
        outline: "none",
        transition:
          "transform 0.28s cubic-bezier(0.4,0,0.2,1), box-shadow 0.28s ease, z-index 0s",
        transform: isFocused ? "scale(1.1)" : "scale(1)",
        zIndex: isFocused ? 10 : 1,
        boxShadow: isFocused
          ? "0 20px 60px rgba(0,0,0,0.85), 0 0 0 2px rgba(229,9,20,0.5)"
          : "0 4px 18px rgba(0,0,0,0.5)",
      }}
    >
      {poster ? (
        <img
          src={poster}
          alt={title}
          loading="lazy"
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : (
        <div
          style={{
            width: "100%",
            height: "100%",
            background: "linear-gradient(135deg,#1c1c1c,#2c2c2c)",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "10px",
            gap: "8px",
          }}
        >
          <Play size={20} color="rgba(255,255,255,0.2)" />
          <span
            style={{
              color: "rgba(255,255,255,0.4)",
              fontSize: "10px",
              textAlign: "center",
              lineHeight: 1.3,
            }}
          >
            {title}
          </span>
        </div>
      )}

      {/* Hover overlay */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(to top, rgba(0,0,0,0.9) 0%, transparent 55%)",
          opacity: isFocused ? 1 : 0,
          transition: "opacity 0.25s ease",
          padding: "10px",
          display: "flex",
          flexDirection: "column",
          justifyContent: "flex-end",
        }}
      >
        <div
          style={{
            fontSize: "11px",
            fontWeight: 700,
            color: "#fff",
            lineHeight: 1.25,
            marginBottom: "5px",
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "5px" }}>
          <Star size={9} color="#E50914" fill="#E50914" />
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.7)" }}>
            {getRating(item)}
          </span>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.3)" }}>
            ·
          </span>
          <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.6)" }}>
            {getYear(item)}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── MediaRow ─────────────────────────────────────────────────────────────────

function MediaRow({
  row,
  rowIndex,
  focusedRow,
  focusedCol,
  onItemHover,
  onItemClick,
  onScroll,
  rowRef,
}: {
  row: Row;
  rowIndex: number;
  focusedRow: number;
  focusedCol: number;
  onItemHover: (rowIdx: number, colIdx: number, item: MediaItem) => void;
  onItemClick: (item: MediaItem) => void;
  onScroll: (dir: "left" | "right", rowIdx: number) => void;
  rowRef: (el: HTMLDivElement | null) => void;
}) {
  const isActive = focusedRow === rowIndex;

  return (
    <div style={{ marginBottom: "2.8vw", position: "relative" }}>
      <h2
        style={{
          fontFamily: "'Montserrat',sans-serif",
          fontSize: "clamp(13px,1.3vw,19px)",
          fontWeight: 700,
          color: isActive ? "#fff" : "rgba(255,255,255,0.72)",
          marginBottom: "10px",
          paddingLeft: "4%",
          letterSpacing: "0.015em",
          transition: "color 0.2s",
          display: "flex",
          alignItems: "center",
          gap: "10px",
        }}
      >
        {row.title}
        {isActive && (
          <span
            style={{
              fontSize: "11px",
              color: "#E50914",
              fontWeight: 600,
              letterSpacing: "0.1em",
              textTransform: "uppercase",
            }}
          >
            Explore All
          </span>
        )}
      </h2>

      <div style={{ position: "relative" }} className="row-container">
        {/* Left arrow */}
        <button
          className="row-arrow"
          style={{ left: 0 }}
          onClick={() => onScroll("left", rowIndex)}
          aria-label="scroll left"
        >
          <ChevronLeft size={24} />
        </button>

        {/* Strip */}
        <div
          ref={rowRef}
          style={{
            display: "flex",
            gap: "clamp(4px,0.45vw,7px)",
            overflowX: "auto",
            scrollBehavior: "smooth",
            scrollbarWidth: "none",
            paddingLeft: "4%",
            paddingRight: "4%",
            paddingTop: "6px",
            paddingBottom: "14px",
          }}
        >
          {row.items.map((item, colIdx) => (
            <MediaCard
              key={`${item.mediaType}-${item.id}`}
              item={item}
              isFocused={isActive && focusedCol === colIdx}
              onHover={() => onItemHover(rowIndex, colIdx, item)}
              onClick={() => onItemClick(item)}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          className="row-arrow"
          style={{ right: 0, transform: "translateY(-50%) scaleX(-1)" }}
          onClick={() => onScroll("right", rowIndex)}
          aria-label="scroll right"
        >
          <ChevronLeft size={24} />
        </button>
      </div>
    </div>
  );
}

// ─── DetailModal ──────────────────────────────────────────────────────────────

function DetailModal({
  item,
  onClose,
}: {
  item: MediaItem;
  onClose: () => void;
}) {
  const backdrop =
    backdropUrl(item.backdrop_path, "original") ||
    posterUrl(item.poster_path, "w780");
  const title = getTitle(item);

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", h);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", h);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 1000,
        background: "rgba(0,0,0,0.78)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
        animation: "bgIn 0.2s ease both",
      }}
      onClick={onClose}
    >
      <div
        style={{
          width: "min(840px,94vw)",
          background: "#181818",
          borderRadius: "12px",
          overflow: "hidden",
          boxShadow: "0 40px 100px rgba(0,0,0,0.95)",
          animation: "modalIn 0.3s cubic-bezier(0.16,1,0.3,1) both",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Backdrop area */}
        <div style={{ position: "relative", aspectRatio: "16/9" }}>
          {backdrop ? (
            <img
              src={backdrop}
              alt={title}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                display: "block",
              }}
            />
          ) : (
            <div
              style={{ width: "100%", height: "100%", background: "#111" }}
            />
          )}
          <div
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(to top, #181818 0%, transparent 55%)",
            }}
          />

          <button
            onClick={onClose}
            style={{
              position: "absolute",
              top: "14px",
              right: "14px",
              width: "34px",
              height: "34px",
              borderRadius: "50%",
              background: "rgba(20,20,20,0.85)",
              border: "none",
              color: "#fff",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              transition: "background 0.15s",
            }}
          >
            <X size={15} />
          </button>

          <div
            style={{
              position: "absolute",
              bottom: "20px",
              left: "24px",
              right: "24px",
            }}
          >
            <h2
              style={{
                fontFamily: "'Montserrat',sans-serif",
                fontSize: "clamp(18px,3vw,30px)",
                fontWeight: 900,
                marginBottom: "14px",
              }}
            >
              {title}
            </h2>
            <div style={{ display: "flex", gap: "10px" }}>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 22px",
                  background: "#fff",
                  color: "#000",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "'Montserrat',sans-serif",
                }}
              >
                <Play size={14} fill="black" /> Play
              </button>
              <button
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "7px",
                  padding: "8px 22px",
                  background: "rgba(109,109,110,0.7)",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  fontWeight: 700,
                  fontSize: "14px",
                  cursor: "pointer",
                  fontFamily: "'Montserrat',sans-serif",
                }}
              >
                <Info size={14} /> More Info
              </button>
            </div>
          </div>
        </div>

        {/* Details */}
        <div
          style={{
            padding: "20px 24px 28px",
            display: "grid",
            gridTemplateColumns: "1fr auto",
            gap: "24px",
            alignItems: "start",
          }}
        >
          <div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                marginBottom: "14px",
                flexWrap: "wrap",
              }}
            >
              <span
                style={{ color: "#46d369", fontSize: "13px", fontWeight: 700 }}
              >
                {getRating(item) !== MISSING
                  ? `${getRating(item)}/10`
                  : MISSING}
              </span>
              <span
                style={{ color: "rgba(255,255,255,0.5)", fontSize: "13px" }}
              >
                {getYear(item)}
              </span>
              {item.age_certification && (
                <span
                  style={{
                    border: "1px solid rgba(255,255,255,0.4)",
                    padding: "1px 6px",
                    fontSize: "11px",
                    borderRadius: "3px",
                    color: "rgba(255,255,255,0.65)",
                  }}
                >
                  {item.age_certification}
                </span>
              )}
              <span
                style={{
                  color: "rgba(255,255,255,0.5)",
                  fontSize: "13px",
                  display: "flex",
                  alignItems: "center",
                  gap: "4px",
                }}
              >
                <Clock size={12} />
                {getRuntime(item)}
              </span>
            </div>
            <p
              style={{
                color: "rgba(255,255,255,0.72)",
                fontSize: "14px",
                lineHeight: 1.65,
              }}
            >
              {item.overview || MISSING}
            </p>
          </div>
          <div style={{ minWidth: "170px" }}>
            {item.genres && item.genres.length > 0 && (
              <p
                style={{
                  fontSize: "12px",
                  color: "rgba(255,255,255,0.4)",
                  marginBottom: "7px",
                }}
              >
                <span style={{ color: "rgba(255,255,255,0.6)" }}>Genres: </span>
                {item.genres.join(", ")}
              </p>
            )}
            <p style={{ fontSize: "12px", color: "rgba(255,255,255,0.4)" }}>
              <span style={{ color: "rgba(255,255,255,0.6)" }}>
                {item.mediaType === "movie" ? "Released: " : "First aired: "}
              </span>
              {getYear(item)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = typeof params?.slug === "string" ? params.slug : "";
  const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6942";

  const [user, setUser] = useState<UserData | null>(null);
  const [rows, setRows] = useState<Row[]>([]);
  const [hero, setHero] = useState<MediaItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [focusedRow, setFocusedRow] = useState(0);
  const [focusedCol, setFocusedCol] = useState(0);
  const [modalItem, setModalItem] = useState<MediaItem | null>(null);
  const [heroMuted, setHeroMuted] = useState(true);
  const [navScrolled, setNavScrolled] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const rowRefs = useRef<(HTMLDivElement | null)[]>([]);

  // Helper to read httpOnly cookie
  const getCookie = (name: string): string | null => {
    if (typeof document === "undefined") return null;

    const cookies = document.cookie.split(";");
    for (let cookie of cookies) {
      const [key, value] = cookie.trim().split("=");
      if (key === name) {
        return value;
      }
    }
    return null;
  };

  // ── Auth + data ────────────────────────────────────────────────────────────

  useEffect(() => {
    const init = async () => {
      // Read from localStorage instead of httpOnly cookie
      const sessionId = localStorage.getItem("sessionId");

      if (!sessionId) {
        setError("No session found. Please log in again.");
        setLoading(false);
        setTimeout(() => router.push("/auth"), 1800);
        return;
      }

      try {
        const userRes = await fetch(`${API}/api/user/${slug}`, {
          headers: { "X-Session-Id": sessionId },
          // No credentials: "include" needed
        });

        if (!userRes.ok) {
          localStorage.removeItem("sessionId"); // Clear bad session
          throw new Error("Session invalid or expired");
        }

        const userData: UserData = await userRes.json();
        setUser(userData);

        // Fetch movies + TV in parallel — gracefully handles missing endpoints
        const [mRes, tRes] = await Promise.allSettled([
          fetch(`${API}/api/movies?limit=200`, {
            headers: { "X-Session-Id": sessionId },
          }),
          fetch(`${API}/api/tv?limit=200`, {
            headers: { "X-Session-Id": sessionId },
          }),
        ]);

        const movies: MediaItem[] =
          mRes.status === "fulfilled" && mRes.value.ok
            ? (
                (await mRes.value.json()).data ??
                (await (async () => {
                  return [];
                })())
              ).map((m: Movie) => ({ ...m, mediaType: "movie" as const }))
            : [];

        const tvShows: MediaItem[] =
          tRes.status === "fulfilled" && tRes.value.ok
            ? (
                (await tRes.value.json()).data ??
                (await (async () => {
                  return [];
                })())
              ).map((t: TVShow) => ({ ...t, mediaType: "tv" as const }))
            : [];

        // Safely parse movies
        let parsedMovies: MediaItem[] = [];
        if (mRes.status === "fulfilled" && mRes.value.ok) {
          const raw = await mRes.value
            .clone()
            .json()
            .catch(() => []);
          parsedMovies = (Array.isArray(raw) ? raw : (raw?.data ?? [])).map(
            (m: Movie) => ({ ...m, mediaType: "movie" as const }),
          );
        }

        let parsedTV: MediaItem[] = [];
        if (tRes.status === "fulfilled" && tRes.value.ok) {
          const raw = await tRes.value
            .clone()
            .json()
            .catch(() => []);
          parsedTV = (Array.isArray(raw) ? raw : (raw?.data ?? [])).map(
            (t: TVShow) => ({ ...t, mediaType: "tv" as const }),
          );
        }

        const allMedia = [...parsedMovies, ...parsedTV];
        const byRating = [...allMedia].sort(
          (a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0),
        );

        setHero(byRating.find((m) => m.backdrop_path) ?? byRating[0] ?? null);

        // Genre rows
        const genreMap = new Map<string, MediaItem[]>();
        allMedia.forEach((item) => {
          (item.genres ?? []).forEach((g) => {
            if (!genreMap.has(g)) genreMap.set(g, []);
            genreMap.get(g)!.push(item);
          });
        });

        const builtRows: Row[] = [
          { title: "Trending Now", items: byRating.slice(0, 20) },
          {
            title: "Top Rated Movies",
            items: [...parsedMovies]
              .sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0))
              .slice(0, 20),
          },
          {
            title: "Popular TV Shows",
            items: [...parsedTV]
              .sort((a, b) => (b.vote_average ?? 0) - (a.vote_average ?? 0))
              .slice(0, 20),
          },
          {
            title: "Recently Added",
            items: [...allMedia].reverse().slice(0, 20),
          },
          ...Array.from(genreMap.entries())
            .filter(([, items]) => items.length >= 4)
            .slice(0, 6)
            .map(([genre, items]) => ({
              title: genre,
              items: items.slice(0, 20),
            })),
        ].filter((r) => r.items.length > 0);

        setRows(builtRows);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : "Unknown error";
        setError(msg);
        localStorage.removeItem("sessionId");
        setTimeout(() => router.push("/auth"), 1800);
      } finally {
        setLoading(false);
      }
    };

    init();
  }, [slug, router, API]);

  // ── Scroll nav ─────────────────────────────────────────────────────────────

  useEffect(() => {
    const h = () => setNavScrolled(window.scrollY > 60);
    window.addEventListener("scroll", h, { passive: true });
    return () => window.removeEventListener("scroll", h);
  }, []);

  // ── Keyboard nav ───────────────────────────────────────────────────────────

  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (modalItem || searchOpen) return;
      const row = rows[focusedRow];
      if (!row) return;

      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          {
            const next = Math.min(focusedCol + 1, row.items.length - 1);
            setFocusedCol(next);
            scrollCardIntoView(focusedRow, next);
          }
          break;
        case "ArrowLeft":
          e.preventDefault();
          {
            const prev = Math.max(focusedCol - 1, 0);
            setFocusedCol(prev);
            scrollCardIntoView(focusedRow, prev);
          }
          break;
        case "ArrowDown":
          e.preventDefault();
          setFocusedRow((r) => Math.min(r + 1, rows.length - 1));
          setFocusedCol(0);
          break;
        case "ArrowUp":
          e.preventDefault();
          setFocusedRow((r) => Math.max(r - 1, 0));
          setFocusedCol(0);
          break;
        case "Enter":
          e.preventDefault();
          if (row.items[focusedCol]) setModalItem(row.items[focusedCol]);
          break;
        case "/":
          e.preventDefault();
          setSearchOpen(true);
          break;
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [rows, focusedRow, focusedCol, modalItem, searchOpen]);

  const scrollCardIntoView = useCallback((rowIdx: number, colIdx: number) => {
    const el = rowRefs.current[rowIdx];
    if (!el) return;
    const card = el.children[colIdx] as HTMLElement | undefined;
    card?.scrollIntoView({
      behavior: "smooth",
      inline: "center",
      block: "nearest",
    });
  }, []);

  const handleRowScroll = (dir: "left" | "right", rowIdx: number) => {
    const el = rowRefs.current[rowIdx];
    if (!el) return;
    el.scrollBy({
      left: dir === "right" ? el.clientWidth * 0.75 : -el.clientWidth * 0.75,
      behavior: "smooth",
    });
  };

  // ── Loading / Error ────────────────────────────────────────────────────────

  if (loading)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "28px",
        }}
      >
        <div
          style={{
            fontFamily: "'Bebas Neue',cursive",
            fontSize: "52px",
            color: "#E50914",
            letterSpacing: "0.15em",
            animation: "logoGlow2 2s ease-in-out infinite",
          }}
        >
          BONGUFLIX
        </div>
        <div style={{ display: "flex", gap: "9px" }}>
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "#E50914",
                animation: `dot 1.2s ease-in-out ${i * 0.2}s infinite`,
              }}
            />
          ))}
        </div>
        <style>{`
        @keyframes logoGlow2 { 0%,100%{text-shadow:0 0 20px rgba(229,9,20,0.3)} 50%{text-shadow:0 0 60px rgba(229,9,20,0.8),0 0 120px rgba(229,9,20,0.2)} }
        @keyframes dot { 0%,80%,100%{transform:scale(0.6);opacity:.4} 40%{transform:scale(1.3);opacity:1} }
      `}</style>
      </div>
    );

  if (error || !user)
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          gap: "16px",
          padding: "20px",
        }}
      >
        <div
          style={{
            fontFamily: "'Bebas Neue',cursive",
            fontSize: "42px",
            color: "#E50914",
          }}
        >
          BONGUFLIX
        </div>
        <h1
          style={{
            fontFamily: "'Montserrat',sans-serif",
            fontWeight: 900,
            fontSize: "26px",
            color: "#fff",
          }}
        >
          Access Denied
        </h1>
        <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "15px" }}>
          {error || "Invalid session"}
        </p>
        <button
          onClick={() => router.push("/auth")}
          style={{
            marginTop: "8px",
            background: "#E50914",
            color: "#fff",
            border: "none",
            padding: "13px 30px",
            borderRadius: "5px",
            fontSize: "15px",
            fontWeight: 700,
            cursor: "pointer",
            fontFamily: "'Montserrat',sans-serif",
          }}
        >
          Sign In
        </button>
      </div>
    );

  // ─────────────────────────────────────────────────────────────────────────────

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@300;400;500;600;700;900&family=Bebas+Neue&display=swap');
        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
        ::-webkit-scrollbar { display: none; }
        * { scrollbar-width: none; }

        @keyframes heroIn   { from{opacity:0;transform:scale(1.05)} to{opacity:1;transform:scale(1)} }
        @keyframes fadeUp   { from{opacity:0;transform:translateY(28px)} to{opacity:1;transform:translateY(0)} }
        @keyframes navIn    { from{opacity:0;transform:translateY(-16px)} to{opacity:1;transform:translateY(0)} }
        @keyframes rowsIn   { from{opacity:0;transform:translateY(22px)} to{opacity:1;transform:translateY(0)} }
        @keyframes bgIn     { from{opacity:0} to{opacity:1} }
        @keyframes modalIn  { from{opacity:0;transform:scale(0.93) translateY(18px)} to{opacity:1;transform:scale(1) translateY(0)} }
        @keyframes logoGlow { 0%,100%{text-shadow:0 0 20px rgba(229,9,20,0.3)} 50%{text-shadow:0 0 50px rgba(229,9,20,0.7)} }
        @keyframes pulseRed { 0%,100%{box-shadow:0 0 0 0 rgba(229,9,20,0.5)} 50%{box-shadow:0 0 0 8px rgba(229,9,20,0)} }

        .row-arrow {
          position: absolute; top: 50%; transform: translateY(-50%);
          z-index: 20; width: 42px; height: 100%; min-height: 65px;
          background: transparent; border: none; cursor: pointer;
          color: rgba(255,255,255,0); display: flex; align-items: center; justify-content: center;
          transition: color 0.2s, background 0.2s;
        }
        .row-container:hover .row-arrow { color: rgba(255,255,255,0.6); }
        .row-arrow:hover { color: #fff !important; background: linear-gradient(to right, rgba(0,0,0,0.65), transparent); }

        .nav-link {
          background: none; border: none; color: rgba(255,255,255,0.7);
          font-family: 'Montserrat',sans-serif; font-size: clamp(11px,0.85vw,13px);
          cursor: pointer; transition: color 0.15s; white-space: nowrap; padding: 0;
        }
        .nav-link:hover { color: #fff; }
      `}</style>

      <div
        style={{
          minHeight: "100vh",
          background: "#000",
          fontFamily: "'Montserrat',sans-serif",
          color: "#fff",
        }}
      >
        {/* ── Navbar ────────────────────────────────────────────────────────── */}
        <nav
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 100,
            padding: "0 4%",
            height: "68px",
            display: "flex",
            alignItems: "center",
            gap: "20px",
            background: navScrolled
              ? "rgba(20,20,20,0.97)"
              : "linear-gradient(to bottom, rgba(0,0,0,0.72) 0%, transparent 100%)",
            backdropFilter: navScrolled ? "blur(12px)" : "none",
            transition: "background 0.4s ease, backdrop-filter 0.4s ease",
            animation: "navIn 0.6s ease both",
          }}
        >
          <div
            style={{
              fontFamily: "'Bebas Neue',cursive",
              fontSize: "clamp(20px,2.3vw,30px)",
              color: "#E50914",
              letterSpacing: "0.15em",
              flexShrink: 0,
              animation: "logoGlow 3s ease-in-out infinite",
            }}
          >
            BONGUFLIX
          </div>

          <div style={{ display: "flex", gap: "16px", marginLeft: "6px" }}>
            {["Home", "TV Shows", "Movies", "New & Popular", "My List"].map(
              (l) => (
                <button key={l} className="nav-link">
                  {l}
                </button>
              ),
            )}
          </div>

          <div
            style={{
              marginLeft: "auto",
              display: "flex",
              alignItems: "center",
              gap: "16px",
            }}
          >
            <button
              className="nav-link"
              onClick={() => setSearchOpen(true)}
              style={{ display: "flex" }}
            >
              <Search size={17} />
            </button>
            <button className="nav-link" style={{ display: "flex" }}>
              <Bell size={17} />
            </button>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "7px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "4px",
                  background: `hsl(${user.randomSeed % 360},55%,32%)`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "12px",
                  fontWeight: 700,
                }}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>
              <ChevronDown
                size={13}
                style={{ color: "rgba(255,255,255,0.6)" }}
              />
            </div>
          </div>
        </nav>

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        {hero &&
          (() => {
            const bg =
              backdropUrl(hero.backdrop_path, "original") ||
              posterUrl(hero.poster_path, "w780");
            return (
              <div
                style={{
                  position: "relative",
                  height: "100vh",
                  minHeight: "600px",
                  overflow: "hidden",
                }}
              >
                {bg ? (
                  <img
                    src={bg}
                    alt={getTitle(hero)}
                    style={{
                      position: "absolute",
                      inset: 0,
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      animation: "heroIn 1.4s ease both",
                    }}
                  />
                ) : (
                  <div
                    style={{
                      position: "absolute",
                      inset: 0,
                      background: `linear-gradient(135deg, hsl(${user.randomSeed % 360},40%,14%), #000)`,
                    }}
                  />
                )}
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.4) 55%, transparent 100%)",
                  }}
                />
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background:
                      "linear-gradient(to top, #000 0%, transparent 52%)",
                  }}
                />

                {/* Content */}
                <div
                  style={{
                    position: "absolute",
                    bottom: "30%",
                    left: "4%",
                    maxWidth: "min(560px,48%)",
                    animation: "fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.4s both",
                  }}
                >
                  <h1
                    style={{
                      fontFamily: "'Montserrat',sans-serif",
                      fontSize: "clamp(26px,4.2vw,60px)",
                      fontWeight: 900,
                      lineHeight: 1.06,
                      marginBottom: "clamp(10px,1.2vw,16px)",
                      letterSpacing: "-0.02em",
                      textShadow: "2px 2px 14px rgba(0,0,0,0.55)",
                    }}
                  >
                    {getTitle(hero)}
                  </h1>

                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "11px",
                      marginBottom: "clamp(10px,1.3vw,18px)",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        color: "#46d369",
                        fontSize: "13px",
                        fontWeight: 700,
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Star size={11} fill="#46d369" color="#46d369" />
                      {getRating(hero)}
                    </span>
                    <span
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: "13px",
                      }}
                    >
                      {getYear(hero)}
                    </span>
                    {hero.age_certification && (
                      <span
                        style={{
                          border: "1px solid rgba(255,255,255,0.45)",
                          padding: "1px 7px",
                          fontSize: "11px",
                          borderRadius: "3px",
                          color: "rgba(255,255,255,0.65)",
                        }}
                      >
                        {hero.age_certification}
                      </span>
                    )}
                    <span
                      style={{
                        color: "rgba(255,255,255,0.55)",
                        fontSize: "13px",
                        display: "flex",
                        alignItems: "center",
                        gap: "4px",
                      }}
                    >
                      <Clock size={11} />
                      {getRuntime(hero)}
                    </span>
                  </div>

                  <p
                    style={{
                      color: "rgba(255,255,255,0.82)",
                      fontSize: "clamp(13px,1vw,15px)",
                      lineHeight: 1.65,
                      marginBottom: "clamp(14px,1.8vw,24px)",
                      display: "-webkit-box",
                      WebkitLineClamp: 3,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {hero.overview || MISSING}
                  </p>

                  <div
                    style={{ display: "flex", gap: "10px", flexWrap: "wrap" }}
                  >
                    <button
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "clamp(10px,1vw,13px) clamp(18px,2vw,28px)",
                        background: "#fff",
                        color: "#000",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: 700,
                        fontSize: "clamp(13px,1vw,16px)",
                        cursor: "pointer",
                        fontFamily: "'Montserrat',sans-serif",
                        transition: "opacity 0.15s,transform 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.85";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      <Play size={15} fill="black" />
                      Play
                    </button>
                    <button
                      onClick={() => setModalItem(hero)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "clamp(10px,1vw,13px) clamp(18px,2vw,28px)",
                        background: "rgba(109,109,110,0.72)",
                        color: "#fff",
                        border: "none",
                        borderRadius: "4px",
                        fontWeight: 700,
                        fontSize: "clamp(13px,1vw,16px)",
                        cursor: "pointer",
                        fontFamily: "'Montserrat',sans-serif",
                        transition: "opacity 0.15s",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.opacity = "0.82";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.opacity = "1";
                      }}
                    >
                      <Info size={15} />
                      More Info
                    </button>
                  </div>
                </div>

                {/* Mute btn */}
                <button
                  onClick={() => setHeroMuted(!heroMuted)}
                  style={{
                    position: "absolute",
                    bottom: "30%",
                    right: "4%",
                    width: "38px",
                    height: "38px",
                    borderRadius: "50%",
                    border: "1px solid rgba(255,255,255,0.4)",
                    background: "transparent",
                    color: "#fff",
                    cursor: "pointer",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    transition: "border-color 0.2s",
                  }}
                >
                  {heroMuted ? <VolumeX size={15} /> : <Volume2 size={15} />}
                </button>
              </div>
            );
          })()}

        {/* ── Rows ──────────────────────────────────────────────────────────── */}
        <div
          style={{
            position: "relative",
            zIndex: 2,
            marginTop: hero ? "-11vw" : "80px",
            paddingBottom: "64px",
            animation: "rowsIn 0.9s cubic-bezier(0.16,1,0.3,1) 0.5s both",
          }}
        >
          {rows.map((row, rowIdx) => (
            <MediaRow
              key={row.title}
              row={row}
              rowIndex={rowIdx}
              focusedRow={focusedRow}
              focusedCol={focusedCol}
              onItemHover={(rIdx, cIdx) => {
                setFocusedRow(rIdx);
                setFocusedCol(cIdx);
              }}
              onItemClick={(item) => setModalItem(item)}
              onScroll={handleRowScroll}
              rowRef={(el) => {
                rowRefs.current[rowIdx] = el;
              }}
            />
          ))}

          {rows.length === 0 && !loading && (
            <div
              style={{
                padding: "80px 4%",
                textAlign: "center",
                color: "rgba(255,255,255,0.35)",
                fontSize: "16px",
                lineHeight: 1.7,
              }}
            >
              No content yet. Make sure your backend exposes
              <br />
              <code
                style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}
              >
                /api/movies
              </code>{" "}
              and{" "}
              <code
                style={{ color: "rgba(255,255,255,0.5)", fontSize: "14px" }}
              >
                /api/tv
              </code>
            </div>
          )}
        </div>

        {/* ── Detail Modal ───────────────────────────────────────────────────── */}
        {modalItem && (
          <DetailModal item={modalItem} onClose={() => setModalItem(null)} />
        )}

        {/* ── Search overlay ─────────────────────────────────────────────────── */}
        {searchOpen && (
          <div
            style={{
              position: "fixed",
              inset: 0,
              zIndex: 200,
              background: "rgba(0,0,0,0.82)",
              backdropFilter: "blur(14px)",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              paddingTop: "14vh",
              animation: "bgIn 0.2s ease both",
            }}
            onClick={() => setSearchOpen(false)}
          >
            <div
              style={{ width: "min(580px,90vw)", position: "relative" }}
              onClick={(e) => e.stopPropagation()}
            >
              <Search
                size={17}
                style={{
                  position: "absolute",
                  left: "15px",
                  top: "50%",
                  transform: "translateY(-50%)",
                  color: "rgba(255,255,255,0.35)",
                  pointerEvents: "none",
                }}
              />
              <input
                autoFocus
                placeholder="Search titles, genres, people…"
                style={{
                  width: "100%",
                  padding: "15px 15px 15px 46px",
                  background: "rgba(28,28,28,0.96)",
                  border: "1px solid rgba(255,255,255,0.12)",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "17px",
                  fontFamily: "'Montserrat',sans-serif",
                  outline: "none",
                  caretColor: "#E50914",
                }}
                onKeyDown={(e) => {
                  if (e.key === "Escape") setSearchOpen(false);
                }}
              />
            </div>
            <p
              style={{
                marginTop: "14px",
                color: "rgba(255,255,255,0.28)",
                fontSize: "12px",
                letterSpacing: "0.05em",
              }}
            >
              Press Esc to close · Press / to open
            </p>
          </div>
        )}
      </div>
    </>
  );
}
