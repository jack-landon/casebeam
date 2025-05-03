"use server";

import { eq } from "drizzle-orm";
import { db } from "../index";
import { SelectUser, usersTable } from "../schema";

export async function getUserById(id: SelectUser["id"]) {
  return db.select().from(usersTable).where(eq(usersTable.id, id)).get();
}
