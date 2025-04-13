import { InsertSearchResultWithExcerpts } from "@/lib/types";
import { createContext } from "react";

export const CurrentSearchResultsContext = createContext<
  InsertSearchResultWithExcerpts[]
>([]);
export const CurrentArticleContext =
  createContext<InsertSearchResultWithExcerpts | null>(null);
