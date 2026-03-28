// components/Hero.tsx
import { Play, Info, Star, Clock } from "lucide-react";
import type { MediaItem } from "@/types/media.types";   // ← your existing backend type

const imgUrl = (path?: string, size: string = "original") => 
  path ? `https://image.tmdb.org/t/p/${size}${path}` : null;

const getTitle = (item: MediaItem) => item.title || (item as any).name || "Untitled";

const getYear = (item: MediaItem): string | number => {
  if (item.year_released) return item.year_released;
  if (item.release_date) return new Date(item.release_date).getFullYear();
  if ((item as any).first_air_date) return new Date((item as any).first_air_date).getFullYear();
  return "N/A";
};

const getRating = (item: MediaItem) => 
  item.vote_average ? item.vote_average.toFixed(1) : "N/A";

const getRuntime = (item: MediaItem) => 
  item.runtime ? `${item.runtime} min` : "";

interface HeroProps {
  item: MediaItem;
  onMoreInfo: () => void;
}

export const Hero = ({ item, onMoreInfo }: HeroProps) => {
  const backdrop = imgUrl(item.backdrop_path, "original") || imgUrl(item.poster_path, "w1280");
  const title = getTitle(item);

  return (
    <div style={{ 
      position: "relative", 
      height: "100vh", 
      minHeight: "620px", 
      overflow: "hidden" 
    }}>
      {/* Background Image */}
      {backdrop && (
        <img
          src={backdrop}
          alt={title}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            objectFit: "cover",
            zIndex: -1,
          }}
        />
      )}

      {/* Overlays */}
      <div style={{ 
        position: "absolute", 
        inset: 0, 
        background: "linear-gradient(to right, rgba(0,0,0,0.92) 20%, rgba(0,0,0,0.35) 65%, transparent 100%)" 
      }} />
      <div style={{ 
        position: "absolute", 
        inset: 0, 
        background: "linear-gradient(to top, #141414 8%, transparent 55%)" 
      }} />

      {/* Hero Content */}
      <div style={{
        position: "absolute",
        bottom: "22%",
        left: "4%",
        maxWidth: "520px",
        zIndex: 2,
      }}>
        <h1 style={{
          fontSize: "clamp(2.8rem, 5.5vw, 4.5rem)",
          fontWeight: 900,
          lineHeight: 1.05,
          marginBottom: "1rem",
          textShadow: "0 4px 20px rgba(0,0,0,0.85)",
        }}>
          {title}
        </h1>

        <div style={{ 
          display: "flex", 
          alignItems: "center", 
          gap: "12px", 
          marginBottom: "1.2rem", 
          flexWrap: "wrap" 
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Star size={18} fill="#46d369" color="#46d369" />
            <span style={{ color: "#46d369", fontWeight: 700, fontSize: "1.1rem" }}>
              {getRating(item)}
            </span>
          </div>
          
          <span style={{ color: "#b3b3b3" }}>{getYear(item)}</span>

          {item.age_certification && (
            <span style={{ 
              border: "1px solid #888", 
              padding: "2px 8px", 
              borderRadius: "3px", 
              fontSize: "0.85rem" 
            }}>
              {item.age_certification}
            </span>
          )}

          {item.runtime && (
            <span style={{ display: "flex", alignItems: "center", gap: 4, color: "#b3b3b3" }}>
              <Clock size={16} /> {getRuntime(item)}
            </span>
          )}
        </div>

        <p style={{
          color: "#ddd",
          fontSize: "1.05rem",
          lineHeight: 1.55,
          marginBottom: "1.8rem",
          display: "-webkit-box",
          WebkitLineClamp: 3,
          WebkitBoxOrient: "vertical",
          overflow: "hidden",
        }}>
          {item.overview || "No description available."}
        </p>

        <div style={{ display: "flex", gap: "12px" }}>
          <button 
            onClick={() => alert("Play functionality coming soon!")}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 32px",
              background: "#fff",
              color: "#000",
              border: "none",
              borderRadius: "4px",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Play size={22} fill="#000" /> Play
          </button>

          <button 
            onClick={onMoreInfo}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              padding: "12px 28px",
              background: "rgba(109,109,110,0.85)",
              color: "#fff",
              border: "none",
              borderRadius: "4px",
              fontSize: "1.1rem",
              fontWeight: 700,
              cursor: "pointer",
            }}
          >
            <Info size={22} /> More Info
          </button>
        </div>
      </div>
    </div>
  );
};