import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";
import { dbCredentials } from "./app/lib/db";

config({ path: ".env" });

export default defineConfig({
  schema: "./app/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials,
});
