"use client";

import { InsertSearchResultWithExcerpts } from "@/lib/types";
import { createContext, useContext, useMemo, useState } from "react";

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

  const value = useMemo(
    () => ({ currentSearchResults, setCurrentSearchResults }),
    [currentSearchResults]
  );

  return (
    <CurrentSearchResultsContext.Provider value={value}>
      {children}
    </CurrentSearchResultsContext.Provider>
  );
};
