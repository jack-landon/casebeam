import { capitalizeFirstLetter } from "@/lib/utils";
import { useCurrentArticle } from "./providers/CurrentArticleProvider";
import { useCurrentSearchResults } from "./providers/CurrentSearchResultsProvider";
import { FileText, LayoutList, MessagesSquare } from "lucide-react";

type Props = {
  selectedTab: (typeof bottomMenuTabs)[number]["name"];
  setSelectedTab: (tab: (typeof bottomMenuTabs)[number]["name"]) => void;
};

export const bottomMenuTabs = [
  {
    name: "chat",
    icon: <MessagesSquare className="h-4 w-4" />,
  },
  {
    name: "results",
    icon: <LayoutList className="h-4 w-4" />,
  },
  {
    name: "article",
    icon: <FileText className="h-4 w-4" />,
  },
] as const;

export default function BottomMenuBar({ selectedTab, setSelectedTab }: Props) {
  const { currentSearchResults } = useCurrentSearchResults();
  const { currentArticle } = useCurrentArticle();

  return (
    <div
      className={`fixed border-secondary border-opacity-80 border-t-[1px] shadow flex items-center justify-evenly bg-primary w-full bottom-0 md:hidden z-30`}
    >
      {bottomMenuTabs.map((item, index) => {
        if (
          item.name == "chat" ||
          (item.name == "results" && currentSearchResults.length > 0) ||
          (item.name == "article" && currentArticle)
        )
          return (
            <div
              key={item.name}
              onClick={() => {
                setSelectedTab(item.name);
              }}
              className={`flex cursor-pointer w-full flex-col items-center justify-center p-2 transition ease-in-out ${
                selectedTab == item.name
                  ? "bg-accent dark:text-primary-foreground"
                  : "bg-primary dark:bg-secondary dark:text-primary-foreground text-primary-foreground dark:hover:bg-primary"
              } ${
                index < bottomMenuTabs.length - 1
                  ? "border-r border-accent border-opacity-25"
                  : ""
              }`}
            >
              {item.icon}
              <span className="text-xs font-bold">
                {capitalizeFirstLetter(item.name)}
              </span>
            </div>
          );
      })}
    </div>
  );
}
