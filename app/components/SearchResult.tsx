"use client";

import { SearchResultType } from "@/page";
import { useState } from "react";
import { Star } from "lucide-react";

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
import { SelectCategory, SelectProject } from "@/lib/db/schema";
import { colorList } from "@/lib/utils";
import { saveSearchResultWithAssociations } from "@/lib/db/queries/insert";

export default function SearchResult({
  heading,
  subheading,
  summary,
  details,
  source,
  tags,
  getArticleDetails,
  setCurrentReference,
  userProjects,
  userCategories,
}: SearchResultType & {
  summary: string;
  tags: string[];
  userProjects: SelectProject[];
  userCategories: SelectCategory[];
  getArticleDetails: (details: string) => void;
  setCurrentReference: (
    reference: { text: string; url: string } | null
  ) => void;
}) {
  const [saved, setSaved] = useState(false);

  async function handleSave(
    e: React.MouseEvent,
    type: "project" | "category",
    itemId: number
  ) {
    e.stopPropagation();
    toast(`Saving to ${type}`, {
      id: heading,
    });
    await saveSearchResultWithAssociations({
      searchResult: {
        heading,
        subheading,
        details,
        summary,
        sourceTitle: details.length.toString(),
        sourceUrl: details.length.toString(),
        tags: JSON.stringify(tags),
      },
      projectIds: type == "project" ? [itemId] : [],
      categoryIds: type == "category" ? [itemId] : [],
    });
    setSaved(true);
    toast(`Saved to ${type}`, {
      id: heading,
      description: `"${heading}" has been saved to ${type}`,
    });
  }

  return (
    <Card className="group gap-2 w-full max-w-3xl hover:bg-neutral-800 border-b rounded-none transition ease-in-out">
      <CardHeader className="pb-2">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle
              onClick={() => {
                getArticleDetails(details);
                if (!source) return;
                setCurrentReference({
                  text: source.title ?? "Source",
                  url: source.url,
                });
              }}
              className="cursor-pointer group-hover:underline text-xl text-primary hover:underline"
            >
              <p>{heading}</p>
            </CardTitle>
            <CardDescription className="text-sm">{subheading}</CardDescription>
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
              {userProjects.map((project) => (
                <DropdownMenuItem
                  key={project.id}
                  onClick={(e) => handleSave(e, "project", project.id)}
                  className="cursor-pointer font-normal hover:bg-neutral-800"
                >
                  {project.name}
                </DropdownMenuItem>
              ))}
              {userCategories.length > 0 && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuLabel className="font-bold">
                    Save to category
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {userCategories.map((category) => (
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
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">{summary}</p>
        <div className="flex flex-wrap gap-2 mt-3">
          {tags.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground group-hover:bg-neutral-700"
            >
              {tag}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
