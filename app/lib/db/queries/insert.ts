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
import { eq, getTableColumns, SQL, sql } from "drizzle-orm";
import { SQLiteTable } from "drizzle-orm/sqlite-core";

export async function createUser(data: InsertUser) {
  const [user] = await db.insert(usersTable).values(data).returning();
  return user;
}
export async function createProject(data: InsertProject) {
  const [project] = await db.insert(projectsTable).values(data).returning();
  return project;
}

export async function createChat(data: InsertChat) {
  const [chat] = await db
    .insert(chatsTable)
    .values(data)
    .onConflictDoNothing()
    .returning();
  return chat;
}

export async function createMessage(data: InsertMessage) {
  const [message] = await db.insert(messagesTable).values(data).returning();
  return message;
}

export async function createNewNote(data: Omit<InsertNote, "userId">) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  const defaultEditorContent = {
    type: "doc",
    content: [
      {
        type: "paragraph",
        content: [
          {
            type: "text",
            text: `Start typing the ${data.name} note here...`,
          },
        ],
      },
    ],
  };

  const [note] = await db
    .insert(notesTable)
    .values({
      ...data,
      userId,
      content: data.content ?? JSON.stringify(defaultEditorContent),
    })
    .returning();
  return note;
}

export async function updateNote(data: Partial<InsertNote> & { id: number }) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  const [updatedNote] = await db
    .update(notesTable)
    .set(data)
    .where(
      sql`${notesTable.id} = ${data.id} AND ${notesTable.userId} = ${userId}`
    )
    // .where(eq(notesTable.id, data.id))
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
  return await db
    .insert(searchResultsTable)
    .values(data)
    .onConflictDoNothing()
    .returning();
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

export async function updateSearchResult(
  data: Partial<InsertSearchResult> & { id: number }
) {
  const [updatedSearchResult] = await db
    .update(searchResultsTable)
    .set(data)
    .where(eq(searchResultsTable.id, data.id))
    .returning();
  return updatedSearchResult;
}

export async function createManyMessages(data: InsertMessage[]) {
  console.log(data.map((msg) => msg.content));
  return await db
    .insert(messagesTable)
    .values(data)
    .onConflictDoUpdate({
      set: conflictUpdateAllExcept(messagesTable, ["id"]),
      target: [messagesTable.id],
    })
    .returning();
}

function conflictUpdateAllExcept<
  T extends SQLiteTable,
  E extends (keyof T["$inferInsert"])[]
>(table: T, except: E) {
  const columns = getTableColumns(table);
  const updateColumns = Object.entries(columns).filter(
    ([col]) => !except.includes(col as keyof typeof table.$inferInsert)
  );

  return updateColumns.reduce(
    (acc, [colName, table]) => ({
      ...acc,
      [colName]: sql.raw(`excluded.${table.name}`),
    }),
    {}
  ) as Omit<Record<keyof typeof table.$inferInsert, SQL>, E[number]>;
}
