import { InsertSearchResult } from "./db/schema";

export type InsertSearchResultWithExcerpts = Omit<
  InsertSearchResult,
  "excerpts" | "userId"
> & {
  excerpts: {
    title: string;
    caseName: string;
    content: string;
    url: string;
  }[];
};
