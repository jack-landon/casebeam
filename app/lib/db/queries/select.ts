"use server";

import { asc, eq } from "drizzle-orm";
import { db } from "../index";
import { SelectUser, chatsTable, messagesTable, usersTable } from "../schema";

export async function getUserById(id: SelectUser["id"]) {
  return db.select().from(usersTable).where(eq(usersTable.id, id)).get();
}

export async function getChat(chatId: string) {
  const chat = await db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.id, chatId))
    .get();

  if (!chat) return null;

  const messages = await db
    .select()
    .from(messagesTable)
    .where(eq(messagesTable.chatId, chatId))
    .orderBy(asc(messagesTable.msgIndex));

  return {
    ...chat,
    messages,
  };
}
