// components/SearchOverlay.tsx
import { useState, useEffect, useRef } from "react";
import { Search, Loader2, X } from "lucide-react";
import { useDebounce } from "@/hooks/useDebounce";
import type { MediaItem } from "@/types/media.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6942";

interface SearchOverlayProps {
  onClose: () => void;
  onSelect: (item: MediaItem) => void;
  sessionId: string;
}

export const SearchOverlay = ({ onClose, onSelect, sessionId }: SearchOverlayProps) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const debouncedQuery = useDebounce(query, 300);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([]);
      return;
    }

    const search = async () => {
      setLoading(true);
      try {
        const res = await fetch(`${API_URL}/api/search?q=${encodeURIComponent(debouncedQuery)}`, {
          headers: { "X-Session-Id": sessionId },
        });
        const data = await res.json();
        setResults(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Search failed", err);
        setResults([]);
      } finally {
        setLoading(false);
      }
    };

    search();
  }, [debouncedQuery, sessionId]);

  return (
    <div 
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 300,
        background: "rgba(0,0,0,0.92)",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "15vh",
      }}
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        style={{ width: "min(680px, 92vw)" }}
      >
        <div style={{
          position: "relative",
          background: "#141414",
          borderRadius: "8px",
          border: "1px solid #333",
          boxShadow: "0 20px 60px rgba(0,0,0,0.8)",
        }}>
          <Search size={20} style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", color: "#666" }} />
          
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search titles, people..."
            style={{
              width: "100%",
              padding: "18px 20px 18px 56px",
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "1.1rem",
              outline: "none",
            }}
          />

          {loading && (
            <Loader2 size={20} className="animate-spin" style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)" }} />
          )}
        </div>

        {results.length > 0 && (
          <div style={{
            marginTop: "12px",
            background: "#141414",
            borderRadius: "8px",
            border: "1px solid #333",
            maxHeight: "60vh",
            overflowY: "auto",
          }}>
            {results.map((result, index) => (
              <div
                key={index}
                onClick={() => {
                  if (result.media_type !== "person") {
                    onSelect({
                      id: result.id,
                      media_type: result.media_type as "movie" | "tv",
                      title: result.title,
                      poster_path: result.poster_path,
                      vote_average: result.vote_average,
                    });
                    onClose();
                  }
                }}
                style={{
                  padding: "14px 20px",
                  display: "flex",
                  alignItems: "center",
                  gap: "16px",
                  cursor: result.media_type !== "person" ? "pointer" : "default",
                  borderTop: index > 0 ? "1px solid #222" : "none",
                }}
                onMouseEnter={(e) => e.currentTarget.style.background = "#1f1f1f"}
                onMouseLeave={(e) => e.currentTarget.style.background = "transparent"}
              >
                {result.poster_path && (
                  <img 
                    src={`https://image.tmdb.org/t/p/w92${result.poster_path}`} 
                    alt={result.title}
                    style={{ width: "46px", borderRadius: "4px" }}
                  />
                )}
                <div>
                  <div style={{ fontWeight: 600 }}>{result.title}</div>
                  <div style={{ fontSize: "0.85rem", color: "#888" }}>
                    {result.media_type.toUpperCase()} 
                    {result.year && ` • ${result.year}`}
                    {result.vote_average && ` • ★ ${result.vote_average}`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        <div style={{ textAlign: "center", marginTop: "20px", color: "#666", fontSize: "0.9rem" }}>
          Press <strong>ESC</strong> to close
        </div>
      </div>
    </div>
  );
};