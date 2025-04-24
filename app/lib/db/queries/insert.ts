"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../index";
import {
  categoriesTable,
  chatsTable,
  InsertCategory,
  InsertChat,
  InsertMessage,
  InsertNote,
  InsertProject,
  InsertSearchResult,
  InsertUser,
  messagesTable,
  notesTable,
  projectsTable,
  searchResultCategories,
  searchResultProjects,
  searchResultsTable,
  usersTable,
} from "../schema";
import { eq } from "drizzle-orm";

export async function createUser(data: InsertUser) {
  const [user] = await db.insert(usersTable).values(data).returning();
  return user;
}
export async function createProject(data: InsertProject) {
  const [project] = await db.insert(projectsTable).values(data).returning();
  return project;
}

export async function createChat(data: InsertChat) {
  const [chat] = await db.insert(chatsTable).values(data).returning();
  return chat;
}

export async function createMessage(data: InsertMessage) {
  const [message] = await db.insert(messagesTable).values(data).returning();
  return message;
}

export async function createNewNote(data: Omit<InsertNote, "userId">) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  const [note] = await db
    .insert(notesTable)
    .values({
      ...data,
      userId,
    })
    .returning();
  return note;
}

export async function updateNote(data: Partial<InsertNote> & { id: number }) {
  const [updatedNote] = await db
    .update(notesTable)
    .set(data)
    .where(eq(notesTable.id, data.id))
    .returning();
  return updatedNote;
}

export async function updateMessage(
  data: Partial<InsertMessage> & { id: number }
) {
  const [updatedMessage] = await db
    .update(messagesTable)
    .set(data)
    .where(eq(messagesTable.id, data.id))
    .returning();
  return updatedMessage;
}

export async function updateChat(data: Partial<InsertChat> & { id: string }) {
  const [updatedChat] = await db
    .update(chatsTable)
    .set(data)
    .where(eq(chatsTable.id, data.id))
    .returning();
  return updatedChat;
}

export async function createMessageBulk(data: InsertMessage[]) {
  return await db.insert(messagesTable).values(data).returning();
}

export async function createCategory(
  data: Pick<InsertCategory, "name" | "description">
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  const [category] = await db
    .insert(categoriesTable)
    .values({
      ...data,
      userId,
    })
    .returning();
  return category;
}

export async function createSearchResult(data: InsertSearchResult) {
  const [searchResult] = await db
    .insert(searchResultsTable)
    .values(data)
    .returning();
  return searchResult;
}

export async function createSearchResultsBulk(data: InsertSearchResult[]) {
  return await db.insert(searchResultsTable).values(data).returning();
}

export async function saveSearchResultWithAssociations(data: {
  searchResult: Omit<InsertSearchResult, "userId">;
  categoryIds: number[];
  projectIds: number[];
}) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  const [savedResult] = await db
    .insert(searchResultsTable)
    .values({ ...data.searchResult, userId })
    .returning();

  // Save category associations
  if (data.categoryIds.length > 0) {
    await db.insert(searchResultCategories).values(
      data.categoryIds.map((categoryId) => ({
        userId,
        searchResultId: savedResult.id,
        categoryId,
      }))
    );
  }

  // Save project associations
  if (data.projectIds.length > 0) {
    await db.insert(searchResultProjects).values(
      data.projectIds.map((projectId) => ({
        userId,
        searchResultId: savedResult.id,
        projectId,
      }))
    );
  }

  return savedResult;
}
