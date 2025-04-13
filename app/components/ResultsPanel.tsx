import { motion } from "motion/react";
import { Button } from "./ui/button";
import SearchResult from "./SearchResult";
import { View } from "@/page";
import { SelectCategory, SelectProject } from "@/lib/db/schema";
import Loader from "./Loader";
import { InsertSearchResultWithExcerpts } from "@/lib/types";
import { useContext, useEffect, useState } from "react";
import { CurrentSearchResultsContext } from "./ChatContext";

type ResultsPanelProps = {
  setCurrentArticle: (article: InsertSearchResultWithExcerpts) => void;
  isGettingSearchResults: boolean;
  hidePanel: (panel: View) => void;
  view: View;
  userProjects: SelectProject[];
  userCategories: SelectCategory[];
  setIsHidingSearchResults: (isHiding: boolean) => void;
};

export default function ResultsPanel({
  setCurrentArticle,
  isGettingSearchResults,
  hidePanel,
  view,
  userProjects,
  userCategories,
  setIsHidingSearchResults,
}: ResultsPanelProps) {
  const currentSearchResults = useContext(CurrentSearchResultsContext);
  const [amountOfResults, setAmountOfResults] = useState<number>(0);

  useEffect(() => {
    // set the amount of results to a random number between 3,000 and 60,000
    setAmountOfResults(Math.floor(Math.random() * (60000 - 3000 + 1)) + 3000);
  }, [currentSearchResults]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      custom={view}
      className={`flex flex-col w-full h-full overflow-hidden border`}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <div>
          <p className="text-3xl font-bold group-hover:underline">Results</p>
          <p className="text-sm text-muted-foreground">
            From {amountOfResults.toLocaleString()} results
          </p>
        </div>

        <Button
          onClick={() => {
            hidePanel("results");
            setIsHidingSearchResults(true);
          }}
          variant="outline"
          size="sm"
          className="cursor-pointer"
        >
          Hide Panel
        </Button>
      </div>

      {/* Scrollable Results */}
      <div className="relative flex-1 overflow-y-auto">
        {isGettingSearchResults && (
          <div className="absolute inset-0 z-50 bg-gray-900/30 backdrop-blur-xs">
            <div
              role="status"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            >
              <Loader />
              <span className="font-bold mt-2 animate-pulse">Loading</span>
            </div>
          </div>
        )}
        <div className="relative min-h-full">
          {currentSearchResults.map((result, i) => (
            <SearchResult
              key={i}
              searchResult={result}
              userProjects={userProjects}
              userCategories={userCategories}
              setCurrentArticle={setCurrentArticle}
            />
          ))}
        </div>
      </div>

      {/* Fixed Bottom Bar */}
      <div className="border-t p-4 mt-auto flex justify-end gap-2">
        <Button variant="outline" size="sm" className="cursor-pointer">
          Clear Results
        </Button>
        <Button size="sm" className="cursor-pointer">
          Save All
        </Button>
      </div>
    </motion.div>
  );
}
