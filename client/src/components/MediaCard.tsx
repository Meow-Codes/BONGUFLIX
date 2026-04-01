"use client";

import { Play, Plus, ThumbsUp, Star, Info } from "lucide-react";
import { imgUrl, getTitle, getRating, getYear } from "@/utils/media";
import type { MediaItem } from "@/types/media.types";

interface MediaCardProps {
  item: MediaItem;
  focused: boolean;
  onHover: () => void;
  onClick: () => void;
}

export const MediaCard = ({ item, focused, onHover, onClick }: MediaCardProps) => {
  const poster = imgUrl(item.poster_path, "w342");
  const title = getTitle(item);

  return (
    <>
      <style>{`
        .mcard-root {
          flex-shrink: 0;
          width: clamp(130px, 12vw, 200px);
          aspect-ratio: 2/3;
          border-radius: 6px;
          overflow: visible;
          cursor: pointer;
          position: relative;
          outline: none;
          transition:
            transform 0.32s cubic-bezier(0.4,0,0.2,1),
            box-shadow 0.32s cubic-bezier(0.4,0,0.2,1),
            z-index 0s;
          will-change: transform;
        }
        .mcard-root:focus-visible {
          outline: 2px solid #E50914;
          outline-offset: 3px;
        }

        .mcard-inner {
          position: relative;
          width: 100%;
          height: 100%;
          border-radius: 6px;
          overflow: hidden;
        }

        .mcard-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          display: block;
          transition: transform 0.4s ease;
        }
        .mcard-root:hover .mcard-img,
        .mcard-root.focused .mcard-img {
          transform: scale(1.04);
        }

        .mcard-placeholder {
          width: 100%;
          height: 100%;
          background: linear-gradient(135deg,#141414,#252525);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 8px;
          color: rgba(255,255,255,0.25);
          font-size: 11px;
          text-align: center;
          padding: 10px;
        }

        .mcard-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.96) 0%,
            rgba(0,0,0,0.5) 55%,
            transparent 100%
          );
          opacity: 0;
          transition: opacity 0.25s ease;
          padding: 10px 10px 12px;
          display: flex;
          flex-direction: column;
          justify-content: flex-end;
          gap: 5px;
          pointer-events: none;
        }
        .mcard-root:hover .mcard-overlay,
        .mcard-root.focused .mcard-overlay { opacity: 1; }
        .mcard-overlay .mcard-actions,
        .mcard-overlay .mcard-actions * { pointer-events: auto; }

        .mcard-actions {
          display: flex;
          gap: 5px;
          margin-bottom: 4px;
        }
        .mcard-action-btn {
          border: none;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 50%;
          transition: transform 0.18s ease, background 0.18s ease;
          flex-shrink: 0;
        }
        .mcard-action-btn:hover { transform: scale(1.15); }
        .mcard-action-play {
          width: 28px; height: 28px;
          background: #fff;
        }
        .mcard-action-list, .mcard-action-like {
          width: 26px; height: 26px;
          background: rgba(40,40,40,0.92);
          border: 1px solid rgba(255,255,255,0.35) !important;
        }

        .mcard-title {
          font-size: 11px;
          font-weight: 700;
          color: #fff;
          line-height: 1.3;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .mcard-meta {
          display: flex;
          align-items: center;
          gap: 5px;
          flex-wrap: wrap;
        }
        .mcard-rating {
          display: flex;
          align-items: center;
          gap: 3px;
          font-size: 10px;
          color: rgba(255,255,255,0.85);
          font-weight: 600;
        }
        .mcard-sep { font-size: 10px; color: rgba(255,255,255,0.25); }
        .mcard-year { font-size: 10px; color: rgba(255,255,255,0.55); }
        .mcard-cert {
          font-size: 9px;
          border: 1px solid rgba(255,255,255,0.35);
          padding: 0 4px;
          border-radius: 2px;
          color: rgba(255,255,255,0.55);
        }
        .mcard-genres {
          font-size: 9px;
          color: rgba(255,255,255,0.4);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          margin-top: 1px;
        }
      `}</style>

      <div
        className={`mcard-root ${focused ? "focused" : ""}`}
        role="button"
        tabIndex={0}
        onMouseEnter={onHover}
        onFocus={onHover}
        onClick={onClick}
        onKeyDown={(e) => e.key === "Enter" && onClick()}
        style={{
          transform: focused ? "scale(1.12)" : "scale(1)",
          zIndex: focused ? 15 : 1,
          boxShadow: focused
            ? "0 24px 72px rgba(0,0,0,0.92), 0 0 0 2px rgba(229,9,20,0.55)"
            : "0 4px 20px rgba(0,0,0,0.5)",
        }}
      >
        <div className="mcard-inner">
          {poster ? (
            <img className="mcard-img" src={poster} alt={title} loading="lazy" decoding="async" />
          ) : (
            <div className="mcard-placeholder">
              <Play size={20} />
              <span>{title}</span>
            </div>
          )}

          <div className="mcard-overlay">
            <div className="mcard-actions">
              <button
                className="mcard-action-btn mcard-action-play"
                onClick={(e) => { e.stopPropagation(); onClick(); }}
                aria-label="Play"
              >
                <Play size={11} fill="black" color="black" />
              </button>
              <button
                className="mcard-action-btn mcard-action-list"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                aria-label="More info"
                style={{ border: "1px solid rgba(255,255,255,0.35)" }}
              >
                <Plus size={12} color="#fff" />
              </button>
              <button
                className="mcard-action-btn mcard-action-like"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                aria-label="More info"
                style={{ border: "1px solid rgba(255,255,255,0.35)" }}
              >
                <ThumbsUp size={10} color="#fff" />
              </button>
              <button
                className="mcard-action-btn mcard-action-like"
                onClick={(e) => {
                  e.stopPropagation();
                  onClick();
                }}
                aria-label="More info"
                style={{ border: "1px solid rgba(255,255,255,0.35)" }}
              >
                <Info size={11} color="#fff" />
              </button>
            </div>

            <div className="mcard-title">{title}</div>
            <div className="mcard-meta">
              {getRating(item) !== "N/A" && (
                <div className="mcard-rating">
                  <Star size={8} color="#E50914" fill="#E50914" />
                  {getRating(item)}
                </div>
              )}
              <span className="mcard-sep">·</span>
              <span className="mcard-year">{getYear(item)}</span>
              {item.age_certification && (
                <>
                  <span className="mcard-sep">·</span>
                  <span className="mcard-cert">{item.age_certification}</span>
                </>
              )}
            </div>
            {item.genres && item.genres.length > 0 && (
              <div className="mcard-genres">{item.genres.slice(0, 2).join(" · ")}</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};