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
  projectCommentsTable,
  projectsTable,
  searchResultCategories,
  searchResultProjects,
  searchResultsTable,
  usersTable,
  ProjectStatus,
  projectDatesTable,
  InsertProjectDate,
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
  const searchResultId = data.searchResult.id;
  if (!searchResultId) return;

  // const [savedResult] = await db
  //   .insert(searchResultsTable)
  //   .values({ ...data.searchResult, userId })
  //   .returning();

  const savedResult = await db.query.searchResultsTable.findFirst({
    where: (searchResultsTable, { eq }) =>
      eq(searchResultsTable.id, searchResultId),
  });

  if (!savedResult) throw new Error("Search result not found");

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

export async function addProjectComment(projectId: number, content: string) {
  const { userId } = await auth();

  if (!userId) throw new Error("User not found");

  const [newComment] = await db
    .insert(projectCommentsTable)
    .values({
      projectId,
      content,
      userId,
    })
    .returning();
  return newComment;
}

export async function updateProjectStatus(
  projectId: number,
  status: ProjectStatus
) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  const [updatedProject] = await db
    .update(projectsTable)
    .set({ status })
    .where(eq(projectsTable.id, projectId))
    .returning();
  return updatedProject;
}

export async function createProjectDate(dateObject: InsertProjectDate) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  // Check if project belongs to the user
  const project = await db.query.projectsTable.findFirst({
    where: (projectsTable, { eq }) =>
      eq(projectsTable.id, dateObject.projectId),
  });
  if (!project) throw new Error("Project not found");
  if (project.userId !== userId) {
    throw new Error("You do not have permission to add a date to this project");
  }

  const [newDate] = await db
    .insert(projectDatesTable)
    .values(dateObject)
    .returning();

  return newDate;
}

export async function deleteProjectDateFromDb(projectDateId: number) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  // Check if project date belongs to the user
  const projectDate = await db.query.projectDatesTable.findFirst({
    where: (projectDatesTable, { eq }) =>
      eq(projectDatesTable.id, projectDateId),
    with: {
      project: true,
    },
  });
  if (!projectDate) throw new Error("Project date not found");
  if (projectDate.project.userId !== userId)
    throw new Error("You do not have permission to delete this project date");

  const [deletedProjectDate] = await db
    .delete(projectDatesTable)
    .where(eq(projectDatesTable.id, projectDateId))
    .returning();

  return deletedProjectDate;
}
