import { pool } from "../config/db.js";

const MAX_SELECTIONS = 10;
const MAX_IMAGE_BASE64 = 1_800_000; // ~1.3MB decoded headroom

export type OnboardingPayload = {
  displayName: string;
  profilePic: string | null;
  selections: string[];
  contentStyle: "movies" | "tv" | "mixed";
};

export const getUserBySlug = async (slug: string) => {
  const { rows } = await pool.query(
    "SELECT u.*, s.session_id FROM users u JOIN user_sessions s ON u.slug = s.slug WHERE u.slug = $1 AND s.expires_at > NOW()",
    [slug]
  );

  if (rows.length === 0) throw new Error("User not found or session expired");

  const seed = slug.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  const prefs = (rows[0].preferences ?? {}) as Record<string, unknown>;

  /** Legacy accounts (empty prefs) predate onboarding — treat as complete. */
  const onboardingComplete = Object.prototype.hasOwnProperty.call(
    prefs,
    "onboardingComplete",
  )
    ? prefs.onboardingComplete === true
    : true;

  return {
    username: rows[0].username,
    slug,
    lastActive: rows[0].last_active,
    preferences: prefs,
    profilePic: rows[0].profile_pic ?? null,
    randomSeed: seed,
    onboardingComplete,
    displayName: typeof prefs.displayName === "string" ? prefs.displayName : null,
  };
};

export const updateUserPreferences = async (
  slug: string,
  preferences: Record<string, unknown>,
  profilePic?: string | null,
) => {
  if (profilePic !== undefined) {
    await pool.query(
      "UPDATE users SET preferences = $1::jsonb, profile_pic = $2 WHERE slug = $3",
      [JSON.stringify(preferences), profilePic, slug],
    );
  } else {
    await pool.query("UPDATE users SET preferences = $1::jsonb WHERE slug = $2", [
      JSON.stringify(preferences),
      slug,
    ]);
  }
};

export const completeOnboarding = async (slug: string, body: OnboardingPayload) => {
  const name = body.displayName?.trim() ?? "";
  if (name.length < 1 || name.length > 80) {
    throw new Error("INVALID_NAME");
  }
  const selections = Array.isArray(body.selections)
    ? [...new Set(body.selections.map((s) => String(s).trim()).filter(Boolean))].slice(0, MAX_SELECTIONS)
    : [];
  if (selections.length === 0) {
    throw new Error("SELECTIONS_REQUIRED");
  }
  const style = body.contentStyle === "tv" || body.contentStyle === "movies" || body.contentStyle === "mixed"
    ? body.contentStyle
    : "mixed";

  let pic: string | null = body.profilePic ?? null;
  if (pic && pic.startsWith("data:image") && pic.length > MAX_IMAGE_BASE64) {
    throw new Error("IMAGE_TOO_LARGE");
  }

  const preferences = {
    displayName: name,
    selections,
    contentStyle: style,
    onboardingComplete: true,
    onboardingCompletedAt: new Date().toISOString(),
  };

  await pool.query(
    "UPDATE users SET preferences = $1::jsonb, profile_pic = $2 WHERE slug = $3",
    [JSON.stringify(preferences), pic, slug],
  );
};

/** Clears taste data but flags user for onboarding again (legacy `{}` alone would look "complete"). */
export const flushUserPreferences = async (slug: string) => {
  await pool.query(
    `UPDATE users SET preferences = '{"onboardingComplete": false}'::jsonb WHERE slug = $1`,
    [slug],
  );
};