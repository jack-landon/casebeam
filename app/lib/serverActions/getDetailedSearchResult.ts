"use server";

import { z } from "zod";
import { getSearchResultById } from "../db/queries/query";
import { generateObject } from "ai";
import { google } from "@ai-sdk/google";
import { Excerpt } from "../db/schema";
import { getDetailedSearchResultPrompt } from "../promptBlocks";
import { updateSearchResult } from "../db/queries/insert";

export async function getDetailedSearchResult(searchResultId: number) {
  console.log("getDetailedSearchResult ID: ", searchResultId);

  const searchResult = await getSearchResultById(searchResultId);
  if (searchResult.extendedSummary) return searchResult; // already generated

  if (!searchResult.excerpts || !searchResult.userMessage?.content)
    throw new Error("Search result not found");

  const userQuery = searchResult.userMessage.content;
  const excerpts = JSON.parse(searchResult.excerpts) as Excerpt[];

  if (!Array.isArray(excerpts) || excerpts.length === 0) {
    throw new Error(
      `No valid excerpts found. Received: ${JSON.stringify(excerpts)}`
    );
  }

  console.log("Parsed excerpts:", JSON.stringify(excerpts, null, 2));
  console.log("User query:", userQuery);

  const { object } = await generateObject({
    model: google("gemini-2.0-flash-001"),
    schema: z.object({
      extendedSummary: z.string(),
      excerpts: z.array(z.string()), // how the excerpt relates to the query
      // excerpts: z.array(
      //   z.object({
      //     excerptId: z.string(), // references the embedding id going in
      //     title: z.string(), // title about how it relates to the query
      //   })
      // ),
    }),
    prompt: getDetailedSearchResultPrompt(excerpts, userQuery),
  });

  console.log("object", object);

  const updatedExcerpts = excerpts.map((excerpt, i) => ({
    ...excerpt,
    title: object.excerpts[i] ?? excerpt.title,
  }));

  // Now Update the search result with the new data
  const updatedSearchResult = await updateSearchResult({
    ...object,
    id: searchResultId,
    extendedSummary: object.extendedSummary,
    excerpts: JSON.stringify(updatedExcerpts),
  });

  return updatedSearchResult;
}
