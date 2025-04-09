import { sql } from "drizzle-orm";
import { integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const usersTable = sqliteTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").unique().notNull(),
  image: text("image"),
});

export const projectsTable = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  caseNumber: text("case_number").notNull(),
  client: text("client").notNull(),
  caseType: text("case_type").notNull(),
  status: text("status").notNull(),
  filingDate: text("filing_date").notNull(),
  lastUpdated: integer("last_updated").notNull(),
  nextDeadline: text("next_deadline"),
  court: text("court"),
  judge: text("judge"),
  description: text("description"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updateAt: integer("updated_at", { mode: "timestamp" }).$onUpdate(
    () => new Date()
  ),
});

export const notesTable = sqliteTable("notes", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  caseId: integer("case_id").notNull(),
  authorName: text("author_name").notNull(),
  authorAvatar: text("author_avatar"),
  timestamp: integer("timestamp").notNull(),
  content: text("content").notNull(),
  attachments: text("attachments"),
});

export const relatedCasesTable = sqliteTable("related_cases", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  caseId: integer("case_id").notNull(),
  relatedCaseId: integer("related_case_id").notNull(),
});

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;
export type SelectProject = typeof projectsTable.$inferSelect;
export type InsertNote = typeof notesTable.$inferInsert;
export type SelectNote = typeof notesTable.$inferSelect;
export type InsertCase = typeof projectsTable.$inferInsert;
export type SelectCase = typeof projectsTable.$inferSelect;
