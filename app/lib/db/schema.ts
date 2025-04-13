import { relations, sql } from "drizzle-orm";
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
  name: text("name").notNull(),
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
  id: integer("id").primaryKey({ autoIncrement: true }),
  chatId: text("chat_id")
    .notNull()
    .references(() => chatsTable.id, { onDelete: "cascade" }),
  role: text("role").notNull(), // 'user' or 'assistant'
  content: text("content").notNull(),
  responseToMsgId: integer("response_to_id"), // ID of the message this response is replying to (if assistant)
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
  title: text("title").notNull(),
  docTitle: text("doc_title"),
  docSummary: text("doc_summary"),
  relevanceSummary: text("relevance_summary"),
  url: text("url").notNull(),
  tags: text("tags"), // Store as JSON string
  excerpts: text("excerpts"), // Store as JSON string
  //   excerpts: {
  //     title: string;
  //     caseName: string;
  //     content: string;
  //     url: string;
  //   }[];
  messageId: integer("message_id").references(() => messagesTable.id, {
    onDelete: "cascade",
  }),
  chatId: text("chat_id").references(() => chatsTable.id, {
    onDelete: "cascade",
  }),
  createdAt: text("created_at")
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
  projectId: integer("case_id")
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
}));

export const projectsRelations = relations(projectsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [projectsTable.userId],
    references: [usersTable.id],
  }),
  notes: many(notesTable),
  searchResultProjects: many(searchResultProjects),
}));

export const notesRelations = relations(notesTable, ({ one }) => ({
  project: one(projectsTable, {
    fields: [notesTable.caseId],
    references: [projectsTable.id],
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

// You already have messagesRelations, but let's enhance it
export const messagesRelations = relations(messagesTable, ({ one }) => ({
  chat: one(chatsTable, {
    fields: [messagesTable.chatId],
    references: [chatsTable.id],
  }),
  botResponse: one(messagesTable, {
    fields: [messagesTable.responseToMsgId],
    references: [messagesTable.id],
  }),
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
    message: one(messagesTable, {
      fields: [searchResultsTable.messageId],
      references: [messagesTable.id],
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
export type InsertCase = typeof projectsTable.$inferInsert;
export type SelectCase = typeof projectsTable.$inferSelect;
export type InsertChat = typeof chatsTable.$inferInsert;
export type SelectChat = typeof chatsTable.$inferSelect;
export type InsertMessage = typeof messagesTable.$inferInsert;
export type SelectMessage = typeof messagesTable.$inferSelect;
export type InsertCategory = typeof categoriesTable.$inferInsert;
export type SelectCategory = typeof categoriesTable.$inferSelect;
export type InsertSearchResult = typeof searchResultsTable.$inferInsert;
export type SelectSearchResult = typeof searchResultsTable.$inferSelect;
export type InsertSearchResultProject =
  typeof searchResultProjects.$inferInsert;
export type SelectSearchResultProject =
  typeof searchResultProjects.$inferSelect;
export type InsertSearchResultCategory =
  typeof searchResultCategories.$inferInsert;
export type SelectSearchResultCategory =
  typeof searchResultCategories.$inferSelect;
