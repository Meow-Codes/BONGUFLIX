"use client";

import { useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { MediaCard } from "./MediaCard";
import type { MediaItem, HomeRow } from "@/types/media.types";

interface MediaRowProps {
  row: HomeRow;
  rowIdx: number;
  focusedRow: number;
  focusedCol: number;
  onHover: (row: number, col: number) => void;
  onClick: (item: MediaItem) => void;
}

export const MediaRow = ({
  row, rowIdx, focusedRow, focusedCol, onHover, onClick,
}: MediaRowProps) => {
  const active = focusedRow === rowIdx;
  const stripRef = useRef<HTMLDivElement>(null);

  const scroll = (dir: "left" | "right") => {
    if (!stripRef.current) return;
    const amount = stripRef.current.clientWidth * 0.72;
    stripRef.current.scrollBy({ left: dir === "right" ? amount : -amount, behavior: "smooth" });
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;700&display=swap');

        .row-root { margin-bottom: clamp(24px, 2.8vw, 48px); position: relative; }

        .row-header {
          display: flex;
          align-items: baseline;
          gap: 12px;
          padding-left: 4%;
          margin-bottom: 10px;
        }
        .row-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(13px, 1.3vw, 19px);
          font-weight: 700;
          color: rgba(255,255,255,0.85);
          letter-spacing: 0.01em;
          transition: color 0.2s;
        }
        .row-title.active { color: #fff; }
        .row-explore {
          font-size: 11px;
          font-weight: 600;
          color: #E50914;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0;
          transform: translateX(-6px);
          transition: opacity 0.25s ease, transform 0.25s ease;
          cursor: pointer;
          white-space: nowrap;
        }
        .row-header:hover .row-explore,
        .row-title.active + .row-explore { opacity: 1; transform: translateX(0); }

        .row-strip-wrap { position: relative; }

        .row-strip {
          display: flex;
          gap: clamp(4px, 0.45vw, 8px);
          overflow-x: auto;
          scroll-behavior: smooth;
          scrollbar-width: none;
          padding: 10px 4% 18px;
        }
        .row-strip::-webkit-scrollbar { display: none; }

        .row-arrow {
          position: absolute;
          top: 0; bottom: 0;
          width: 52px;
          z-index: 20;
          display: flex;
          align-items: center;
          justify-content: center;
          border: none;
          cursor: pointer;
          opacity: 0;
          transition: opacity 0.22s ease, background 0.22s ease;
          color: #fff;
        }
        .row-arrow svg {
          filter: drop-shadow(0 2px 8px rgba(0,0,0,0.7));
          transition: transform 0.2s ease;
        }
        .row-arrow:hover svg { transform: scale(1.15); }
        .row-arrow-left {
          left: 0;
          background: linear-gradient(to right, rgba(0,0,0,0.85), transparent);
          border-radius: 0 6px 6px 0;
        }
        .row-arrow-right {
          right: 0;
          background: linear-gradient(to left, rgba(0,0,0,0.85), transparent);
          border-radius: 6px 0 0 6px;
        }
        .row-strip-wrap:hover .row-arrow { opacity: 1; }
      `}</style>

      <div className="row-root" id={`row-${row.id}`}>
        <div className="row-header">
          <h2 className={`row-title ${active ? "active" : ""}`}>{row.title}</h2>
          <span className="row-explore">Explore All →</span>
        </div>

        <div className="row-strip-wrap">
          <button className="row-arrow row-arrow-left" onClick={() => scroll("left")} aria-label="scroll left">
            <ChevronLeft size={30} />
          </button>

          <div ref={stripRef} className="row-strip">
            {row.items.map((item, colIdx) => (
              <MediaCard
                key={`${item.media_type}-${item.id}`}
                item={item}
                focused={active && focusedCol === colIdx}
                onHover={() => onHover(rowIdx, colIdx)}
                onClick={() => onClick(item)}
              />
            ))}
          </div>

          <button className="row-arrow row-arrow-right" onClick={() => scroll("right")} aria-label="scroll right">
            <ChevronRight size={30} />
          </button>
        </div>
      </div>
    </>
  );
};