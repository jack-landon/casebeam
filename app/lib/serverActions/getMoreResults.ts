"use server";

import { convertToCoreMessages, generateObject } from "ai";
import { findRelevantContent } from "./getResultsFromAstro";
import { FilterOption } from "@/page";
import { getChat } from "../db/queries/query";
import { convertUrlToEmbeddedUrl, formatTag } from "../utils";
import { Excerpt, InsertSearchResult } from "../db/schema";
import { createSearchResultsBulk } from "../db/queries/insert";
import { google } from "@ai-sdk/google";
import { searchResultSummarySystemPrompt } from "../promptBlocks";
import { auth } from "@clerk/nextjs/server";
import { searchResultsSchema } from "../zodSchemas";

type GetMoreResultsProp = {
  chatId: string;
  skip: number;
  filters?: FilterOption[];
  limit?: number;
};

export async function getMoreResults({
  chatId,
  filters = [],
  skip,
  limit = 20,
}: GetMoreResultsProp) {
  const user = await auth();
  const chat = await getChat(chatId);

  if (!user.userId) throw new Error("User not found");
  if (!chat) throw new Error("Chat not found");

  // MAKE SURE THIS IS THE LAST MESSAGE
  const botMessages = chat.messages.filter((msg) => msg.role == "assistant");
  const userMessages = chat.messages.filter((msg) => msg.role == "user");

  const lastFiveMessages = chat.messages.slice(-5);
  // const lastFiveMessagesContent = lastFiveMessages
  //   .map((msg) => `[${msg.role.toUpperCase()} MESSAGE]: ${msg.content}`)
  //   .join();

  const messageToStore = lastFiveMessages[lastFiveMessages.length - 1];

  const contextWindow =
    lastFiveMessages.length == 1
      ? messageToStore.content
      : lastFiveMessages
          .slice(-5)
          .map((msg) => `[${msg.role.toUpperCase()} MESSAGE]: ${msg.content}`)
          .join();

  const retrievedExcerpts = await findRelevantContent(
    contextWindow,
    filters,
    limit,
    skip
  );

  const docIdSet = new Set<string>();
  for (const excerpt of retrievedExcerpts) {
    if (docIdSet.has(excerpt.doc_id)) continue;
    docIdSet.add(excerpt.doc_id);
  }

  // Create a doc object but keep the excerpts empty
  const docObject: {
    [key: string]: {
      doc_id: string;
      citation: string;
      jurisdiction: string;
      type: string;
      source: string;
      date: string | undefined;
      url: string;
      similarityScore: number | null;
      $lexical: string;
      excerpts: Excerpt[];
    };
  } = {};

  for (const docId of docIdSet) {
    const excerpts = retrievedExcerpts.filter(
      (excerpt) => excerpt.doc_id === docId
    );
    if (excerpts.length == 0) continue;
    const exampleExcerpt = excerpts[0];

    docObject[docId] = {
      doc_id: exampleExcerpt.doc_id,
      citation: exampleExcerpt.citation,
      jurisdiction: exampleExcerpt.jurisdiction ?? "",
      type: exampleExcerpt.type ?? "",
      source: exampleExcerpt.source ?? "",
      date: exampleExcerpt.date ?? "",
      url: exampleExcerpt.url ?? "#",
      similarityScore: exampleExcerpt.$similarity ?? null,
      $lexical: exampleExcerpt.$lexical,
      excerpts: excerpts.map((excerpt) => ({
        caseName: exampleExcerpt.citation,
        title: exampleExcerpt.citation,
        content: excerpt.$lexical,
        url: !exampleExcerpt.url
          ? null
          : convertUrlToEmbeddedUrl(
              exampleExcerpt.url,
              exampleExcerpt.$lexical
            ),
      })),
    };
  }

  const topFiveResults = Object.values(docObject).slice(0, 5);

  const { object: searchResults } = await generateObject({
    model: google("gemini-2.0-flash-lite-preview-02-05"),
    system: searchResultSummarySystemPrompt(
      messageToStore.content,
      JSON.stringify(topFiveResults)
    ),
    messages: convertToCoreMessages(
      lastFiveMessages.map((msg) => ({
        ...msg,
        createdAt: new Date(msg.createdAt),
        role: msg.role as "user" | "assistant" | "system" | "data",
      }))
    ),
    schema: searchResultsSchema,
  });

  const newTransformedResults: InsertSearchResult[] = Object.values(
    docObject
  ).map((doc) => {
    const searchResult = searchResults.find(
      (result) => result.docId.toLowerCase() === doc.doc_id.toLowerCase()
    );

    const initialExcerpts = doc.excerpts.map((excerpt, i) => ({
      ...excerpt,
      title: `Excerpt ${i + 1}`,
    }));

    return {
      docTitle: doc.citation,
      docId: doc.doc_id,
      shortSummary:
        searchResult?.shortSummary ??
        `${initialExcerpts[0].content.slice(0, 150)}...`,
      extendedSummary: null,
      url: doc.url,
      docDate: doc.date,
      similarityScore: doc.similarityScore,
      jurisdiction: formatTag(doc.jurisdiction),
      type: formatTag(doc.type),
      source: formatTag(doc.source),
      excerpts: JSON.stringify(initialExcerpts ?? []),
      userId: user.userId,
      userMessageId: userMessages[userMessages.length - 1].id,
      botMessageId: botMessages[botMessages.length - 1].id,
      chatId,
    };
  });

  await createSearchResultsBulk(Object.values(newTransformedResults));

  return newTransformedResults.map((result) => ({
    ...result,
    excerpts: JSON.parse(result.excerpts) as Excerpt[],
  }));
}
