"use client";

import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X, Film, Tv, User } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import { imgUrl } from "@/utils/media";
import type { MediaItem } from "@/types/media.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6942";

interface SearchResult {
  id: number;
  media_type: "movie" | "tv" | "person";
  title: string;
  poster_path?: string | null;
  year?: number | null;
  vote_average?: number | null;
  overview?: string | null;
}

interface SearchOverlayProps {
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
  sessionId: string;
}

const MediaTypeIcon = ({ type }: { type: string }) => {
  if (type === "movie") return <Film size={10} />;
  if (type === "tv") return <Tv size={10} />;
  return <User size={10} />;
};

const typeColor: Record<string, string> = {
  movie: "#E50914",
  tv: "#46d369",
  person: "rgba(255,255,255,0.4)",
};

export const SearchOverlay = ({ onClose, onSelect, sessionId }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const debouncedQuery = useDebounce(query, 280);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setTimeout(() => inputRef.current?.focus(), 60);
  }, []);

  // Esc to close
  useEffect(() => {
    const h = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowDown") setActiveIdx((i) => Math.min(i + 1, results.length - 1));
      if (e.key === "ArrowUp") setActiveIdx((i) => Math.max(i - 1, 0));
      if (e.key === "Enter" && activeIdx >= 0 && results[activeIdx]) {
        const r = results[activeIdx];
        if (r.media_type !== "person") {
          onSelect({ id: r.id, media_type: r.media_type, title: r.title, poster_path: r.poster_path ?? undefined, vote_average: r.vote_average ?? undefined });
          onClose();
        }
      }
    };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [results, activeIdx, onClose, onSelect]);

  // Search — fixed: use /api/search?q= and read data.results
  useEffect(() => {
    if (debouncedQuery.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    setActiveIdx(-1);
    fetch(`${API_URL}/api/search?q=${encodeURIComponent(debouncedQuery.trim())}`, {
      headers: { "X-Session-Id": sessionId },
    })
      .then((r) => r.json())
      .then((data) => {
        // backend returns { query, results } OR array
        const arr = Array.isArray(data) ? data : (data.results ?? []);
        setResults(arr.slice(0, 10));
      })
      .catch(() => setResults([]))
      .finally(() => setLoading(false));
  }, [debouncedQuery, sessionId]);

  const handleSelect = (r: SearchResult) => {
    if (r.media_type === "person") return;
    onSelect({
      id: r.id,
      media_type: r.media_type as "movie" | "tv",
      title: r.title,
      poster_path: r.poster_path ?? undefined,
      vote_average: r.vote_average ?? undefined,
    });
    onClose();
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700&display=swap');

        .search-backdrop {
          position: fixed;
          inset: 0;
          z-index: 300;
          background: rgba(0,0,0,0.88);
          backdrop-filter: blur(18px);
          display: flex;
          flex-direction: column;
          align-items: center;
          padding-top: 12vh;
          animation: searchFadeIn 0.2s ease both;
          font-family: 'Outfit', sans-serif;
        }
        @keyframes searchFadeIn {
          from { opacity: 0; }
          to   { opacity: 1; }
        }

        .search-panel {
          width: min(660px, 92vw);
          animation: searchSlideIn 0.28s cubic-bezier(0.16,1,0.3,1) both;
        }
        @keyframes searchSlideIn {
          from { opacity: 0; transform: translateY(-18px) scale(0.98); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }

        .search-input-wrap {
          position: relative;
          background: rgba(18,18,18,0.98);
          border: 1px solid rgba(229,9,20,0.35);
          border-radius: 12px;
          overflow: hidden;
          box-shadow:
            0 0 0 1px rgba(229,9,20,0.12),
            0 24px 60px rgba(0,0,0,0.7);
          transition: border-color 0.2s;
        }
        .search-input-wrap:focus-within {
          border-color: rgba(229,9,20,0.65);
          box-shadow:
            0 0 0 1px rgba(229,9,20,0.2),
            0 28px 70px rgba(0,0,0,0.75);
        }

        .search-icon {
          position: absolute;
          left: 18px;
          top: 50%;
          transform: translateY(-50%);
          color: rgba(255,255,255,0.3);
          pointer-events: none;
          transition: color 0.2s;
        }
        .search-input-wrap:focus-within .search-icon { color: #E50914; }

        .search-input {
          width: 100%;
          padding: 17px 52px;
          background: transparent;
          border: none;
          color: #fff;
          font-size: 17px;
          font-family: 'Outfit', sans-serif;
          font-weight: 400;
          outline: none;
          caret-color: #E50914;
          letter-spacing: 0.01em;
        }
        .search-input::placeholder { color: rgba(255,255,255,0.28); }

        .search-clear {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          background: rgba(255,255,255,0.1);
          border: none;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          width: 26px; height: 26px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s, color 0.15s;
        }
        .search-clear:hover { background: rgba(255,255,255,0.2); color: #fff; }

        .search-spinner {
          position: absolute;
          right: 16px;
          top: 50%;
          transform: translateY(-50%);
          color: #E50914;
          animation: spin 0.8s linear infinite;
        }
        @keyframes spin { to { transform: translateY(-50%) rotate(360deg); } }

        .search-results {
          margin-top: 8px;
          background: rgba(16,16,16,0.98);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 12px;
          overflow: hidden;
          box-shadow: 0 24px 60px rgba(0,0,0,0.8);
          animation: resultsIn 0.22s ease both;
        }
        @keyframes resultsIn {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .search-result-item {
          display: flex;
          align-items: center;
          gap: 14px;
          padding: 11px 16px;
          cursor: pointer;
          transition: background 0.14s;
          border-top: 1px solid rgba(255,255,255,0.04);
        }
        .search-result-item:first-child { border-top: none; }
        .search-result-item:hover,
        .search-result-item.active { background: rgba(255,255,255,0.07); }
        .search-result-item.person { cursor: default; opacity: 0.65; }

        .result-thumb {
          width: 38px;
          height: 54px;
          border-radius: 5px;
          object-fit: cover;
          flex-shrink: 0;
          background: #222;
        }
        .result-thumb-placeholder {
          width: 38px;
          height: 54px;
          border-radius: 5px;
          background: #1e1e1e;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
          color: rgba(255,255,255,0.2);
        }

        .result-info { flex: 1; min-width: 0; }
        .result-title {
          font-size: 14px;
          font-weight: 600;
          color: #fff;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-bottom: 4px;
        }
        .result-meta {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
        }
        .result-type-badge {
          display: inline-flex;
          align-items: center;
          gap: 3px;
          font-weight: 700;
          font-size: 10px;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          padding: 2px 7px;
          border-radius: 10px;
        }
        .result-year { color: rgba(255,255,255,0.4); }
        .result-rating { color: rgba(255,255,255,0.55); }

        .search-hint {
          text-align: center;
          margin-top: 16px;
          font-size: 11px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.06em;
          font-family: 'Outfit', sans-serif;
        }
        .search-hint kbd {
          background: rgba(255,255,255,0.08);
          border: 1px solid rgba(255,255,255,0.15);
          border-radius: 4px;
          padding: 1px 6px;
          font-family: inherit;
          color: rgba(255,255,255,0.4);
        }

        .search-empty {
          padding: 32px 20px;
          text-align: center;
          color: rgba(255,255,255,0.3);
          font-size: 14px;
        }
      `}</style>

      <div className="search-backdrop" onClick={onClose}>
        <div className="search-panel" onClick={(e) => e.stopPropagation()}>
          <div className="search-input-wrap">
            <Search size={18} className="search-icon" />
            <input
              ref={inputRef}
              className="search-input"
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search movies, shows, people…"
            />
            {loading && <Loader2 size={16} className="search-spinner" />}
            {!loading && query && (
              <button className="search-clear" onClick={() => setQuery("")}>
                <X size={12} />
              </button>
            )}
          </div>

          {results.length > 0 && (
            <div className="search-results">
              {results.map((r, i) => {
                const thumb = imgUrl(r.poster_path, "w92");
                const isPerson = r.media_type === "person";
                return (
                  <div
                    key={`${r.media_type}-${r.id}-${i}`}
                    className={`search-result-item ${activeIdx === i ? "active" : ""} ${isPerson ? "person" : ""}`}
                    onClick={() => handleSelect(r)}
                    onMouseEnter={() => setActiveIdx(i)}
                  >
                    {thumb ? (
                      <img src={thumb} alt={r.title} className="result-thumb" />
                    ) : (
                      <div className="result-thumb-placeholder">
                        <MediaTypeIcon type={r.media_type} />
                      </div>
                    )}

                    <div className="result-info">
                      <div className="result-title">{r.title}</div>
                      <div className="result-meta">
                        <span
                          className="result-type-badge"
                          style={{
                            color: typeColor[r.media_type],
                            background: `${typeColor[r.media_type]}18`,
                          }}
                        >
                          <MediaTypeIcon type={r.media_type} />
                          {r.media_type}
                        </span>
                        {r.year && <span className="result-year">{r.year}</span>}
                        {r.vote_average && r.vote_average > 0 && (
                          <span className="result-rating">★ {r.vote_average.toFixed(1)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {!loading && debouncedQuery.length >= 2 && results.length === 0 && (
            <div className="search-results">
              <div className="search-empty">No results for "{debouncedQuery}"</div>
            </div>
          )}

          <p className="search-hint">
            <kbd>↑↓</kbd> navigate &nbsp;·&nbsp; <kbd>Enter</kbd> select &nbsp;·&nbsp; <kbd>Esc</kbd> close &nbsp;·&nbsp; <kbd>/</kbd> open
          </p>
        </div>
      </div>
    </>
  );
};