"use client";

import { BookText, Landmark, MapPin } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { toast } from "sonner";
import { saveSearchResultWithAssociations } from "@/lib/db/queries/insert";
import { InsertSearchResultWithExcerptsAndId } from "@/lib/types";
import dayjs from "dayjs";
import RelevanceIndicator from "./RelevanceIndicator";
import { useUserData } from "./providers/UserDataProvider";
import { useCurrentArticle } from "./providers/CurrentArticleProvider";
import { Skeleton } from "./ui/skeleton";
import { getDetailedSearchResult } from "@/lib/serverActions/getDetailedSearchResult";
import { useCurrentSearchResults } from "./providers/CurrentSearchResultsProvider";
import SaveResultDropdown from "./SaveResultDropdown";
import { bottomMenuTabs } from "./BottomMenuBar";

type SearchResultProps = {
  searchResult: InsertSearchResultWithExcerptsAndId;
  isStreaming?: boolean;
  setSelectedTab?: (tab: (typeof bottomMenuTabs)[number]["name"]) => void;
};

export default function SearchResult({
  searchResult,
  isStreaming = false,
  setSelectedTab,
}: SearchResultProps) {
  const { currentSearchResults, setCurrentSearchResults } =
    useCurrentSearchResults();
  const { currentArticle, setCurrentArticle } = useCurrentArticle();
  const { userData, refreshUserData } = useUserData();

  async function handleSave(
    e: React.MouseEvent,
    type: "project" | "category",
    itemId: number
  ) {
    e.stopPropagation();
    toast(`Saving to ${type}`, {
      id: searchResult.docTitle,
    });
    await saveSearchResultWithAssociations({
      searchResult: {
        ...searchResult,
        excerpts: JSON.stringify(searchResult.excerpts),
      },
      projectIds: type == "project" ? [itemId] : [],
      categoryIds: type == "category" ? [itemId] : [],
    });
    refreshUserData();
    toast(`Saved to ${type}`, {
      id: searchResult.docTitle,
      description: `"${searchResult.docTitle}" has been saved to ${type}`,
    });
  }

  async function handleSelectCurrentArticle() {
    if (
      currentArticle &&
      currentArticle != "loading" &&
      currentArticle.id == searchResult.id
    )
      return;

    if (setSelectedTab) setSelectedTab("article");

    if (searchResult.extendedSummary) {
      setCurrentArticle(searchResult);
      return;
    }

    if (isStreaming) return toast.error("Loading Result...");

    if (!searchResult.id) return toast.error("No search result found");

    setCurrentArticle("loading");

    const updatedSearchResult = await getDetailedSearchResult(searchResult.id);

    const updatedSearchResultWithExcerpts = {
      ...updatedSearchResult,
      excerpts: JSON.parse(updatedSearchResult.excerpts),
    };

    setCurrentArticle(updatedSearchResultWithExcerpts);

    // Update currentSearchResults with the new search result included
    const newSearchResults = currentSearchResults.map((result) => {
      if (result.id === searchResult.id) return updatedSearchResultWithExcerpts;
      return result;
    });

    setCurrentSearchResults(newSearchResults);
  }

  return (
    <Card className="group gap-2 w-full max-w-3xl hover:bg-accent dark:hover:bg-accent-foreground border-x-0 border-y rounded-none transition ease-in-out">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-3">
              <RelevanceIndicator score={searchResult.similarityScore ?? 0} />
            </div>
            <CardTitle
              onClick={handleSelectCurrentArticle}
              className={`cursor-pointer group-hover:underline text-xl text-accent-foreground dark:text-secondary-foreground hover:underline font-lora`}
            >
              {searchResult.docTitle}
            </CardTitle>
            {searchResult.docDate && (
              <p className="text-xs text-muted-foreground mt-1">
                {dayjs(searchResult.docDate).format("MMM D, YYYY")}
              </p>
            )}
            <CardDescription
              className={`flex items-center mt-3 ${
                isStreaming ? "animate-pulse" : ""
              }`}
            >
              {isStreaming && (
                <div className="w-full flex flex-col gap-2 mb-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                </div>
              )}
              <p>{searchResult.shortSummary}</p>
            </CardDescription>
          </div>
          <SaveResultDropdown
            saved={
              !userData
                ? false
                : userData.projects.some((result) =>
                    result.searchResultProjects.some(
                      (res) => res.searchResultId == searchResult.id
                    )
                  ) ||
                  userData.categories.some((result) =>
                    result.searchResultCategories.some(
                      (res) => res.searchResultId == searchResult.id
                    )
                  )
            }
            handleSave={handleSave}
            isArticlePanel={false}
          />
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent text-secondary-foreground bg-secondary dark:group-hover:bg-secondary group-hover:bg-accent-foreground">
            <BookText className="h-3 w-3 mr-2" />
            {searchResult.type}
          </span>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent text-secondary-foreground bg-secondary dark:group-hover:bg-secondary group-hover:bg-accent-foreground">
            <MapPin className="h-3 w-3 mr-2" /> {searchResult.jurisdiction}
          </span>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent text-secondary-foreground bg-secondary dark:group-hover:bg-secondary group-hover:bg-accent-foreground">
            <Landmark className="h-3 w-3 mr-2" /> {searchResult.source}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
