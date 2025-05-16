import { Plus, Star } from "lucide-react";
import { Button } from "./ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { colorList } from "@/lib/utils";
import { useUserData } from "./providers/UserDataProvider";
import { useCurrentModal } from "./providers/CurrentModalProvider";

type Props = {
  isArticlePanel?: boolean;
  saved: boolean;
  handleSave: (
    e: React.MouseEvent<Element, MouseEvent>,
    type: "project" | "category",
    itemId: number
  ) => Promise<void>;
};

export default function SaveResultDropdown({
  isArticlePanel = false,
  saved,
  handleSave,
}: Props) {
  const { userData } = useUserData();
  const { setCurrentModal } = useCurrentModal();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        {isArticlePanel ? (
          <Button
            className="cursor-pointer w-fit mb-2"
            variant={`outline`}
            size="sm"
          >
            <Star
              fill={`${saved ? "oklch(79.5% 0.184 86.047)" : "transparent"}`}
              className="h-4 w-4 mr-2"
            />
            {saved ? "Saved" : "Save Article"}
          </Button>
        ) : (
          <Button
            variant={`ghost`}
            size="icon"
            className={`cursor-pointer hover:text-yellow-500 ${
              saved ? "text-yellow-500" : ""
            }`}
          >
            <Star
              fill={`${saved ? "oklch(79.5% 0.184 86.047)" : "transparent"}`}
              className="h-4 w-4"
            />
            <span className="sr-only">Save</span>
          </Button>
        )}
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
              onClick={() => setCurrentModal("newProject")}
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
              onClick={() => setCurrentModal("newCategory")}
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
  );
}
