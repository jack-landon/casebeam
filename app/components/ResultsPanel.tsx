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
import dayjs from "dayjs";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { useCurrentArticle } from "./providers/CurrentArticleProvider";
import { useDeviceType } from "@/lib/deviceTypeHook";
import { bottomMenuTabs } from "./BottomMenuBar";

type SortingMethod = "relevance" | "date";

type ResultsPanelProps = {
  isGettingSearchResults: boolean;
  view: View;
  setIsShowingSearchResults: (isHShowing: boolean) => void;
  isStreaming?: boolean;
  setSelectedTab?: (tab: (typeof bottomMenuTabs)[number]["name"]) => void;
};

export default function ResultsPanel({
  isGettingSearchResults,
  view,
  setIsShowingSearchResults,
  isStreaming = false,
  setSelectedTab,
}: ResultsPanelProps) {
  const { currentSearchResults, setCurrentSearchResults } =
    useCurrentSearchResults();
  const [isLoadingMoreResults, setIsLoadingMoreResults] = useState(false);
  const [sortingMethod, setSortingMethod] =
    useState<SortingMethod>("relevance");
  const { currentArticle } = useCurrentArticle();
  const { isMobile, isTablet, isDesktop } = useDeviceType();

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
          <p className="text-2xl md:text-3xl font-bold group-hover:underline flex items-center font-lora">
            Results {isStreaming && <Loader className="ml-2" size="md" />}
          </p>
          <div className="text-sm text-muted-foreground">
            <div className="flex items-center">
              <span>Showing</span>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <span className="flex items-center whitespace-nowrap mx-1 underline cursor-pointer">
                    {sortingMethod == "relevance"
                      ? "most relevant"
                      : sortingMethod == "date"
                      ? "most recent"
                      : "best"}
                    <ChevronDown className="ml-0.5 h-3 w-3" />
                  </span>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56">
                  <DropdownMenuLabel>Sort Results By</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuRadioGroup
                    value={sortingMethod}
                    onValueChange={(value) =>
                      setSortingMethod(value as SortingMethod)
                    }
                  >
                    <DropdownMenuRadioItem
                      value="relevance"
                      className="cursor-pointer"
                    >
                      Relevance
                    </DropdownMenuRadioItem>
                    <DropdownMenuRadioItem
                      value="date"
                      className="cursor-pointer"
                    >
                      Date
                    </DropdownMenuRadioItem>
                  </DropdownMenuRadioGroup>
                </DropdownMenuContent>
              </DropdownMenu>
              {currentArticle || isMobile
                ? `${currentSearchResults.length.toLocaleString()} documents`
                : `${currentSearchResults.length.toLocaleString()} of ~
              ${totalDocumentsCount.toLocaleString()} documents`}
            </div>
          </div>
        </div>
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
            .sort((a, b) =>
              sortingMethod == "date"
                ? dayjs(b.docDate ?? dayjs()).unix() -
                  dayjs(a.docDate ?? dayjs()).unix()
                : (b.similarityScore ?? 0) - (a.similarityScore ?? 0)
            )
            .map((result, i) => (
              <SearchResult
                key={i}
                searchResult={result}
                isStreaming={isStreaming}
                setSelectedTab={setSelectedTab}
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
        {isDesktop && (
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
        )}
        {(isMobile || isTablet) && setSelectedTab && (
          <Button
            onClick={() => {
              setSelectedTab("chat");
            }}
            size="sm"
            variant={"outline"}
            className="cursor-pointer"
          >
            Return To Chat
          </Button>
        )}
      </div>
    </motion.div>
  );
}
