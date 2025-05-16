"use client";

import { Suspense, useCallback, useEffect, useState } from "react";
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
import { SelectCategory, SelectProject } from "@/lib/db/schema";
import { useUser } from "@clerk/nextjs";
import { getProjectsFromDb, getUserCategoriesFromDb } from "@/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";
import ProjectCard from "@/components/ProjectCard";
import { capitalizeFirstLetter } from "@/lib/utils";
import { NewCategoryModal } from "@/components/NewCategoryModal";
import dayjs from "dayjs";
import { useCurrentModal } from "@/components/providers/CurrentModalProvider";

function DashboardContent() {
  const { user } = useUser();
  const router = useRouter();
  const searchParams = useSearchParams();
  const { setCurrentModal } = useCurrentModal();

  const [searchQuery, setSearchQuery] = useState("");
  const [isLoadingProjects, setIsLoadingProjects] = useState(true);

  const [projects, setProjects] = useState<SelectProject[]>([]);
  const [userCategories, setUserCategories] = useState<SelectCategory[]>([]);

  useEffect(() => {
    if (!searchParams.get("tab")) router.push("?tab=projects");
  }, [searchParams, router]);

  const getProjects = useCallback(async () => {
    try {
      setIsLoadingProjects(true);
      const { data: userProjects } = await getProjectsFromDb();
      const { data: userCategories } = await getUserCategoriesFromDb();
      if (!userProjects || !userCategories) return;
      setProjects(userProjects);
      setUserCategories(userCategories);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoadingProjects(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    getProjects();
  }, [user, getProjects]);

  // Filter cases based on search query
  const filteredCases = projects.filter(
    (caseItem) =>
      caseItem.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      caseItem.caseNumber.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex min-h-screen flex-col border-t">
      <div className="grid flex-1 md:grid-cols-[240px_1fr]">
        <DashboardSidebar userCategories={userCategories} />
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
          <div className="flex items-center gap-4">
            <h1 className="flex-1 text-2xl font-semibold">
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
              <Button
                onClick={() => setCurrentModal("newProject")}
                size="sm"
                className="h-8 gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Project</span>
              </Button>
              <Button
                onClick={() => setCurrentModal("newCategory")}
                size="sm"
                className="h-8 gap-1 cursor-pointer"
              >
                <Plus className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">New Category</span>
              </Button>
            </div>
          </div>
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex flex-1 items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Search cases..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-[160px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Cases</SelectItem>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All Cases</TabsTrigger>
              <TabsTrigger value="recent">Recent</TabsTrigger>
              <TabsTrigger value="upcoming">Upcoming Deadlines</TabsTrigger>
            </TabsList>
            <TabsContent value="all" className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {isLoadingProjects ? (
                  Array.from({ length: 6 }).map((_, index) => (
                    <div key={index} className="flex flex-col space-y-3">
                      <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                      </div>
                    </div>
                  ))
                ) : projects.length === 0 ? (
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
                  filteredCases.map((caseItem) => (
                    <ProjectCard key={caseItem.id} caseItem={caseItem} />
                  ))
                )}
              </div>
            </TabsContent>
            <TabsContent value="recent" className="mt-4">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {filteredCases
                  .filter(
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
                  .filter(
                    (caseItem) =>
                      caseItem.nextDeadline &&
                      new Date(caseItem.nextDeadline) <
                        new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                  )
                  .map((caseItem) => (
                    <ProjectCard key={caseItem.id} caseItem={caseItem} />
                  ))}
              </div>
            </TabsContent>
          </Tabs>
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
