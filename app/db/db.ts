import { drizzle } from "drizzle-orm/neon-serverless";

if (!process.env.DATABASE_URL) {
  throw new Error("Database URL string Was not set!");
}

export const db = drizzle(process.env.DATABASE_URL);
