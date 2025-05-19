import { SelectCategory } from "@/lib/db/schema";
import { capitalizeFirstLetter, colorList } from "@/lib/utils";
import { Folder, NotebookPen } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

const menuItems = [
  { name: "projects", icon: <Folder className="h-4 w-4" /> },
  { name: "notes", icon: <NotebookPen className="h-4 w-4" /> },
];

type DashboardSidebarProps = {
  userCategories: SelectCategory[];
};

export default function DashboardSidebar({
  userCategories,
}: DashboardSidebarProps) {
  const searchParams = useSearchParams();
  const currentTab = searchParams.get("tab");

  return (
    <aside className="hidden border-r md:block sticky top-16 h-[calc(100vh-64px)]">
      <div className="flex h-full flex-col gap-2 p-4">
        {menuItems.map((item) => (
          <Link
            key={item.name}
            href={`/dashboard?tab=${item.name}`}
            className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md transition ease-in-out ${
              currentTab == item.name
                ? "bg-accent text-accent-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            }`}
          >
            {item.icon}
            <span className="text-sm font-medium">
              {capitalizeFirstLetter(item.name)}
            </span>
          </Link>
        ))}

        {userCategories.length > 0 && (
          <>
            <p className="mt-6 font-bold text-primary dark:text-secondary-foreground">
              Categories
            </p>

            {userCategories.slice(0, 10).map((category) => (
              <Link
                key={category.name}
                href={`/dashboard?tab=${category.name}`}
                className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md transition ease-in-out ${
                  currentTab == category.name
                    ? "bg-accent text-accent-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <div
                  className={`h-1.5 w-1.5 rounded-full ${
                    colorList[category.id % colorList.length]
                  }`}
                />
                <span className="text-sm font-medium">
                  {capitalizeFirstLetter(category.name)}
                </span>
              </Link>
            ))}
          </>
        )}
      </div>
    </aside>
  );
}
