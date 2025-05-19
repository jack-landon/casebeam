import { relations, sql } from "drizzle-orm";
import { integer, sqliteTable, text, real } from "drizzle-orm/sqlite-core";
import { generateRandomColor } from "../utils";

export const projectStatusEnum = ["active", "pending", "closed"] as const;
export type ProjectStatus = (typeof projectStatusEnum)[number];

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
  name: text("name").notNull(),
  caseNumber: text("case_number"),
  client: text("client"),
  caseType: text("case_type"),
  status: text({ enum: projectStatusEnum }).notNull(),
  filingDate: text("filing_date"),
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
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  projectId: integer("project_id").references(() => projectsTable.id, {
    onDelete: "cascade",
  }),
  content: text("content").notNull(),
  color: text("color").notNull().default(generateRandomColor()),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("update_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const chatsTable = sqliteTable("chats", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  lastMessageAt: text("last_message_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const messagesTable = sqliteTable("messages", {
  id: text("id").primaryKey(),
  chatId: text("chat_id")
    .notNull()
    .references(() => chatsTable.id, { onDelete: "cascade" }),
  msgIndex: integer("msg_index").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const categoriesTable = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  description: text("description"),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const searchResultsTable = sqliteTable("search_results", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  docTitle: text("doc_title").notNull(),
  shortSummary: text("short_summary"),
  extendedSummary: text("extended_summary"),
  docDate: text("doc_date"),
  similarityScore: real(),
  url: text("url").notNull(),
  jurisdiction: text("jurisdiction"),
  type: text("type"),
  source: text("source"),
  excerpts: text("excerpts").notNull(), // Store as JSON string
  //   excerpts: {
  //     title: string;
  //     caseName: string;
  //     content: string;
  //     url: string;
  //   }[];
  userMessageId: text("user_message_id").references(() => messagesTable.id, {
    onDelete: "cascade",
  }),
  botMessageId: text("bot_message_id").references(() => messagesTable.id, {
    onDelete: "cascade",
  }),
  chatId: text("chat_id").references(() => chatsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const projectCommentsTable = sqliteTable("project_comments", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  content: text("content").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

export const projectDatesTable = sqliteTable("project_dates", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description").notNull(),
  date: text("date").notNull(),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
  updatedAt: text("updated_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Used for the many-to-many relationship between search results and projects
export const searchResultProjects = sqliteTable("search_result_projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  searchResultId: integer("search_result_id")
    .notNull()
    .references(() => searchResultsTable.id, { onDelete: "cascade" }),
  projectId: integer("project_id")
    .notNull()
    .references(() => projectsTable.id, { onDelete: "cascade" }),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Used for the many-to-many relationship between search results and categories
export const searchResultCategories = sqliteTable("search_result_categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  userId: text("user_id")
    .notNull()
    .references(() => usersTable.id, { onDelete: "cascade" }),
  searchResultId: integer("search_result_id")
    .notNull()
    .references(() => searchResultsTable.id, { onDelete: "cascade" }),
  categoryId: integer("category_id")
    .notNull()
    .references(() => categoriesTable.id, { onDelete: "cascade" }),
  createdAt: text("created_at")
    .default(sql`(CURRENT_TIMESTAMP)`)
    .notNull(),
});

// Relations
export const usersRelations = relations(usersTable, ({ many }) => ({
  projects: many(projectsTable),
  chats: many(chatsTable),
  categories: many(categoriesTable),
  searchResults: many(searchResultsTable),
  notes: many(notesTable),
}));

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [projectsTable.userId],
    references: [usersTable.id],
  }),
  notes: many(notesTable),
  searchResultProjects: many(searchResultProjects),
  comments: many(projectCommentsTable),
  projectDates: many(projectDatesTable),
}));

export const projectCommentsRelations = relations(
  projectCommentsTable,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [projectCommentsTable.userId],
      references: [usersTable.id],
    }),
    project: one(projectsTable, {
      fields: [projectCommentsTable.projectId],
      references: [projectsTable.id],
    }),
  })
);

export const projectDatesRelations = relations(
  projectDatesTable,
  ({ one }) => ({
    project: one(projectsTable, {
      fields: [projectDatesTable.projectId],
      references: [projectsTable.id],
    }),
  })
);

