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
import { auth } from "@clerk/nextjs/server";

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
      title: projectsTable.title,
    })
    .from(projectsTable)
    .where(gt(projectsTable.createdAt, sql`(datetime('now','-24 hour'))`))
    .orderBy(asc(projectsTable.title), asc(projectsTable.id))
    .limit(pageSize)
    .offset((page - 1) * pageSize);
}

export async function getUserChats() {
  const user = await auth();
  if (!user.userId) throw new Error("User not authenticated");

  return db
    .select()
    .from(chatsTable)
    .where(eq(chatsTable.userId, user.userId))
    .orderBy(asc(chatsTable.createdAt));
}

export async function getChat(chatId: number) {
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
