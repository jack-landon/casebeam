"use client";

import { InsertSearchResultWithExcerpts } from "@/lib/types";
import { createContext, useContext, useState } from "react";

type CurrentArticleContextType = {
  currentArticle: InsertSearchResultWithExcerpts | "loading" | null;
  setCurrentArticle: React.Dispatch<
    React.SetStateAction<InsertSearchResultWithExcerpts | "loading" | null>
  >;
};

export const CurrentArticleContext = createContext<CurrentArticleContextType>({
  currentArticle: null,
  setCurrentArticle: () => {},
});

export const useCurrentArticle = () => useContext(CurrentArticleContext);

export const CurrentArticleProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentArticle, setCurrentArticle] =
    useState<CurrentArticleContextType["currentArticle"]>(null);

  return (
    <CurrentArticleContext.Provider
      value={{ currentArticle, setCurrentArticle }}
    >
      {children}
    </CurrentArticleContext.Provider>
  );
};