export const notesRelations = relations(notesTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [notesTable.projectId],
    references: [projectsTable.id],
  }),
  user: one(usersTable, {
    fields: [notesTable.userId],
    references: [usersTable.id],
  }),
  searchResult: one(searchResultsTable, {
    fields: [notesTable.id],
    references: [searchResultsTable.id],
  }),
}));

export const chatsRelations = relations(chatsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [chatsTable.userId],
    references: [usersTable.id],
  }),
  messages: many(messagesTable),
  searchResults: many(searchResultsTable),
}));

export const messagesRelations = relations(messagesTable, ({ one, many }) => ({
  chat: one(chatsTable, {
    fields: [messagesTable.chatId],
    references: [chatsTable.id],
  }),
  userSearchResults: many(searchResultsTable, {
    relationName: "userMessage",
  }),
  botSearchResults: many(searchResultsTable, {
    relationName: "botMessage",
  }),
  // searchResults: many(searchResultsTable),
}));

export const categoriesRelations = relations(
  categoriesTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [categoriesTable.userId],
      references: [usersTable.id],
    }),
    searchResultCategories: many(searchResultCategories),
  })
);

export const searchResultsRelations = relations(
  searchResultsTable,
  ({ one, many }) => ({
    user: one(usersTable, {
      fields: [searchResultsTable.userId],
      references: [usersTable.id],
    }),
    userMessage: one(messagesTable, {
      fields: [searchResultsTable.userMessageId],
      references: [messagesTable.id],
      relationName: "userMessage",
    }),
    botMessage: one(messagesTable, {
      fields: [searchResultsTable.botMessageId],
      references: [messagesTable.id],
      relationName: "botMessage",
    }),
    chat: one(chatsTable, {
      fields: [searchResultsTable.chatId],
      references: [chatsTable.id],
    }),
    searchResultProjects: many(searchResultProjects),
    searchResultCategories: many(searchResultCategories),
  })
);

export const searchResultProjectsRelations = relations(
  searchResultProjects,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [searchResultProjects.userId],
      references: [usersTable.id],
    }),
    searchResult: one(searchResultsTable, {
      fields: [searchResultProjects.searchResultId],
      references: [searchResultsTable.id],
    }),
    project: one(projectsTable, {
      fields: [searchResultProjects.projectId],
      references: [projectsTable.id],
    }),
  })
);

export const searchResultCategoriesRelations = relations(
  searchResultCategories,
  ({ one }) => ({
    user: one(usersTable, {
      fields: [searchResultCategories.userId],
      references: [usersTable.id],
    }),
    searchResult: one(searchResultsTable, {
      fields: [searchResultCategories.searchResultId],
      references: [searchResultsTable.id],
    }),
    category: one(categoriesTable, {
      fields: [searchResultCategories.categoryId],
      references: [categoriesTable.id],
    }),
  })
);

// Type inference

export type InsertUser = typeof usersTable.$inferInsert;
export type SelectUser = typeof usersTable.$inferSelect;
export type InsertProject = typeof projectsTable.$inferInsert;
export type SelectProject = typeof projectsTable.$inferSelect;
export type InsertNote = typeof notesTable.$inferInsert;
export type SelectNote = typeof notesTable.$inferSelect;
export type InsertChat = typeof chatsTable.$inferInsert;
export type SelectChat = typeof chatsTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;
export type SelectMessage = typeof messagesTable.$inferSelect;
export type InsertCategory = typeof categoriesTable.$inferInsert;
export type SelectCategory = typeof categoriesTable.$inferSelect;
export type InsertSearchResult = typeof searchResultsTable.$inferInsert;
export type SelectSearchResult = typeof searchResultsTable.$inferSelect;
export type InsertProjectComment = typeof projectCommentsTable.$inferInsert;
export type SelectProjectComment = typeof projectCommentsTable.$inferSelect;
export type InsertProjectDate = typeof projectDatesTable.$inferInsert;
export type SelectProjectDate = typeof projectDatesTable.$inferSelect;
export type InsertSearchResultProject =
  typeof searchResultProjects.$inferInsert;
export type SelectSearchResultProject =
  typeof searchResultProjects.$inferSelect;
export type InsertSearchResultCategory =
  typeof searchResultCategories.$inferInsert;
export type SelectSearchResultCategory =
  typeof searchResultCategories.$inferSelect;
export type Excerpt = {
  title: string;
  caseName: string;
  content: string;
  url: string | null;
};
