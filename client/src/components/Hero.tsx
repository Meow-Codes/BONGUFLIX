"use client";

import { useState } from "react";
import { Play, Info, Star, Clock, Volume2, VolumeX, Plus } from "lucide-react";
import { imgUrl, getTitle, getYear, getRating, getRuntime } from "@/utils/media";
import type { MediaItem } from "@/types/media.types";

interface HeroProps {
  item: MediaItem;
  onMoreInfo: () => void;
}

export const Hero = ({ item, onMoreInfo }: HeroProps) => {
  const [muted, setMuted] = useState(true);
  const backdrop =
    imgUrl(item.backdrop_path, "original") || imgUrl(item.poster_path, "w1280");
  const title = getTitle(item);
  const rating = getRating(item);
  const year = getYear(item);
  const runtime = getRuntime(item);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;800;900&display=swap');

        .hero-root {
          position: relative;
          height: 100vh;
          min-height: 620px;
          overflow: hidden;
          font-family: 'Outfit', sans-serif;
        }

        .hero-bg {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          animation: heroBgZoom 22s ease-in-out infinite alternate;
          transform-origin: center center;
        }
        @keyframes heroBgZoom {
          from { transform: scale(1); }
          to   { transform: scale(1.07); }
        }

        .hero-grad-side {
          position: absolute; inset: 0;
          background: linear-gradient(
            to right,
            rgba(0,0,0,0.94) 0%,
            rgba(0,0,0,0.6) 42%,
            rgba(0,0,0,0.18) 72%,
            transparent 100%
          );
        }
        .hero-grad-bottom {
          position: absolute; inset: 0;
          background: linear-gradient(
            to top,
            #000 0%,
            rgba(0,0,0,0.55) 28%,
            transparent 58%
          );
        }

        .hero-content {
          position: absolute;
          bottom: 28%;
          left: 4%;
          max-width: min(560px, 46%);
          animation: heroContentRise 1s cubic-bezier(0.16,1,0.3,1) 0.2s both;
        }
        @keyframes heroContentRise {
          from { opacity: 0; transform: translateY(36px); filter: blur(4px); }
          to   { opacity: 1; transform: translateY(0);    filter: blur(0); }
        }

        .hero-genres {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
          margin-bottom: 14px;
        }
        .hero-genre-tag {
          font-size: 11px;
          font-weight: 600;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.55);
          padding: 3px 10px;
          border: 1px solid rgba(255,255,255,0.18);
          border-radius: 20px;
          backdrop-filter: blur(4px);
          background: rgba(255,255,255,0.05);
        }

        .hero-title {
          font-family: 'Outfit', sans-serif;
          font-size: clamp(2.2rem, 5.2vw, 4.4rem);
          font-weight: 900;
          line-height: 1.02;
          letter-spacing: -0.025em;
          margin-bottom: 14px;
          text-shadow: 0 4px 28px rgba(0,0,0,0.7);
        }

        .hero-meta {
          display: flex;
          align-items: center;
          gap: 12px;
          flex-wrap: wrap;
          margin-bottom: 16px;
        }
        .hero-rating {
          display: flex;
          align-items: center;
          gap: 5px;
          color: #46d369;
          font-weight: 700;
          font-size: 14px;
        }
        .hero-meta-item {
          color: rgba(255,255,255,0.6);
          font-size: 13px;
          font-weight: 400;
        }
        .hero-cert {
          border: 1px solid rgba(255,255,255,0.4);
          padding: 1px 8px;
          border-radius: 3px;
          font-size: 11px;
          color: rgba(255,255,255,0.65);
          font-weight: 500;
        }
        .hero-runtime {
          display: flex;
          align-items: center;
          gap: 4px;
          color: rgba(255,255,255,0.55);
          font-size: 13px;
        }

        .hero-overview {
          color: rgba(255,255,255,0.82);
          font-size: clamp(13px, 1vw, 15px);
          line-height: 1.72;
          margin-bottom: 26px;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
          font-weight: 400;
        }

        .hero-actions {
          display: flex;
          gap: 10px;
          flex-wrap: wrap;
        }

        .hero-btn {
          display: inline-flex;
          align-items: center;
          gap: 9px;
          padding: clamp(10px, 1vw, 14px) clamp(20px, 2.2vw, 30px);
          border: none;
          border-radius: 5px;
          font-family: 'Outfit', sans-serif;
          font-weight: 700;
          font-size: clamp(13px, 1vw, 16px);
          cursor: pointer;
          transition: transform 0.2s ease, opacity 0.2s ease, box-shadow 0.2s ease;
          position: relative;
          overflow: hidden;
        }
        .hero-btn::after {
          content: '';
          position: absolute;
          inset: 0;
          background: rgba(255,255,255,0);
          transition: background 0.2s;
        }
        .hero-btn:hover::after { background: rgba(255,255,255,0.08); }
        .hero-btn:hover { transform: translateY(-2px); }
        .hero-btn:active { transform: scale(0.98); }

        .hero-btn-play {
          background: #fff;
          color: #000;
          box-shadow: 0 6px 24px rgba(0,0,0,0.35);
        }
        .hero-btn-play:hover { box-shadow: 0 10px 32px rgba(0,0,0,0.5); }

        .hero-btn-info {
          background: rgba(109,109,110,0.75);
          color: #fff;
          backdrop-filter: blur(6px);
        }

        .hero-btn-list {
          background: rgba(255,255,255,0.1);
          color: #fff;
          border: 1px solid rgba(255,255,255,0.25) !important;
          backdrop-filter: blur(6px);
          padding: clamp(10px, 1vw, 14px) clamp(14px, 1.5vw, 20px) !important;
        }

        .hero-mute-btn {
          position: absolute;
          bottom: 28%;
          right: 4%;
          width: 40px; height: 40px;
          border-radius: 50%;
          border: 1.5px solid rgba(255,255,255,0.45);
          background: rgba(0,0,0,0.35);
          backdrop-filter: blur(6px);
          color: #fff;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: border-color 0.2s, background 0.2s, transform 0.2s;
        }
        .hero-mute-btn:hover {
          border-color: #fff;
          background: rgba(0,0,0,0.6);
          transform: scale(1.08);
        }

        /* Progress bar tease */
        .hero-progress {
          position: absolute;
          bottom: 0;
          left: 0;
          right: 0;
          height: 3px;
          background: rgba(255,255,255,0.1);
          overflow: hidden;
        }
        .hero-progress-fill {
          height: 100%;
          width: 34%;
          background: linear-gradient(to right, #E50914, #ff6b35);
          animation: progressLoad 1.5s ease 0.6s both;
        }
        @keyframes progressLoad {
          from { width: 0; }
          to   { width: 34%; }
        }

        /* Match badge */
        .hero-match {
          display: inline-flex;
          align-items: center;
          gap: 5px;
          background: rgba(70,211,105,0.12);
          border: 1px solid rgba(70,211,105,0.3);
          color: #46d369;
          font-size: 11px;
          font-weight: 700;
          padding: 3px 10px;
          border-radius: 20px;
          letter-spacing: 0.04em;
          margin-bottom: 14px;
          backdrop-filter: blur(4px);
        }
      `}</style>

      <div className="hero-root">
        {backdrop && (
          <img className="hero-bg" src={backdrop} alt={title} />
        )}
        <div className="hero-grad-side" />
        <div className="hero-grad-bottom" />

        <div className="hero-content">
          {/* Genre tags */}
          {item.genres && item.genres.length > 0 && (
            <div className="hero-genres">
              {item.genres.slice(0, 3).map((g) => (
                <span key={g} className="hero-genre-tag">{g}</span>
              ))}
            </div>
          )}

          <h1 className="hero-title">{title}</h1>

          {/* Meta */}
          <div className="hero-meta">
            {rating !== "N/A" && (
              <div className="hero-rating">
                <Star size={13} fill="#46d369" color="#46d369" />
                {rating}
              </div>
            )}
            <span className="hero-meta-item">{year}</span>
            {item.age_certification && (
              <span className="hero-cert">{item.age_certification}</span>
            )}
            {runtime && (
              <span className="hero-runtime">
                <Clock size={12} />{runtime}
              </span>
            )}
          </div>

          <p className="hero-overview">
            {item.overview || "No description available."}
          </p>

          <div className="hero-actions">
            <button className="hero-btn hero-btn-play">
              <Play size={16} fill="black" />
              Play
            </button>
            <button className="hero-btn hero-btn-info" onClick={onMoreInfo}>
              <Info size={16} />
              More Info
            </button>
            <button className="hero-btn hero-btn-list" style={{ border: "1px solid rgba(255,255,255,0.25)" }}>
              <Plus size={16} />
            </button>
          </div>
        </div>

        {/* Mute toggle */}
        <button
          className="hero-mute-btn"
          onClick={() => setMuted((m) => !m)}
          aria-label={muted ? "Unmute" : "Mute"}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>

        {/* Fake progress bar — indicates "in progress" feel */}
        <div className="hero-progress">
          <div className="hero-progress-fill" />
        </div>
      </div>
    </>
  );
};