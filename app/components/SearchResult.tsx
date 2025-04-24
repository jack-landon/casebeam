"use client";

import { useState } from "react";
import { Plus, Star } from "lucide-react";

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
import { InsertSearchResultWithExcerpts } from "@/lib/types";
import { NewProjectModal } from "./NewProjectModal";
import { NewCategoryModal } from "./NewCategoryModal";
import dayjs from "dayjs";
import RelevanceIndicator from "./RelevanceIndicator";
import { useUserData } from "./contexts/UserDataContext";

type SearchResultProps = {
  searchResult: InsertSearchResultWithExcerpts;
  setCurrentArticle: (article: InsertSearchResultWithExcerpts) => void;
  // getArticleDetails: (article: InsertSearchResultWithExcerpts) => void;
};

export default function SearchResult({
  searchResult,
  setCurrentArticle,
}: SearchResultProps) {
  const [saved, setSaved] = useState(false);
  const [isNewProjectModalOpen, setIsNewProjectModalOpen] = useState(false);
  const [isNewCategoryModalOpen, setIsNewCategoryModalOpen] = useState(false);
  const { userData } = useUserData();

  async function handleSave(
    e: React.MouseEvent,
    type: "project" | "category",
    itemId: number
  ) {
    e.stopPropagation();
    toast(`Saving to ${type}`, {
      id: searchResult.title,
    });
    await saveSearchResultWithAssociations({
      searchResult: {
        ...searchResult,
        excerpts: JSON.stringify(searchResult.excerpts),
        tags: JSON.stringify(searchResult.tags),
      },
      projectIds: type == "project" ? [itemId] : [],
      categoryIds: type == "category" ? [itemId] : [],
    });
    setSaved(true);
    toast(`Saved to ${type}`, {
      id: searchResult.title,
      description: `"${searchResult.title}" has been saved to ${type}`,
    });
  }

  return (
    <Card className="group gap-2 w-full max-w-3xl hover:bg-neutral-800 border-b rounded-none transition ease-in-out">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            {searchResult.docDate && (
              <span className="text-xs text-muted-foreground mb-2">
                {dayjs(searchResult.docDate).format("MMM D, YYYY")}
              </span>
            )}
            {searchResult.similarityScore && (
              <RelevanceIndicator score={searchResult.similarityScore} />
              // <StarRating percentage={searchResult.similarityScore * 100} />
            )}
            <CardTitle
              onClick={() => {
                setCurrentArticle(searchResult);
              }}
              className="cursor-pointer group-hover:underline text-xl text-primary hover:underline"
            >
              <p>{searchResult.title}</p>
            </CardTitle>
            <CardDescription className="text-sm">
              {searchResult.docTitle}
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
        <p className="text-sm text-muted-foreground">
          {searchResult.docSummary}
        </p>
        {searchResult.tags && (
          <div className="flex flex-wrap gap-2 mt-3">
            {searchResult.tags.map((tag, i) => (
              <span
                key={`${tag}-${i}`}
                className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground group-hover:bg-neutral-700"
              >
                {tag}
              </span>
            ))}
          </div>
        )}
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
