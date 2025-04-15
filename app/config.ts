import { loadEnvConfig } from "@next/env";

export const runtime = "nodejs";

let projectDir: string;

if (typeof process !== "undefined" && process.cwd) {
  projectDir = process.cwd();
  loadEnvConfig(projectDir);
}

export const ENV = process.env;
