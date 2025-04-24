"use server";

import { asc, count, eq, getTableColumns, gt, sql } from "drizzle-orm";
import { db } from "../index";
import {
  SelectUser,
  chatsTable,
  messagesTable,
  projectsTable,
  usersTable,
} from "../schema";

export async function getUserById(id: SelectUser["id"]) {
  return db.select().from(usersTable).where(eq(usersTable.id, id)).get();
}

export async function getUsersWithPostsCount(page = 1, pageSize = 5) {
  return db
    .select({
      ...getTableColumns(usersTable),
      postsCount: count(projectsTable.id),
    })
    .from(usersTable)
    .leftJoin(projectsTable, eq(usersTable.id, projectsTable.userId))
    .groupBy(usersTable.id)
    .orderBy(asc(usersTable.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

export async function getPostsForLast24Hours(page = 1, pageSize = 5) {
  return db
    .select({
      id: projectsTable.id,
      name: projectsTable.name,
    })
    .from(projectsTable)
    .where(gt(projectsTable.createdAt, sql`(datetime('now','-24 hour'))`))
    .orderBy(asc(projectsTable.name), asc(projectsTable.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
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
    .orderBy(asc(messagesTable.createdAt));

  return {
    ...chat,
    messages,
  };
}
