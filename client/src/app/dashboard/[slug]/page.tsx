// app/dashboard/[slug]/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";

type UserData = {
  username: string;
  slug: string;
  sessionId: string;
  lastActive: string;
  preferences: any;
  randomSeed: number;
};

export default function DashboardPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();

  const slug = typeof params?.slug === "string" ? params.slug : "";
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [movieInput, setMovieInput] = useState("");
  const [recommendations, setRecommendations] = useState<string[]>([]);
  const [recLoading, setRecLoading] = useState(false);

  useEffect(() => {
    const validateAndLoadUser = async () => {
      const sessionId = localStorage.getItem("sessionId");

      if (!sessionId) {
        setError("No session found. Please log in again.");
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/user/${slug}`, {
          headers: {
            "X-Session-Id": sessionId,
          },
        });

        if (!res.ok) {
          throw new Error("Session invalid or expired");
        }

        const data = await res.json();
        setUser(data);
      } catch (err: any) {
        setError(err.message);
        localStorage.removeItem("sessionId");
        router.push("/");
      } finally {
        setLoading(false);
      }
    };

    validateAndLoadUser();
  }, [slug, router]);

  const handleRecommend = async () => {
    if (!movieInput.trim() || !user) return;

    setRecLoading(true);
    setRecommendations([]);

    try {
      const sessionId = localStorage.getItem("sessionId");

      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/recommend`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Session-Id": sessionId || "",
        },
        body: JSON.stringify({ movie: movieInput.trim() }),
      });

      if (!res.ok) throw new Error("Failed to get recommendations");

      const data = await res.json();
      setRecommendations(data.recommendations || []);
    } catch (err: any) {
      alert(err.message || "Recommendation failed");
    } finally {
      setRecLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        <div className="text-2xl">Loading your profile...</div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white p-6">
        <h1 className="text-4xl font-bold text-red-600 mb-6">Access Denied</h1>
        <p className="text-xl mb-8">{error || "Invalid session"}</p>
        <button
          onClick={() => router.push("/")}
          className="bg-red-600 hover:bg-red-700 px-8 py-4 rounded text-lg font-bold"
        >
          Back to Home
        </button>
      </div>
    );
  }

  // Simple randomization example using seed
  const randomBG = `hsl(${user.randomSeed % 360}, 70%, 15%)`;

  return (
    <div
      className="min-h-screen text-white p-8"
      style={{ background: `linear-gradient(to bottom, #0f0f0f, ${randomBG})` }}
    >
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12">
          <h1 className="text-5xl font-black text-red-600 tracking-wider">
            BONGUFLIX
          </h1>
          <div className="text-right">
            <p className="text-xl font-medium">Welcome back, {user.username}</p>
            <p className="text-sm text-gray-400">
              Last active: {new Date(user.lastActive).toLocaleDateString()}
            </p>
          </div>
        </header>

        <section className="mb-12">
          <h2 className="text-3xl font-bold mb-6">Your Recommendations</h2>

          <div className="flex gap-4 mb-8">
            <input
              type="text"
              value={movieInput}
              onChange={(e) => setMovieInput(e.target.value)}
              placeholder="Enter a movie or show you like..."
              className="flex-1 px-6 py-4 rounded-lg bg-black/60 border border-gray-700 text-white placeholder-gray-500 focus:border-red-600 focus:outline-none"
              disabled={recLoading}
            />
            <button
              onClick={handleRecommend}
              disabled={recLoading || !movieInput.trim()}
              className={`px-8 py-4 rounded-lg font-bold text-lg ${
                recLoading
                  ? "bg-gray-700 cursor-not-allowed"
                  : "bg-red-600 hover:bg-red-700"
              } transition-colors`}
            >
              {recLoading ? "Finding..." : "Get Recommendations"}
            </button>
          </div>

          {recommendations.length > 0 && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recommendations.map((rec, i) => (
                <div
                  key={i}
                  className="bg-gray-900/70 p-6 rounded-xl border border-gray-800 hover:border-red-600/50 transition-colors"
                >
                  <h3 className="text-xl font-semibold">{rec}</h3>
                  <p className="text-gray-400 mt-2 text-sm">Recommended based on your taste</p>
                </div>
              ))}
            </div>
          )}

          {recommendations.length === 0 && movieInput && !recLoading && (
            <p className="text-gray-400 text-center py-12">
              No recommendations yet — try typing a movie!
            </p>
          )}
        </section>

        {/* You can later add more sections: watchlist, history, etc */}
      </div>
    </div>
  );
}