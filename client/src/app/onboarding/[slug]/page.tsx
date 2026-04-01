"use client";

import { useParams, useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, Sparkles, Clapperboard, Tv } from "lucide-react";
import {
  fetchUser,
  fetchOnboardingOptions,
  submitOnboarding,
  uploadAvatar,
  type OnboardingSubmitBody,
} from "@/utils/api";
import { LoadingScreen } from "@/components/LoadingScreen";

const PRESET_AVATARS = [
  "https://api.dicebear.com/7.x/avataaars/svg?seed=bongu1&backgroundColor=0a0a0a",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=bongu2&backgroundColor=1a0a0a",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=bongu3&backgroundColor=0a1a0a",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=bongu4&backgroundColor=0a0a1a",
  "https://api.dicebear.com/7.x/avataaars/svg?seed=bongu5&backgroundColor=1a1a0a",
];

const MAX_PICKS = 10;

export default function OnboardingPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();
  const slug = typeof params?.slug === "string" ? params.slug : "";

  const startParam = searchParams?.get("start") ?? null;
  const initialStep = useMemo(() => {
    const n = parseInt(startParam ?? "1", 10);
    if (Number.isNaN(n) || n < 1) return 1;
    return Math.min(4, n);
  }, [startParam]);

  const [step, setStep] = useState(initialStep);
  const [displayName, setDisplayName] = useState("");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [selections, setSelections] = useState<string[]>([]);
  const [contentStyle, setContentStyle] = useState<"movies" | "tv" | "mixed">("mixed");

  const { data: user, isLoading: userLoading, error: userError } = useQuery({
    queryKey: ["user", slug],
    queryFn: () => fetchUser(slug),
    retry: false,
  });

  const { data: options } = useQuery({
    queryKey: ["onboarding-options", slug],
    queryFn: () => fetchOnboardingOptions(slug),
    enabled: !!user && !userError,
  });

  useEffect(() => {
    setStep(initialStep);
  }, [initialStep]);

  useEffect(() => {
    if (!user) return;
    const prefs = user.preferences as Record<string, unknown> | undefined;
    if (typeof prefs?.displayName === "string") setDisplayName(prefs.displayName);
    if (user.profilePic) setProfilePic(user.profilePic);
    if (Array.isArray(prefs?.selections)) {
      setSelections((prefs.selections as string[]).slice(0, MAX_PICKS));
    }
    const cs = prefs?.contentStyle;
    if (cs === "movies" || cs === "tv" || cs === "mixed") setContentStyle(cs);
  }, [user]);

  useEffect(() => {
    if (userError) {
      const t = setTimeout(() => router.push("/auth"), 1800);
      return () => clearTimeout(t);
    }
  }, [userError, router]);

  const forceRemount = searchParams?.get("force") === "1";

  useEffect(() => {
    if (!user) return;
    const resume = searchParams?.get("start");
    if (user.onboardingComplete && !resume && !forceRemount) {
      router.replace(`/dashboard/${slug}`);
    }
  }, [user, slug, router, searchParams, forceRemount]);

  const mutation = useMutation({
    mutationFn: (body: OnboardingSubmitBody) => submitOnboarding(slug, body),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["user", slug] });
      await queryClient.invalidateQueries({ queryKey: ["home", slug] });
      toast.success("You're all set!");
      router.push(`/dashboard/${slug}`);
    },
    onError: (e: Error) => {
      toast.error(e.message || "Something went wrong");
    },
  });

  const allTags = useMemo(() => {
    const g = options?.genres ?? [];
    const k = options?.keywords ?? [];
    return [...g, ...k];
  }, [options]);

  const toggleTag = (tag: string) => {
    setSelections((prev) => {
      if (prev.includes(tag)) return prev.filter((t) => t !== tag);
      if (prev.length >= MAX_PICKS) {
        toast.error(`Pick at most ${MAX_PICKS}`);
        return prev;
      }
      return [...prev, tag];
    });
  };

  const onPickFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      toast.error("Image is too large (max 2MB)");
      return;
    }
    try {
      const url = await uploadAvatar(slug, file);
      setProfilePic(url);
      toast.success("Photo uploaded");
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Upload failed";
      toast.error(msg);
    }
    e.target.value = "";
  };

  const finish = () => {
    const name = displayName.trim();
    if (!name) {
      toast.error("Enter your name");
      setStep(1);
      return;
    }
    if (!profilePic) {
      toast.error("Choose a profile picture");
      setStep(2);
      return;
    }
    if (selections.length === 0) {
      toast.error("Pick at least one genre or interest");
      setStep(3);
      return;
    }
    mutation.mutate({
      displayName: name,
      profilePic,
      selections,
      contentStyle,
    });
  };

  const next = () => {
    if (step === 1 && !displayName.trim()) {
      toast.error("Enter your name");
      return;
    }
    if (step === 2 && !profilePic) {
      toast.error("Choose or upload a profile picture");
      return;
    }
    if (step === 3 && selections.length === 0) {
      toast.error("Pick at least one tag");
      return;
    }
    if (step < 4) setStep(step + 1);
    else finish();
  };

  const back = () => {
    if (step > 1) setStep(step - 1);
    else router.push(`/dashboard/${slug}`);
  };

  if (userLoading || !user) {
    if (userError) {
      return (
        <div style={{ minHeight: "100vh", background: "#000", color: "#fff", display: "grid", placeItems: "center" }}>
          Session expired. Redirecting…
        </div>
      );
    }
    return <LoadingScreen />;
  }

  if (user.onboardingComplete && !searchParams?.get("start") && !forceRemount) {
    return <LoadingScreen />;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=Outfit:wght@400;600;700;800&display=swap');
        .onb-root {
          min-height: 100vh;
          background: radial-gradient(120% 80% at 50% 0%, #1a0a0a 0%, #050505 55%);
          color: #fff;
          font-family: 'Outfit', sans-serif;
          padding: 88px 5% 48px;
        }
        .onb-top {
          max-width: 720px;
          margin: 0 auto 28px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .onb-brand {
          font-family: 'Bebas Neue', cursive;
          font-size: 28px;
          letter-spacing: 0.12em;
          color: #E50914;
          text-decoration: none;
        }
        .onb-step {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.14em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.35);
        }
        .onb-card {
          max-width: 720px;
          margin: 0 auto;
          background: rgba(16,16,16,0.92);
          border: 1px solid rgba(255,255,255,0.08);
          border-radius: 16px;
          padding: 32px 28px 36px;
          box-shadow: 0 40px 100px rgba(0,0,0,0.65);
        }
        .onb-h1 {
          font-size: clamp(22px, 3vw, 28px);
          font-weight: 800;
          margin-bottom: 8px;
          letter-spacing: -0.02em;
        }
        .onb-sub {
          margin-bottom: 24px;
          color: rgba(255,255,255,0.45);
          font-size: 14px;
          line-height: 1.55;
        }
        .onb-input {
          width: 100%;
          padding: 14px 16px;
          border-radius: 10px;
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(0,0,0,0.35);
          color: #fff;
          font-size: 14px;
          font-family: inherit;
          outline: none;
        }
        .onb-input:focus {
          border-color: rgba(229,9,20,0.55);
          box-shadow: 0 0 0 3px rgba(229,9,20,0.12);
        }
        .onb-avatars {
          display: flex;
          flex-wrap: wrap;
          gap: 12px;
          margin-bottom: 16px;
        }
        .onb-av {
          width: 72px;
          height: 72px;
          border-radius: 10px;
          overflow: hidden;
          cursor: pointer;
          border: 2px solid transparent;
          padding: 0;
          background: #111;
          transition: transform 0.15s, border-color 0.15s;
        }
        .onb-av:hover { transform: scale(1.04); }
        .onb-av.selected { border-color: #E50914; }

        .onb-tags {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
        }
        .onb-tag {
          border: 1px solid rgba(255,255,255,0.18);
          background: rgba(255,255,255,0.04);
          color: rgba(255,255,255,0.85);
          font-size: 12px;
          font-weight: 600;
          padding: 8px 12px;
          border-radius: 999px;
          cursor: pointer;
          transition: background 0.15s, border-color 0.15s, color 0.15s;
        }
        .onb-tag:hover { border-color: rgba(229,9,20,0.45); }
        .onb-tag.selected {
          background: rgba(229,9,20,0.22);
          border-color: #E50914;
          color: #fff;
        }
        .onb-style-row {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 12px;
        }
        .onb-style {
          border: 1px solid rgba(255,255,255,0.12);
          background: rgba(255,255,255,0.03);
          border-radius: 12px;
          padding: 18px 14px;
          cursor: pointer;
          text-align: left;
          transition: border-color 0.15s, background 0.15s;
          color: inherit;
          font: inherit;
        }
        .onb-style:hover { border-color: rgba(229,9,20,0.45); }
        .onb-style.selected {
          border-color: #E50914;
          background: rgba(229,9,20,0.12);
        }
        .onb-style h3 { font-size: 14px; font-weight: 700; margin-bottom: 4px; }
        .onb-style p { font-size: 10px; color: rgba(255,255,255,0.4); line-height: 1.4; }
        .onb-actions {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-top: 28px;
          gap: 12px;
        }
        .onb-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 22px;
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
          cursor: pointer;
          border: none;
          font-family: inherit;
        }
        .onb-btn-ghost {
          background: rgba(255,255,255,0.06);
          color: rgba(255,255,255,0.85);
        }
        .onb-btn-primary {
          background: #E50914;
          color: #fff;
        }
        .onb-btn:disabled { opacity: 0.55; cursor: not-allowed; }
      `}</style>

      <div className="onb-root">
        <div className="onb-top">
          <Link href={`/dashboard/${slug}`} className="onb-brand">
            BONGUFLIX
          </Link>
          <span className="onb-step">
            Step {step} of 4
          </span>
        </div>

        <div className="onb-card">
          {step === 1 && (
            <>
              <h1 className="onb-h1">What should we call you?</h1>
              <p className="onb-sub">This name appears on your profile and in the app.</p>
              <input
                className="onb-input"
                placeholder="Your name"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                maxLength={80}
                autoFocus
              />
            </>
          )}

          {step === 2 && (
            <>
              <h1 className="onb-h1">Pick a profile picture</h1>
              <p className="onb-sub">Choose a preset or upload your own image.</p>
              <div className="onb-avatars">
                {PRESET_AVATARS.map((src) => (
                  <button
                    key={src}
                    type="button"
                    className={`onb-av ${profilePic === src ? "selected" : ""}`}
                    onClick={() => setProfilePic(src)}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={src} alt="" width={72} height={72} style={{ display: "block" }} />
                  </button>
                ))}
              </div>
              <label style={{ display: "inline-block", cursor: "pointer", color: "#E50914", fontSize: 13, fontWeight: 600 }}>
                Upload image…
                <input type="file" accept="image/*" style={{ display: "none" }} onChange={onPickFile} />
              </label>
            </>
          )}

          {step === 3 && (
            <>
              <h1 className="onb-h1">What do you like?</h1>
              <p className="onb-sub">
                Pick up to {MAX_PICKS} genres and interests. We use this to order your home rows.
              </p>
              <span style={{ fontSize: 11, color: "rgba(255,255,255,0.35)", display: "block", marginBottom: 12 }}>
                Selected {selections.length}/{MAX_PICKS}
              </span>
              <div className="onb-tags">
                {allTags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    className={`onb-tag ${selections.includes(tag) ? "selected" : ""}`}
                    onClick={() => toggleTag(tag)}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </>
          )}

          {step === 4 && (
            <>
              <h1 className="onb-h1">How do you usually watch?</h1>
              <p className="onb-sub">We will tune your experience — more features coming soon.</p>
              <div className="onb-style-row">
                <button
                  type="button"
                  className={`onb-style ${contentStyle === "movies" ? "selected" : ""}`}
                  onClick={() => setContentStyle("movies")}
                >
                  <Clapperboard size={20} color="#E50914" style={{ marginBottom: 8 }} />
                  <h3>Movies first</h3>
                  <p>Feature films and blockbusters at the centre of your feed.</p>
                </button>
                <button
                  type="button"
                  className={`onb-style ${contentStyle === "tv" ? "selected" : ""}`}
                  onClick={() => setContentStyle("tv")}
                >
                  <Tv size={20} color="#E50914" style={{ marginBottom: 8 }} />
                  <h3>Series first</h3>
                  <p>Binge-friendly series and episodic storytelling.</p>
                </button>
                <button
                  type="button"
                  className={`onb-style ${contentStyle === "mixed" ? "selected" : ""}`}
                  onClick={() => setContentStyle("mixed")}
                >
                  <Sparkles size={20} color="#E50914" style={{ marginBottom: 8 }} />
                  <h3>Mixed</h3>
                  <p>A balanced mix of movies and TV — same as hero discovery.</p>
                </button>
              </div>
            </>
          )}

          <div className="onb-actions">
            <button type="button" className="onb-btn onb-btn-ghost" onClick={back}>
              <ChevronLeft size={16} /> {step === 1 ? "Back to dashboard" : "Back"}
            </button>
            <button
              type="button"
              className="onb-btn onb-btn-primary"
              onClick={next}
              disabled={mutation.isPending}
            >
              {step === 4 ? (
                <>
                  <Check size={16} /> Finish
                </>
              ) : (
                <>
                  Continue <ChevronRight size={16} />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
