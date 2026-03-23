import crypto from "crypto";

export const generateSlug = (username: string): string => {
  const cleanUsername = username.trim().toLowerCase().replace(/\s+/g, "-");
  const randomPart = crypto.randomBytes(4).toString("hex");
  return `${cleanUsername}-${randomPart}`;
};