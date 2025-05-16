import { motion } from "motion/react";
import { Button } from "./ui/button";
import SearchResult from "./SearchResult";
import { View } from "@/page";
import Loader from "./Loader";
import { useCurrentSearchResults } from "./providers/CurrentSearchResultsProvider";
import { totalDocumentsCount } from "@/lib/utils";
import { getMoreResults } from "@/lib/serverActions/getMoreResults";
import { useState } from "react";
import { toast } from "sonner";

type ResultsPanelProps = {
  isGettingSearchResults: boolean;
  view: View;
  setIsShowingSearchResults: (isHShowing: boolean) => void;
  isStreaming?: boolean;
};

export default function ResultsPanel({
  isGettingSearchResults,
  view,
  setIsShowingSearchResults,
  isStreaming = false,
}: ResultsPanelProps) {
  const { currentSearchResults, setCurrentSearchResults } =
    useCurrentSearchResults();
  const [isLoadingMoreResults, setIsLoadingMoreResults] = useState(false);

  async function searchMore() {
    try {
      setIsLoadingMoreResults(true);
      const chatId = currentSearchResults[0].chatId;

      if (!chatId) return toast.error("Chat not found. Please try again.");

      const moreResults = await getMoreResults({
        chatId,
        skip: currentSearchResults.length,
        limit: 20,
      });

      setCurrentSearchResults([...currentSearchResults, ...moreResults]);
    } catch (error) {
      console.log("Error getting more results: ", error);
      toast.error("Error getting more results. Please try again.");
    } finally {
      setIsLoadingMoreResults(false);
    }
  }

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
          <p className="text-3xl font-bold group-hover:underline flex items-center">
            Results {isStreaming && <Loader className="ml-2" size="md" />}
          </p>
          <p className="text-sm text-muted-foreground">
            Showing best {currentSearchResults.length.toLocaleString()} of ~
            {totalDocumentsCount.toLocaleString()} documents
          </p>
        </div>

        <Button
          onClick={() => {
            setIsShowingSearchResults(false);
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
              <span className="mt-2 animate-pulse">
                This can take up to 15 seconds...
              </span>
            </div>
          </div>
        )}
        <div className="relative min-h-full">
          {currentSearchResults
            .sort((a, b) => (b.similarityScore ?? 0) - (a.similarityScore ?? 0))
            .map((result, i) => (
              <SearchResult
                key={i}
                searchResult={result}
                isStreaming={isStreaming}
              />
            ))}
          <div className="flex justify-center items-center my-2">
            <Button
              disabled={isLoadingMoreResults}
              onClick={searchMore}
              className="cursor-pointer"
            >
              {isLoadingMoreResults && <Loader className="mr-2" size="sm" />}
              <span className="">
                {isLoadingMoreResults ? "Loading More Results" : "Search More"}
              </span>
            </Button>
          </div>
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
