import { Excerpt, InsertSearchResult } from "./db/schema";

export type InsertSearchResultWithExcerpts = Omit<
  InsertSearchResult,
  "excerpts" | "userId"
> & {
  excerpts: Excerpt[];
};

export type InsertSearchResultWithExcerptsAndId =
  InsertSearchResultWithExcerpts & {
    id?: number;
  };
