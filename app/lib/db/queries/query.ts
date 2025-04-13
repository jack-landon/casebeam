"use server";

import { auth } from "@clerk/nextjs/server";
import { db } from "../index";

export async function getChat(id: string) {
  const user = await auth();

  if (!user.userId) throw new Error("User not authenticated");
  return await db.query.chatsTable.findFirst({
    where: (chatsTable, { eq }) => eq(chatsTable.id, id),
    with: {
      messages: true,
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
