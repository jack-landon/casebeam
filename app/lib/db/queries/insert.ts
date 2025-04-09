"use server";

import { db } from "../index";
import {
  InsertProject,
  InsertUser,
  projectsTable,
  usersTable,
} from "../schema";

export async function createUser(data: InsertUser) {
  await db.insert(usersTable).values(data);
}
export async function createProject(data: InsertProject) {
  await db.insert(projectsTable).values(data);
}
