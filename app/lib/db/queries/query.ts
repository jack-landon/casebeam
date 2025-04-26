"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../index";

export async function getUserData() {
  const user = await auth();

  if (!user.userId) return null;
  const userData = await db.query.usersTable.findFirst({
    where: (usersTable, { eq }) => eq(usersTable.id, user.userId),
    with: {
      chats: true,
      projects: true,
      categories: true,
    },
  });
  if (!userData) throw new Error("User not found");
  return userData;
}

export async function getChat(id: string) {
  const user = await auth();

  if (!user.userId) throw new Error("User not authenticated");
  return await db.query.chatsTable.findFirst({
    where: (chatsTable, { eq }) => eq(chatsTable.id, id),
    with: {
      messages: {
        with: {
          searchResults: true,
        },
      },
      searchResults: true,
      user: true,
    },
  });
}

export async function getSearchResults(chatId: string) {
  const user = await auth();

  if (!user.userId) throw new Error("User not authenticated");
  const searchResults = await db.query.searchResultsTable.findMany({
    where: (searchResultsTable, { eq }) =>
      eq(searchResultsTable.chatId, chatId),
    with: {
      message: true,
    },
    orderBy: (searchResultsTable, { desc }) => desc(searchResultsTable.id),
  });

  return searchResults;
}

export async function getNote(noteId: number) {
  const user = await auth();

  if (!user.userId) throw new Error("User not authenticated");
  return await db.query.notesTable.findFirst({
    where: (notesTable, { eq }) => eq(notesTable.id, noteId),
  });
}

export async function getUserNotes() {
  const user = await auth();
  if (!user.userId) throw new Error("User not authenticated");
  const userNotes = await db.query.notesTable.findMany({
    where: (notesTable, { eq }) => eq(notesTable.userId, user.userId),
    orderBy: (notesTable, { desc }) => desc(notesTable.updatedAt),
  });
  return userNotes;
}
