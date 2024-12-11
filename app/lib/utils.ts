import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const algorithm = "aes-256-cbc";
const key = Buffer.from("1209r2$9ubb398F1!0@G9fCw9#r6$ur2", "utf8");
const iv = randomBytes(16);

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function encryptPassword(password: string): string {
  const cipher = createCipheriv(algorithm, key, iv);
  let encrypted = cipher.update(password, "utf8", "hex");
  encrypted += cipher.final("hex");
  return `${iv.toString("hex")}:${encrypted}`; // Include IV in the encrypted value
}

export function decryptPassword(encryptedPassword: string): string {
  const [ivHex, encrypted] = encryptedPassword.split(":");
  const decipher = createDecipheriv(algorithm, key, Buffer.from(ivHex, "hex"));
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
}
