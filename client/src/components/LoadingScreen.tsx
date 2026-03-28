"use client";

export const LoadingScreen = ({ message = "Loading BONGUFLIX..." }: { message?: string }) => (
  <>
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600&display=swap');

      .loading-root {
        min-height: 100vh;
        background: #000;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        gap: 30px;
        font-family: 'Outfit', sans-serif;
      }

      .loading-logo {
        font-family: 'Bebas Neue', cursive;
        font-size: 56px;
        color: #E50914;
        letter-spacing: 0.15em;
        animation: loadLogoGlow 2s ease-in-out infinite;
      }
      @keyframes loadLogoGlow {
        0%,100% { text-shadow: 0 0 18px rgba(229,9,20,0.25); }
        50%      { text-shadow: 0 0 60px rgba(229,9,20,0.8), 0 0 120px rgba(229,9,20,0.2); }
      }

      .loading-dots { display: flex; gap: 8px; }
      .loading-dot {
        width: 8px; height: 8px;
        border-radius: 50%;
        background: #E50914;
        animation: dotBounce 1.2s ease-in-out infinite;
      }
      .loading-dot:nth-child(2) { animation-delay: 0.18s; }
      .loading-dot:nth-child(3) { animation-delay: 0.36s; }
      @keyframes dotBounce {
        0%,80%,100% { transform: scale(0.55); opacity: 0.35; }
        40%          { transform: scale(1.25); opacity: 1; }
      }

      .loading-msg {
        color: rgba(255,255,255,0.28);
        font-size: 13px;
        font-weight: 400;
        letter-spacing: 0.08em;
        text-transform: uppercase;
        margin-top: -10px;
      }
    `}</style>
    <div className="loading-root">
      <div className="loading-logo">BONGUFLIX</div>
      <div className="loading-dots">
        <div className="loading-dot" />
        <div className="loading-dot" />
        <div className="loading-dot" />
      </div>
      <div className="loading-msg">{message}</div>
    </div>
  </>
);