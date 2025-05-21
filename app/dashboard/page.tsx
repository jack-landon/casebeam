"use client";

import { Suspense, useEffect, useState } from "react";
import { Filter, Plus, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import DashboardSidebar from "@/components/DashboardSidebar";
import { NewProjectModal } from "@/components/NewProjectModal";
import { useRouter, useSearchParams } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectCard from "@/components/ProjectCard";
import { capitalizeFirstLetter } from "@/lib/utils";
import { NewCategoryModal } from "@/components/NewCategoryModal";
import dayjs from "dayjs";
import { useCurrentModal } from "@/components/providers/CurrentModalProvider";
import { useUserData } from "@/components/providers/UserDataProvider";
import NoteCard from "@/components/NoteCard";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useDeviceType } from "@/lib/deviceTypeHook";
import Link from "next/link";

function DashboardContent() {
  const { userData, isLoadingUserData } = useUserData();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCurrentModal } = useCurrentModal();
  const [statusFilter, setStatusFilter] = useState("all");
  const { isDesktop } = useDeviceType();

  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!searchParams.get("tab")) router.push("?tab=projects");
  }, [searchParams, router]);

  // Filter cases based on search query
  const filteredCases = userData?.projects.filter((caseItem) => {
    const matchesSearch =
      caseItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.client?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.caseNumber?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus =
      statusFilter === "all" ||
      caseItem.status.toLowerCase() == statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const filteredNotes = userData?.notes.filter((note) =>
    note.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col border-t">
      <div className="grid flex-1 md:grid-cols-[240px_1fr]">
        <DashboardSidebar />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center gap-4">
            <h1 className="flex-1 text-2xl font-semibold font-lora">
              {capitalizeFirstLetter(searchParams.get("tab") ?? "dashboard")}
            </h1>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 gap-1 cursor-pointer"
              >
                <Filter className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Filter</span>
              </Button>
              {isDesktop ? (
                <>
                  <Button
                    onClick={() => setCurrentModal("newProject")}
                    size="sm"
                    className="h-8 gap-1 cursor-pointer"
                  >
                    <Plus className="hidden sm:inline h-3.5 w-3.5" />
                    <span className="">New Project</span>
                  </Button>
                  <Button
                    onClick={() => setCurrentModal("newCategory")}
                    size="sm"
                    className="h-8 gap-1 cursor-pointer"
                  >
                    <Plus className="hidden sm:inline h-3.5 w-3.5" />
                    <span className="">New Category</span>
                  </Button>
                </>
              ) : (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="cursor-pointer">
                      <Plus className="mr-2 h-4 w-4" />
                      <span>Create</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem
                      onClick={() => setCurrentModal("newProject")}
                      className="cursor-pointer"
                    >
                      New Project
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => setCurrentModal("newCategory")}
                      className="cursor-pointer"
                    >
                      New Category
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder={`Search ${
                    searchParams.get("tab") == "projects"
                      ? "projects"
                      : searchParams.get("tab") == "notes"
                      ? "notes"
                      : ""
                  }...`}
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              {searchParams.get("tab") == "projects" && (
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-[160px] cursor-pointer">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem className="cursor-pointer" value="all">
                      All Cases
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="active">
                      Active
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="pending">
                      Pending
                    </SelectItem>
                    <SelectItem className="cursor-pointer" value="closed">
                      Closed
                    </SelectItem>
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <Link
              key={"projects"}
              href={`/dashboard?tab=projects`}
              className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md transition ease-in-out ${
                searchParams.get("tab") == "projects"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <span className="text-sm font-medium">Projects</span>
            </Link>
            <Link
              key={"notes"}
              href={`/dashboard?tab=notes`}
              className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md transition ease-in-out ${
                searchParams.get("tab") == "notes"
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
              }`}
            >
              <span className="text-sm font-medium">Notes</span>
            </Link>
          </div>
          {searchParams.get("tab") === "projects" ? (
            <Tabs defaultValue="all">
              {isDesktop && (
                <TabsList>
                  <TabsTrigger value="all">All Cases</TabsTrigger>
                  <TabsTrigger value="recent">Recent</TabsTrigger>
                  <TabsTrigger value="upcoming">Upcoming Deadlines</TabsTrigger>
                </TabsList>
              )}
              <TabsContent value="all" className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {isLoadingUserData ? (
                    Array.from({ length: 6 }).map((_, index) => (
                      <div key={index} className="flex flex-col space-y-3">
                        <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-[250px]" />
                          <Skeleton className="h-4 w-[200px]" />
                        </div>
                      </div>
                    ))
                  ) : userData?.projects.length === 0 ? (
                    <div className="sm:col-span-2 lg:col-span-3 flex flex-col justify-center items-center mt-8">
                      <p>No Projects</p>
                      <p className="text-sm text-muted-foreground">
                        Create one to get started.
                      </p>

                      <Button
                        onClick={() => setCurrentModal("newProject")}
                        variant="outline"
                        className="mt-4 cursor-pointer"
                      >
                        <Plus className="h-4 w-4" />
                        Create Project
                      </Button>
                    </div>
                  ) : (
                    filteredCases?.map((caseItem) => (
                      <ProjectCard key={caseItem.id} caseItem={caseItem} />
                    ))
                  )}
                </div>
              </TabsContent>
              <TabsContent value="recent" className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCases
                    ?.filter(
                      (caseItem) =>
                        dayjs(caseItem.updateAt).unix() >
                        Date.now() - 7 * 24 * 60 * 60 * 1000
                    )
                    .map((caseItem) => (
                      <ProjectCard key={caseItem.id} caseItem={caseItem} />
                    ))}
                </div>
              </TabsContent>
              <TabsContent value="upcoming" className="mt-4">
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {filteredCases
                    ?.filter(
                      (caseItem) =>
                        caseItem.projectDates[0] &&
                        dayjs(caseItem.projectDates[0].date).unix() <
                          dayjs().add(14, "days").unix()
                    )
                    .map((caseItem) => (
                      <ProjectCard key={caseItem.id} caseItem={caseItem} />
                    ))}
                </div>
              </TabsContent>
            </Tabs>
          ) : searchParams.get("tab") === "notes" ? (
            userData?.notes.length === 0 ? (
              <div className="flex flex-col justify-center items-center mt-8">
                <p>No Notes</p>
                <p className="text-sm text-muted-foreground">
                  Create one to get started.
                </p>

                <Button variant="outline" className="mt-4 cursor-pointer">
                  <Plus className="h-4 w-4" />
                  Create Note
                </Button>
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredNotes?.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            )
          ) : null}
        </main>
      </div>
      <NewProjectModal />
      <NewCategoryModal />
    </div>
  );
}

export default function ProjectsPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <DashboardContent />
    </Suspense>
  );
}
