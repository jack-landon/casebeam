import { InsertSearchResult } from "./db/schema";

export type InsertSearchResultWithExcerpts = Omit<
  InsertSearchResult,
  "excerpts" | "tags" | "userId"
> & {
  tags: string[];
  excerpts: {
    title: string;
    caseName: string;
    content: string;
    url: string;
  }[];
};
