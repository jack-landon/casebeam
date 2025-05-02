import { drizzle } from "drizzle-orm/libsql";
import * as schema from "./schema";

// config({ path: ".env" });

const isUsingBackup = false;

export const dbCredentials = {
  url: isUsingBackup
    ? process.env.TURSO_CONNECTION_URL_BACKUP!
    : process.env.TURSO_CONNECTION_URL!,
  authToken: isUsingBackup
    ? process.env.TURSO_AUTH_TOKEN_BACKUP!
    : process.env.TURSO_AUTH_TOKEN!,
};

export const db = drizzle({
  connection: dbCredentials,
  schema,
});
