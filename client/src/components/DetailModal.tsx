"use client";

import { useState, useEffect } from "react";
import {
  X, Play, Plus, Star, Clock, ThumbsUp, Share2,
  ChevronDown, Loader2,
} from "lucide-react";
import { imgUrl, getTitle, getYear, getRating, getRuntime } from "@/utils/media";
import type { MediaItem, Season, Episode } from "@/types/media.types";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:6942";

interface DetailModalProps {
  item: MediaItem;
  onClose: () => void;
}

type Tab = "overview" | "episodes" | "similar";

import { fetchMovieDetail, fetchTVDetail, fetchSimilar, fetchSeasons, fetchEpisodes } from "@/utils/api";

export const DetailModal = ({ item, onClose }: DetailModalProps) => {
  const [full, setFull] = useState<MediaItem | null>(null);
  const [similar, setSimilar] = useState<MediaItem[]>([]);
  const [seasons, setSeasons] = useState<Season[]>([]);
  const [episodes, setEpisodes] = useState<Episode[]>([]);
  const [activeSeason, setActiveSeason] = useState(1);
  const [tab, setTab] = useState<Tab>("overview");
  const [loadingDetail, setLoadingDetail] = useState(true);
  const [loadingEp, setLoadingEp] = useState(false);

  useEffect(() => {
    document.body.style.overflow = "hidden";

    const load = async () => {
      try {
        const detailFn = item.media_type === "movie" ? fetchMovieDetail : fetchTVDetail;
        
        const [detailData, simData] = await Promise.all([
          detailFn(item.id),
          fetchSimilar(item.id, item.media_type)
        ]);

        if (detailData) setFull(detailData);
        if (simData) {
          const sd = simData;
          setSimilar(Array.isArray(sd) ? sd : (sd.data ?? []));
        }

        if (item.media_type === "tv") {
          const sRes = await fetchSeasons(item.id);
          if (sRes) {
            const sd = sRes;
            const allSeasons: Season[] = Array.isArray(sd) ? sd : (sd.data ?? []);
            const real = allSeasons.filter((s) => s.season_number > 0);
            setSeasons(real);
            const first = real[0];
            if (first) {
              setActiveSeason(first.season_number);
              loadEpisodes(first.season_number);
            }
          }
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoadingDetail(false);
      }
    };

    load();
    return () => { document.body.style.overflow = ""; };
  }, [item]);

  const loadEpisodes = async (seasonNum: number) => {
    setLoadingEp(true);
    try {
      const d = await fetchEpisodes(item.id, seasonNum);
      if (d) {
        setEpisodes(Array.isArray(d) ? d : (d.data ?? []));
      }
    } catch (e) { console.error(e); }
    finally { setLoadingEp(false); }
  };

  const handleSeasonChange = (n: number) => {
    setActiveSeason(n);
    loadEpisodes(n);
  };

  useEffect(() => {
    const h = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", h);
    return () => window.removeEventListener("keydown", h);
  }, [onClose]);

  const display = full ?? item;
  const backdrop = imgUrl(display.backdrop_path, "original") || imgUrl(display.poster_path, "w780");
  const tabs: Tab[] = ["overview", ...(display.media_type === "tv" ? ["episodes" as Tab] : []), "similar"];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@300;400;500;600;700;900&display=swap');

        .modal-backdrop {
          position: fixed; inset: 0; z-index: 500;
          background: rgba(0,0,0,0.78);
          backdrop-filter: blur(10px);
          display: flex; align-items: flex-start; justify-content: center;
          padding: 40px 16px 60px;
          overflow-y: auto;
          animation: modalBgIn 0.22s ease;
          font-family: 'Outfit', sans-serif;
        }
        @keyframes modalBgIn { from{opacity:0} to{opacity:1} }

        .modal-card {
          width: min(900px, 96vw);
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          background: #181818;
          border-radius: 14px;
          overflow: hidden;
          box-shadow: 0 50px 130px rgba(0,0,0,0.95);
          animation: modalCardIn 0.35s cubic-bezier(0.16,1,0.3,1) both;
          position: relative;
        }
        @keyframes modalCardIn {
          from { opacity: 0; transform: scale(0.94) translateY(24px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }

        .modal-close {
          position: absolute; top: 14px; right: 14px; z-index: 10;
          width: 36px; height: 36px; border-radius: 50%;
          background: rgba(20,20,20,0.9);
          border: none; color: #fff; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          transition: background 0.15s, transform 0.15s;
          backdrop-filter: blur(4px);
        }
        .modal-close:hover { background: #333; transform: scale(1.08); }

        .modal-backdrop-img {
          position: relative;
          aspect-ratio: 16/9;
          overflow: hidden;
        }
        .modal-backdrop-img img {
          width: 100%; height: 100%; object-fit: cover; display: block;
        }
        .modal-backdrop-grad {
          position: absolute; inset: 0;
          background: linear-gradient(to top, #181818 0%, rgba(24,24,24,0.15) 60%, transparent 100%);
        }
        .modal-backdrop-actions {
          position: absolute; bottom: 22px; left: 24px; right: 60px;
        }
        .modal-title {
          font-size: clamp(20px, 3.5vw, 36px);
          font-weight: 900;
          line-height: 1.05;
          letter-spacing: -0.02em;
          margin-bottom: 16px;
          text-shadow: 2px 2px 12px rgba(0,0,0,0.55);
        }
        .modal-hero-actions { display: flex; gap: 10px; flex-wrap: wrap; }

        .modal-btn {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 10px 24px; border: none; border-radius: 5px;
          font-family: 'Outfit', sans-serif; font-weight: 700;
          font-size: 15px; cursor: pointer;
          transition: opacity 0.15s, transform 0.15s;
        }
        .modal-btn:hover { opacity: 0.88; transform: scale(1.02); }
        .modal-btn-play { background: #fff; color: #000; }
        .modal-btn-list { background: rgba(109,109,110,0.75); color: #fff; }
        .modal-btn-icon {
          width: 40px; height: 40px; padding: 0;
          border-radius: 50% !important;
          justify-content: center;
          background: rgba(40,40,40,0.75);
          border: 2px solid rgba(255,255,255,0.45) !important;
          color: #fff;
        }
        .modal-btn-icon:hover { border-color: #fff !important; }

        .modal-body { 
          padding: 0 24px 28px; 
          overflow-y: auto;
          flex: 1;
        }

        /* Meta bar */
        .modal-meta {
          display: flex; align-items: center; gap: 12px;
          flex-wrap: wrap; padding: 14px 0 18px;
        }
        .modal-match { color: #46d369; font-weight: 700; font-size: 14px; }
        .modal-meta-item { color: rgba(255,255,255,0.55); font-size: 13px; }
        .modal-cert {
          border: 1px solid rgba(255,255,255,0.35);
          padding: 1px 8px; border-radius: 3px;
          font-size: 11px; color: rgba(255,255,255,0.6);
        }
        .modal-runtime {
          display: flex; align-items: center; gap: 4px;
          color: rgba(255,255,255,0.55); font-size: 13px;
        }
        .modal-status {
          font-size: 11px; font-weight: 600; padding: 2px 10px; border-radius: 12px;
        }

        /* Tabs */
        .modal-tabs {
          display: flex; border-bottom: 1px solid rgba(255,255,255,0.1);
          margin-bottom: 20px; gap: 0;
        }
        .modal-tab {
          padding: 10px 18px; background: none; border: none;
          border-bottom: 2px solid transparent;
          color: rgba(255,255,255,0.45); font-size: 13px; font-weight: 600;
          cursor: pointer; text-transform: capitalize; letter-spacing: 0.03em;
          font-family: 'Outfit', sans-serif;
          transition: color 0.18s, border-color 0.18s;
          margin-bottom: -1px;
        }
        .modal-tab:hover { color: rgba(255,255,255,0.75); }
        .modal-tab.active { color: #fff; border-bottom-color: #E50914; }

        /* Overview */
        .modal-overview-grid {
          display: grid; grid-template-columns: 1fr 200px; gap: 28px;
        }
        @media (max-width: 600px) {
          .modal-overview-grid { grid-template-columns: 1fr; }
        }
        .modal-overview-text {
          color: rgba(255,255,255,0.78);
          font-size: 14px; line-height: 1.72; margin-bottom: 16px;
          font-weight: 400;
        }
        .modal-meta-label { color: rgba(255,255,255,0.65); }
        .modal-meta-value { color: rgba(255,255,255,0.38); font-size: 12px; margin-bottom: 8px; }

        /* Cast strip */
        .modal-cast-strip {
          display: flex; gap: 10px; overflow-x: auto;
          scrollbar-width: none; padding-bottom: 6px; margin-top: 14px;
        }
        .modal-cast-strip::-webkit-scrollbar { display: none; }
        .modal-cast-item {
          flex-shrink: 0; width: 72px; text-align: center;
        }
        .modal-cast-avatar {
          width: 52px; height: 52px; border-radius: 50%;
          object-fit: cover; display: block; margin: 0 auto 5px;
          background: #252525;
        }
        .modal-cast-name {
          font-size: 10px; font-weight: 600; color: rgba(255,255,255,0.7);
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }
        .modal-cast-char {
          font-size: 9px; color: rgba(255,255,255,0.35); margin-top: 1px;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
        }

        /* Episodes */
        .ep-season-select {
          background: #2a2a2a; color: #fff;
          border: 1px solid rgba(255,255,255,0.15);
          padding: 8px 14px; border-radius: 6px;
          font-size: 14px; font-family: 'Outfit', sans-serif;
          cursor: pointer; margin-bottom: 16px; outline: none;
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8'%3E%3Cpath fill='%23fff' d='M6 8L0 0h12z'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
          padding-right: 32px;
        }

        .ep-list {
          display: flex; flex-direction: column; gap: 6px;
          max-height: 400px; overflow-y: auto; padding-right: 4px;
          scrollbar-width: thin; scrollbar-color: #333 transparent;
        }
        .ep-item {
          display: flex; align-items: flex-start; gap: 14px;
          padding: 12px 14px; border-radius: 8px;
          background: rgba(255,255,255,0.03);
          transition: background 0.15s; cursor: pointer;
        }
        .ep-item:hover { background: rgba(255,255,255,0.08); }
        .ep-thumb {
          flex-shrink: 0; width: 120px; aspect-ratio: 16/9;
          border-radius: 5px; overflow: hidden;
          background: #111;
          display: flex; align-items: center; justify-content: center;
        }
        .ep-thumb img { width: 100%; height: 100%; object-fit: cover; }
        .ep-info { flex: 1; }
        .ep-header {
          display: flex; justify-content: space-between;
          align-items: baseline; margin-bottom: 5px;
        }
        .ep-title { font-size: 13px; font-weight: 700; }
        .ep-runtime { font-size: 12px; color: rgba(255,255,255,0.38); flex-shrink: 0; margin-left: 10px; }
        .ep-overview { font-size: 12px; color: rgba(255,255,255,0.48); line-height: 1.55; }

        /* Similar */
        .similar-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          gap: 12px;
        }
        .similar-item {
          border-radius: 6px; overflow: hidden;
          position: relative; aspect-ratio: 2/3;
          cursor: pointer; background: #222;
          transition: transform 0.22s ease, box-shadow 0.22s ease;
        }
        .similar-item:hover {
          transform: scale(1.04);
          box-shadow: 0 12px 36px rgba(0,0,0,0.6);
        }
        .similar-item img { width: 100%; height: 100%; object-fit: cover; display: block; }
        .similar-item-info {
          position: absolute; bottom: 0; left: 0; right: 0;
          padding: 18px 10px 10px;
          background: linear-gradient(to top, rgba(0,0,0,0.92), transparent);
        }
        .similar-item-title { font-size: 11px; font-weight: 700; margin-bottom: 2px; }
        .similar-item-meta { font-size: 10px; color: rgba(255,255,255,0.45); }
      `}</style>

      <div className="modal-backdrop" onClick={onClose}>
        <div className="modal-card" onClick={(e) => e.stopPropagation()}>
          <button className="modal-close" onClick={onClose}><X size={15} /></button>

          {/* Backdrop image */}
          <div className="modal-backdrop-img">
            {backdrop
              ? <img src={backdrop} alt={getTitle(display)} />
              : <div style={{ width: "100%", height: "100%", background: "#111" }} />
            }
            <div className="modal-backdrop-grad" />

            <div className="modal-backdrop-actions">
              <h2 className="modal-title">{getTitle(display)}</h2>
              <div className="modal-hero-actions">
                <button className="modal-btn modal-btn-play">
                  <Play size={16} fill="black" /> Play
                </button>
                <button className="modal-btn modal-btn-list">
                  <Plus size={16} /> My List
                </button>
                <button className="modal-btn modal-btn-icon" style={{ border: "2px solid rgba(255,255,255,0.45)" }}>
                  <ThumbsUp size={15} />
                </button>
                <button className="modal-btn modal-btn-icon" style={{ border: "2px solid rgba(255,255,255,0.45)" }}>
                  <Share2 size={15} />
                </button>
              </div>
            </div>
          </div>

          <div className="modal-body">
            {/* Meta bar */}
            <div className="modal-meta">
              {getRating(display) !== "N/A" && (
                <span className="modal-match">
                  <Star size={11} fill="#46d369" color="#46d369" style={{ marginRight: 3 }} />
                  {getRating(display)}/10
                </span>
              )}
              <span className="modal-meta-item">{getYear(display)}</span>
              {display.age_certification && (
                <span className="modal-cert">{display.age_certification}</span>
              )}
              {getRuntime(display) && (
                <span className="modal-runtime"><Clock size={11} /> {getRuntime(display)}</span>
              )}
              {display.status && display.media_type === "tv" && (
                <span
                  className="modal-status"
                  style={{
                    background: display.status === "Returning Series" ? "rgba(70,211,105,0.12)" : "rgba(255,255,255,0.07)",
                    color: display.status === "Returning Series" ? "#46d369" : "rgba(255,255,255,0.5)",
                  }}
                >{display.status}</span>
              )}
            </div>

            {/* Tabs */}
            <div className="modal-tabs">
              {tabs.map((t) => (
                <button key={t} className={`modal-tab ${tab === t ? "active" : ""}`} onClick={() => setTab(t)}>
                  {t}
                </button>
              ))}
            </div>

            {/* Loading */}
            {loadingDetail ? (
              <div style={{ textAlign: "center", padding: "40px 0" }}>
                <Loader2 size={26} color="#E50914" style={{ animation: "spin 0.9s linear infinite" }} />
              </div>
            ) : (
              <>
                {/* Overview */}
                {tab === "overview" && (
                  <div className="modal-overview-grid">
                    <div>
                      <p className="modal-overview-text">
                        {display.overview || "No overview available."}
                      </p>
                      {display.cast && display.cast.length > 0 && (
                        <>
                          <div className="modal-meta-value">
                            <span className="modal-meta-label">Cast: </span>
                            {display.cast.slice(0, 8).map((c) => c.name).join(", ")}
                          </div>
                          <div className="modal-cast-strip">
                            {display.cast.slice(0, 8).map((c) => (
                              <div key={c.person_id} className="modal-cast-item">
                                {c.profile_path
                                  ? <img className="modal-cast-avatar" src={imgUrl(c.profile_path, "w185")!} alt={c.name} />
                                  : <div className="modal-cast-avatar" style={{ background: "#252525", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 16, color: "rgba(255,255,255,0.25)" }}>{c.name[0]}</div>
                                }
                                <div className="modal-cast-name">{c.name}</div>
                                {c.character_name && <div className="modal-cast-char">{c.character_name}</div>}
                              </div>
                            ))}
                          </div>
                        </>
                      )}
                    </div>
                    <div>
                      {display.genres && display.genres.length > 0 && (
                        <div className="modal-meta-value">
                          <span className="modal-meta-label">Genres: </span>
                          {display.genres.join(", ")}
                        </div>
                      )}
                      {(display.director || display.creator) && (
                        <div className="modal-meta-value">
                          <span className="modal-meta-label">
                            {display.media_type === "movie" ? "Director: " : "Creator: "}
                          </span>
                          {display.director ?? display.creator}
                        </div>
                      )}
                      {display.imdb_rating && (
                        <div className="modal-meta-value">
                          <span className="modal-meta-label">IMDb: </span>
                          {display.imdb_rating}/10
                        </div>
                      )}
                      <div className="modal-meta-value">
                        <span className="modal-meta-label">
                          {display.media_type === "movie" ? "Released: " : "First aired: "}
                        </span>
                        {getYear(display)}
                      </div>
                    </div>
                  </div>
                )}

                {/* Episodes */}
                {tab === "episodes" && display.media_type === "tv" && (
                  <div>
                    {seasons.length > 1 && (
                      <select
                        className="ep-season-select"
                        value={activeSeason}
                        onChange={(e) => handleSeasonChange(Number(e.target.value))}
                      >
                        {seasons.map((s) => (
                          <option key={s.id} value={s.season_number}>
                            {s.name ?? `Season ${s.season_number}`}
                          </option>
                        ))}
                      </select>
                    )}

                    {loadingEp ? (
                      <div style={{ textAlign: "center", padding: "30px 0" }}>
                        <Loader2 size={22} color="#E50914" style={{ animation: "spin 0.9s linear infinite" }} />
                      </div>
                    ) : (
                      <div className="ep-list">
                        {episodes.length === 0 ? (
                          <div style={{ color: "rgba(255,255,255,0.35)", padding: "20px 0" }}>
                            No episodes available.
                          </div>
                        ) : episodes.map((ep) => (
                          <div key={ep.id} className="ep-item">
                            <div className="ep-thumb">
                              {ep.still_path
                                ? <img src={`https://image.tmdb.org/t/p/w300${ep.still_path}`} alt={ep.title} />
                                : <Play size={18} color="rgba(255,255,255,0.2)" />
                              }
                            </div>
                            <div className="ep-info">
                              <div className="ep-header">
                                <span className="ep-title">{ep.episode_number}. {ep.title}</span>
                                {ep.runtime && <span className="ep-runtime">{ep.runtime}m</span>}
                              </div>
                              <p className="ep-overview">{ep.overview || "No description."}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                {/* Similar */}
                {tab === "similar" && (
                  <div className="similar-grid">
                    {similar.length === 0 ? (
                      <div style={{ color: "rgba(255,255,255,0.35)", gridColumn: "1/-1" }}>
                        No similar titles found.
                      </div>
                    ) : similar.slice(0, 12).map((s) => {
                      const p = imgUrl(s.poster_path, "w342");
                      return (
                        <div key={`${s.media_type}-${s.id}`} className="similar-item">
                          {p
                            ? <img src={p} alt={getTitle(s)} />
                            : <div style={{ width: "100%", height: "100%", background: "#1e1e1e", display: "flex", alignItems: "center", justifyContent: "center" }}>
                                <span style={{ color: "rgba(255,255,255,0.2)", fontSize: 10, padding: 8, textAlign: "center" }}>{getTitle(s)}</span>
                              </div>
                          }
                          <div className="similar-item-info">
                            <div className="similar-item-title">{getTitle(s)}</div>
                            <div className="similar-item-meta">{getRating(s) !== "N/A" ? `★ ${getRating(s)}` : ""} {getYear(s)}</div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </>
  );
};