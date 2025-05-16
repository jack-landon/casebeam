"use client";

import { useState } from "react";
import { BookText, Landmark, MapPin, Plus, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { colorList } from "@/lib/utils";
import { saveSearchResultWithAssociations } from "@/lib/db/queries/insert";
import { InsertSearchResultWithExcerptsAndId } from "@/lib/types";
import { NewProjectModal } from "./NewProjectModal";
import { NewCategoryModal } from "./NewCategoryModal";
import dayjs from "dayjs";
import RelevanceIndicator from "./RelevanceIndicator";
import { useUserData } from "./providers/UserDataProvider";
import { useCurrentArticle } from "./providers/CurrentArticleProvider";
import { Skeleton } from "./ui/skeleton";
import { getDetailedSearchResult } from "@/lib/serverActions/getDetailedSearchResult";
import { useCurrentSearchResults } from "./providers/CurrentSearchResultsProvider";

type SearchResultProps = {
  searchResult: InsertSearchResultWithExcerptsAndId;
  isStreaming?: boolean;
  // getArticleDetails: (article: InsertSearchResultWithExcerpts) => void;
};

export default function SearchResult({
  searchResult,
  isStreaming = false,
}: SearchResultProps) {
  const [saved, setSaved] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const { currentSearchResults, setCurrentSearchResults } =
    useCurrentSearchResults();
  const { currentArticle, setCurrentArticle } = useCurrentArticle();
  const { userData } = useUserData();

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
    setSaved(true);
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
    <Card className="group gap-2 w-full max-w-3xl hover:bg-neutral-800 border-b rounded-none transition ease-in-out">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-3">
              {searchResult.docDate && (
                <span className="text-xs text-muted-foreground mb-2">
                  {dayjs(searchResult.docDate).format("MMM D, YYYY")}
                </span>
              )}
              {searchResult.similarityScore && (
                <RelevanceIndicator score={searchResult.similarityScore} />
              )}
            </div>
            <CardTitle
              onClick={handleSelectCurrentArticle}
              className={`flex items-center cursor-pointer group-hover:underline text-xl text-primary hover:underline mb-2`}
            >
              {searchResult.docTitle}
            </CardTitle>
            <CardDescription
              className={`flex items-center ${
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant={`ghost`}
                size="icon"
                className={`cursor-pointer hover:text-yellow-500 ${
                  saved ? "text-yellow-500" : ""
                }`}
              >
                <Star className="h-4 w-4" />
                <span className="sr-only">Save</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel className="font-bold">
                Save to project
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userData?.projects && userData.projects.length === 0 ? (
                <div className="flex flex-col items-center justify-center p-1">
                  <p className="text-muted-foreground italic font-light text-sm mb-3">
                    You have no projects
                  </p>

                  <Button
                    onClick={() => setIsNewProjectModalOpen(true)}
                    size="sm"
                    className="h-8 gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">New Project</span>
                  </Button>
                </div>
              ) : (
                userData?.projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={(e) => handleSave(e, "project", project.id)}
                    className="cursor-pointer font-normal hover:bg-neutral-800"
                  >
                    {project.name}
                  </DropdownMenuItem>
                ))
              )}
              <DropdownMenuSeparator />
              <DropdownMenuLabel className="font-bold">
                Save to category
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              {userData && userData.categories.length == 0 ? (
                <div className="flex flex-col items-center justify-center p-1">
                  <p className="text-muted-foreground italic font-light text-sm mb-3">
                    You have no categories
                  </p>
                  <Button
                    onClick={() => setIsNewCategoryModalOpen(true)}
                    size="sm"
                    className="h-8 gap-1 cursor-pointer"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span className="hidden sm:inline">New Category</span>
                  </Button>
                </div>
              ) : (
                userData &&
                userData.categories.length > 0 && (
                  <>
                    {userData?.categories.map((category) => (
                      <DropdownMenuItem
                        key={category.id}
                        onClick={(e) => handleSave(e, "category", category.id)}
                        className="cursor-pointer font-normal hover:bg-neutral-800"
                      >
                        <div
                          className={`h-1.5 w-1.5 rounded-full ${
                            colorList[category.id % colorList.length]
                          }`}
                        />
                        {category.name}
                      </DropdownMenuItem>
                    ))}
                  </>
                )
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex flex-wrap gap-2 mt-3">
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground group-hover:bg-neutral-700">
            <BookText className="h-3 w-3 mr-2" />
            {searchResult.type}
          </span>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground group-hover:bg-neutral-700">
            <MapPin className="h-3 w-3 mr-2" /> {searchResult.jurisdiction}
          </span>
          <span className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground group-hover:bg-neutral-700">
            <Landmark className="h-3 w-3 mr-2" /> {searchResult.source}
          </span>
        </div>
      </CardContent>
      <NewProjectModal
        open={isNewProjectModalOpen}
        onOpenChange={setIsNewProjectModalOpen}
      />
      <NewCategoryModal
        open={isNewCategoryModalOpen}
        onOpenChange={setIsNewCategoryModalOpen}
      />
    </Card>
  );
}
