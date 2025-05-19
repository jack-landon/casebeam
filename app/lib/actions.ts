"use server";

// import { revalidatePath } from "next/cache";
// import { db } from "@/lib/db";
// import { casesTable } from "@/lib/db/schema";

// export async function createCase(caseData) {
//   try {
//     // Insert the new case into the database
//     const result = await db.insert(casesTable).values({
//       title: caseData.name,
//       caseNumber: caseData.caseNumber,
//       client: caseData.client,
//       caseType: caseData.caseType,
//       status: caseData.status,
//       filingDate: caseData.filingDate,
//       nextDeadline: caseData.nextDeadline,
//       court: caseData.court,
//       judge: caseData.judge,
//       description: caseData.description,
//     });

//     // Revalidate the cases page to show the new case
//     revalidatePath("/");

//     return { success: true, data: result };
//   } catch (error) {
//     console.error("Error creating case:", error);
//     return { success: false, error: error.message };
//   }
// }

"use server";

import { auth, clerkClient } from "@clerk/nextjs/server";
import {
  categoriesTable,
  InsertProject,
  projectsTable,
  ProjectStatus,
} from "./db/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { createChat, createProject, createUser } from "./db/queries/insert";
import { getUserById } from "./db/queries/select";
import { generateText } from "ai";
import { google } from "@ai-sdk/google";

export async function createUserInDb() {
  const { userId } = await auth();

  if (!userId) throw new Error("User ID not found");

  // Initialize the Backend SDK
  const client = await clerkClient();

  // Get the user's full `Backend User` object
  const user = userId ? await client.users.getUser(userId) : undefined;

  if (!user) throw new Error("Auth user not found");

  const userDb = await getUserById(userId);

  // User Already exists
  if (userDb) return userDb.id;

  await createUser({
    id: userId,
    name: `${user.firstName} ${user.lastName}`.trim(),
    email: user.emailAddresses[0].emailAddress,
    image: user.imageUrl,
  });

  return userId;
}

export async function createProjectInDb(projectData: InsertProject) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  projectData.userId = userId;

  // Insert the project data into the database
  await createProject(projectData);
}

export async function createProjectInDbForm(formData: FormData) {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  // Insert the project data into the database
  await createProject({
    userId,
    name: formData.get("name") as string,
    caseNumber: formData.get("caseNumber") as string,
    client: formData.get("client") as string,
    caseType: formData.get("caseType") as string,
    status: formData.get("status") as ProjectStatus,
    filingDate: formData.get("filingDate") as string,
    nextDeadline: formData.get("nextDeadline") as string,
    court: formData.get("court") as string,
    judge: formData.get("judge") as string,
    description: formData.get("description") as string,
  });
}

export async function getProjectsFromDb() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  try {
    const projects = await db
      .select()
      .from(projectsTable)
      .where(eq(projectsTable.userId, userId))
      .orderBy(projectsTable.updateAt);
    return { success: true, data: projects };
  } catch (error) {
    console.error("Error fetching projects:", error);
    return { success: false, error: "Problem getting projects" };
  }
}

export async function getUserCategoriesFromDb() {
  const { userId } = await auth();
  if (!userId) throw new Error("User not found");

  try {
    const categories = await db
      .select()
      .from(categoriesTable)
      .where(eq(categoriesTable.userId, userId))
      .orderBy(categoriesTable.createdAt);
    return { success: true, data: categories };
  } catch (error) {
    console.error("Error fetching categories:", error);
    return { success: false, error: "Problem getting categories" };
  }
}

export async function createNewChatInDb(id: string, topic: string) {
  console.log("Creating new chat in DB with topic:", topic);
  const user = await auth();

  if (!user.userId) throw new Error("User not found");

  const { text: chatTitle } = await generateText({
    model: google("gemini-2.0-flash-001"),
    prompt: `Generate a short summary title for this chat. The title must be less than 10 words and be 1 sentence and do not end it with a period. This is the chat topic: ${topic}`,
  });

  const chat = await createChat({
    id,
    userId: user.userId,
    name: chatTitle,
  });

  console.log("New Chat Id:", chat.id);

  return chat.id;
}

// export async function deleteUserMessage() {
//   const { userId } = await auth();
//   if (!userId) throw new Error("User not found");

//   await db.delete(UserMessages).where(eq(UserMessages.user_id, userId));
// }
