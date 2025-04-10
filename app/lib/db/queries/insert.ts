"use server";

import { db } from "../index";
import {
  chatsTable,
  InsertChat,
  InsertMessage,
  InsertProject,
  InsertUser,
  messagesTable,
  projectsTable,
  usersTable,
} from "../schema";

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
