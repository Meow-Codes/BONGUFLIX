  "use client";

  import { useEffect, useState, useRef, useCallback } from "react";
  import { useParams, useRouter } from "next/navigation";

  import { Navbar } from "@/components/Navbar";
  import { Hero } from "@/components/Hero";
  import { MediaRow } from "@/components/MediaRow";
  import { DetailModal } from "@/components/DetailModal";
  import { SearchOverlay } from "@/components/SearchOverlay";
  import { LoadingScreen } from "@/components/LoadingScreen";
  import { useQuery } from "@tanstack/react-query";
  import { fetchHome, fetchUser } from "@/utils/api";

  import type { MediaItem, HomeResponse } from "@/types/media.types";

  export default function DashboardPage() {
    const params = useParams();
    const router = useRouter();
    const slug = typeof params?.slug === "string" ? params.slug : "";

    const [focusedRow, setFocusedRow] = useState(0);
    const [focusedCol, setFocusedCol] = useState(0);
    const [modalItem, setModalItem] = useState<MediaItem | null>(null);
    const [searchOpen, setSearchOpen] = useState(false);
    const [navScrolled, setNavScrolled] = useState(false);

    // ── Data fetch ─────────────────────────────────────────────────────────────
    const { data: user, isLoading: userLoading, error: userError } = useQuery({
      queryKey: ["user", slug],
      queryFn: () => fetchUser(slug),
      retry: false,
      refetchOnWindowFocus: false, // critical to avoid infinite loops on auth failure redirects
    });

    const { data: homeData, isLoading: homeLoading, error: homeError } = useQuery({
      queryKey: ["home"],
      queryFn: fetchHome,
      retry: 1,
      enabled: !!user, // only fetch home if user auth succeeded
    });

    const loading = userLoading || (homeLoading && !!user);
    const error: string | null = userError ? "Session expired. Please log in again." : (homeError ? "Failed to load home data." : null);

    useEffect(() => {
      if (userError) {
        const timer = setTimeout(() => router.push("/auth"), 1800);
        return () => clearTimeout(timer);
      }
    }, [userError, router]);

    // ── Scroll listener ────────────────────────────────────────────────────────
    useEffect(() => {
      const h = () => setNavScrolled(window.scrollY > 60);
      window.addEventListener("scroll", h, { passive: true });
      return () => window.removeEventListener("scroll", h);
    }, []);

    // ── Keyboard nav ──────────────────────────────────────────────────────────
    useEffect(() => {
      const rows = homeData?.rows ?? [];
      const h = (e: KeyboardEvent) => {
        if (modalItem || searchOpen) return;

        if (e.key === "/" && !["INPUT", "TEXTAREA"].includes((e.target as HTMLElement).tagName)) {
          e.preventDefault();
          setSearchOpen(true);
          return;
        }

        const rowLen = rows[focusedRow]?.items.length ?? 0;
        switch (e.key) {
          case "ArrowRight":
            e.preventDefault();
            setFocusedCol((c) => Math.min(c + 1, rowLen - 1));
            break;
          case "ArrowLeft":
            e.preventDefault();
            setFocusedCol((c) => Math.max(c - 1, 0));
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
            if (rows[focusedRow]?.items[focusedCol]) {
              setModalItem(rows[focusedRow].items[focusedCol]);
            }
            break;
        }
      };
      window.addEventListener("keydown", h);
      return () => window.removeEventListener("keydown", h);
    }, [homeData, focusedRow, focusedCol, modalItem, searchOpen]);

    // ── Guards ─────────────────────────────────────────────────────────────────
    if (loading) return <LoadingScreen />;

    if (error || !homeData || !user) {
      return (
        <div style={{
          minHeight: "100vh", background: "#000", color: "#fff",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", gap: 16,
          fontFamily: "'Outfit', sans-serif",
        }}>
          <div style={{ fontFamily: "'Bebas Neue', cursive", fontSize: 42, color: "#E50914" }}>
            BONGUFLIX
          </div>
          <p style={{ color: "#E50914", fontSize: 18, fontWeight: 600 }}>
            {error ?? "Failed to load"}
          </p>
          <p style={{ color: "rgba(255,255,255,0.4)", fontSize: 14 }}>
            Redirecting to login…
          </p>
        </div>
      );
    }

    // ── Render ─────────────────────────────────────────────────────────────────
    return (
      <>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@300;400;500;600;700;900&display=swap');
          *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
          ::-webkit-scrollbar { display: none; }
          * { scrollbar-width: none; }
          body { background: #000; color: #fff; font-family: 'Outfit', sans-serif; overflow-x: hidden; }
        `}</style>

        <div style={{ minHeight: "100vh", background: "#000" }}>
          <Navbar
            user={user}
            slug={slug}
            scrolled={navScrolled}
            onSearch={() => setSearchOpen(true)}
          />

          {/* Hero */}
          {homeData.hero && (
            <Hero
              item={homeData.hero}
              onMoreInfo={() => setModalItem(homeData.hero!)}
            />
          )}

          <div className="mt-20"></div>

          {/* Rows */}
          <div
            style={{
              position: "relative",
              zIndex: 2,
              marginTop: homeData.hero ? "40px" : "120px",
              paddingBottom: 80,
              animation: "rowsEnter 0.8s cubic-bezier(0.16,1,0.3,1) 0.3s both",
            }}
          >
            <style>{`
              @keyframes rowsEnter {
                from { opacity: 0; transform: translateY(24px); }
                to   { opacity: 1; transform: translateY(0); }
              }
            `}</style>

            {homeData.rows.map((row, rowIdx) => (
              <MediaRow
                key={row.id}
                row={row}
                rowIdx={rowIdx}
                focusedRow={focusedRow}
                focusedCol={focusedCol}
                onHover={(r, c) => { setFocusedRow(r); setFocusedCol(c); }}
                onClick={(item) => setModalItem(item)}
              />
            ))}

            {homeData.rows.length === 0 && (
              <div style={{
                padding: "80px 4%", textAlign: "center",
                color: "rgba(255,255,255,0.28)", fontSize: 16, lineHeight: 1.7,
              }}>
                No content yet — make sure your backend is seeded and running.
              </div>
            )}
          </div>

          {/* Modals */}
          {modalItem && (
            <DetailModal
              item={modalItem}
              onClose={() => setModalItem(null)}
            />
          )}

          {searchOpen && (
            <SearchOverlay
              onClose={() => setSearchOpen(false)}
              onSelect={(item) => { setModalItem(item); setSearchOpen(false); }}
            />
          )}
        </div>
      </>
    );
  }