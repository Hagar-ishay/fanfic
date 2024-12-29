import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { ENV } from "@/config";

if (!ENV.DATABASE_URL) {
  throw "Database URL string Was not set!";
}

const sql = neon(ENV.DATABASE_URL);
export const db = drizzle({ client: sql });
