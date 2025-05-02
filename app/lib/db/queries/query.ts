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
  if (!userData) return null;
  return userData;
}

export async function getSearchResultById(searchResultId: number) {
  const user = await auth();
  if (!user.userId) throw new Error("User not authenticated");
  const searchResult = await db.query.searchResultsTable.findFirst({
    where: (searchResultsTable, { eq }) =>
      eq(searchResultsTable.id, searchResultId),
    with: {
      userMessage: true,
    },
  });
  if (!searchResult) throw new Error("Search result not found");
  return searchResult;
}

export async function getChat(id: string) {
  const user = await auth();

  if (!user.userId) throw new Error("User not authenticated");
  return await db.query.chatsTable.findFirst({
    where: (chatsTable, { eq }) => eq(chatsTable.id, id),
    with: {
      messages: {
        with: {
          botSearchResults: true,
        },
      },
      searchResults: {
        orderBy: (searchResultsTable, { desc }) => desc(searchResultsTable.id),
      },
      user: true,
    },
  });
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
