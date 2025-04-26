"use client";

import { InsertSearchResultWithExcerpts } from "@/lib/types";
import { createContext, useContext, useState } from "react";

type CurrentSearchResultsContextType = {
  currentSearchResults: InsertSearchResultWithExcerpts[];
  setCurrentSearchResults: React.Dispatch<
    React.SetStateAction<InsertSearchResultWithExcerpts[]>
  >;
};

export const CurrentSearchResultsContext =
  createContext<CurrentSearchResultsContextType>({
    currentSearchResults: [],
    setCurrentSearchResults: () => {},
  });

export const useCurrentSearchResults = () =>
  useContext(CurrentSearchResultsContext);

export const CurrentSearchResultsProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentSearchResults, setCurrentSearchResults] = useState<
    InsertSearchResultWithExcerpts[]
  >([]);

  return (
    <CurrentSearchResultsContext.Provider
      value={{ currentSearchResults, setCurrentSearchResults }}
    >
      {children}
    </CurrentSearchResultsContext.Provider>
  );
};
