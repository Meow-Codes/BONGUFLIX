import crypto from "crypto";

/**
 * Generates a strong random password (browser-safe)
 */
export const RandomPassword = (length: number = 16): string => {
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const numbers = "0123456789";
  const symbols = "!@#$%^&*()-_=+[]{}|;:,.<>?";

  const allChars = lowercase + uppercase + numbers + symbols;

  let password = "";

  // Ensure at least one character from each category
  password += lowercase[Math.floor(Math.random() * lowercase.length)];
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += numbers[Math.floor(Math.random() * numbers.length)];
  password += symbols[Math.floor(Math.random() * symbols.length)];

  const array = new Uint32Array(length - 4);
  window.crypto.getRandomValues(array);

  for (let i = 0; i < array.length; i++) {
    password += allChars[array[i] % allChars.length];
  }

  return shuffleString(password);
};

/**
 * Fisher-Yates shuffle (browser-safe)
 */
const shuffleString = (str: string): string => {
  const arr = str.split("");

  for (let i = arr.length - 1; i > 0; i--) {
    const rand = new Uint32Array(1);
    window.crypto.getRandomValues(rand);
    const j = rand[0] % (i + 1);

    [arr[i], arr[j]] = [arr[j], arr[i]];
  }

  return arr.join("");
};