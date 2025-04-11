import { motion } from "motion/react";
import { Button } from "./ui/button";
import SearchResult from "./SearchResult";
import { View } from "@/page";
import { SelectCategory, SelectProject } from "@/lib/db/schema";
import Loader from "./Loader";
import { InsertSearchResultWithExcerpts } from "@/lib/types";

type ResultsPanelProps = {
  searchResults: InsertSearchResultWithExcerpts[];
  getArticleDetails: (searchResult: InsertSearchResultWithExcerpts) => void;
  isGettingSearchResults: boolean;
  hidePanel: (panel: View) => void;
  view: View;
  userProjects: SelectProject[];
  userCategories: SelectCategory[];
};

export default function ResultsPanel({
  searchResults,
  getArticleDetails,
  isGettingSearchResults,
  hidePanel,
  view,
  userProjects,
  userCategories,
}: ResultsPanelProps) {
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
        <p className="text-3xl font-bold group-hover:underline">Results</p>

        <Button
          onClick={() => hidePanel("results")}
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
          {searchResults.map((result, i) => (
            <SearchResult
              key={i}
              searchResult={result}
              userProjects={userProjects}
              userCategories={userCategories}
              getArticleDetails={getArticleDetails}
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
