import { ENV } from "@/config";
import { drizzle } from "drizzle-orm/neon-serverless";

if (!ENV.DATABASE_URL) {
  throw "Database URL string Was not set!";
}

export const db = drizzle(ENV.DATABASE_URL);
