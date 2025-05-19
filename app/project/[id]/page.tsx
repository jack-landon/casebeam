"use client";

import { use, useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  MoreHorizontal,
  Plus,
  Printer,
  Send,
} from "lucide-react";
import Link from "next/link";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import dayjs from "dayjs";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserData } from "@/components/providers/UserDataProvider";
import { getProjectDetails } from "@/lib/db/queries/query";
import {
  addProjectComment,
  updateProjectStatus,
} from "@/lib/db/queries/insert";
import { capitalizeFirstLetter, getInitials } from "@/lib/utils";
import { useCurrentModal } from "@/components/providers/CurrentModalProvider";
import SearchResultsAccordion from "@/components/SearchResultsAccordion";
import { NewProjectModal } from "@/components/NewProjectModal";
import { toast } from "sonner";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectPage({ params }: PageProps) {
  const { userData } = useUserData();
  const [commentInput, setCommentInput] = useState("");
  const resolvedParams = use(params);
  const { setCurrentModal } = useCurrentModal();
  const [projectDetails, setProjectDetails] = useState<Awaited<
    ReturnType<typeof getProjectDetails>
  > | null>(null);

  const fetchProject = useCallback(async () => {
    const fetchedProjectDetails = await getProjectDetails(
      parseInt(resolvedParams.id)
    );
    setProjectDetails(fetchedProjectDetails);
  }, [resolvedParams.id]);

  useEffect(() => {
    if (!userData) return;
    fetchProject();
  }, [userData, fetchProject]);

  async function handleAddComment() {
    const projectId = parseInt(resolvedParams.id);

    await addProjectComment(projectId, commentInput);
    fetchProject();
    setCommentInput("");
  }

  async function toggleCaseState() {
    if (!projectDetails) return toast.error("Project not found");

    const projectId = parseInt(resolvedParams.id);
    const newStatus = projectDetails.status == "closed" ? "active" : "closed";

    await updateProjectStatus(projectId, newStatus);
    toast.success(`Case ${newStatus == "closed" ? "Closed" : "Reopened"}`);

    fetchProject();
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <div className="container mx-auto max-w-6xl py-6 px-4">
          {projectDetails ? (
            <>
              <div className="mb-6 flex items-center">
                <Button variant="ghost" size="icon" asChild className="mr-2">
                  <Link href="/dashboard?tab=projects" prefetch={false}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Link>
                </Button>
                <div>
                  <h1 className="text-2xl font-bold">{projectDetails.name}</h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{projectDetails.caseNumber}</span>
                    {projectDetails.caseNumber && projectDetails.caseType && (
                      <span>•</span>
                    )}
                    {projectDetails.caseType && (
                      <span className="mr-2">{projectDetails.caseType}</span>
                    )}
                    <Badge
                      variant={
                        projectDetails.status === "active"
                          ? "default"
                          : projectDetails.status === "pending"
                          ? "outline"
                          : "secondary"
                      }
                    >
                      {capitalizeFirstLetter(projectDetails.status)}
                    </Badge>
                  </div>
                </div>
                <div className="ml-auto flex gap-2">
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="gap-1 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="cursor-pointer">
                        <span>Actions</span>
                        <MoreHorizontal className="ml-2 h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setCurrentModal("newProject");
                        }}
                        className="cursor-pointer"
                      >
                        Edit Case
                      </DropdownMenuItem>
                      {/* <DropdownMenuItem className="cursor-pointer">
                      Add Document
                    </DropdownMenuItem>
                    <DropdownMenuItem className="cursor-pointer">
                      Schedule Hearing
                    </DropdownMenuItem> */}
                      <DropdownMenuItem
                        onClick={toggleCaseState}
                        className="cursor-pointer"
                      >
                        {projectDetails.status === "closed"
                          ? "Reopen Case"
                          : "Close Case"}
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>

              <Tabs defaultValue="summary">
                <TabsList className="mb-4">
                  <TabsTrigger value="summary" className="cursor-pointer">
                    Summary
                  </TabsTrigger>
                  <TabsTrigger value="searchResults" className="cursor-pointer">
                    Sources
                  </TabsTrigger>
                  {/* <TabsTrigger value="timeline">Timeline</TabsTrigger> */}
                  {/* <TabsTrigger value="billing">Billing</TabsTrigger> */}
                </TabsList>

                <TabsContent value="summary" className="space-y-6">
                  <div className="grid gap-6 md:grid-cols-2">
                    <Card>
                      <CardHeader>
                        <CardTitle>Case Details</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          {projectDetails.client && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">
                                Client
                              </div>
                              <div>{projectDetails.client}</div>
                            </div>
                          )}
                          {projectDetails.caseType && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">
                                Case Type
                              </div>
                              <div>{projectDetails.caseType}</div>
                            </div>
                          )}
                          {projectDetails.filingDate && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">
                                Filing Date
                              </div>
                              <div>
                                {dayjs(projectDetails.filingDate).format(
                                  "MMM DD, YYYY"
                                )}
                              </div>
                            </div>
                          )}
                          <div>
                            <div className="text-sm font-medium text-muted-foreground">
                              Status
                            </div>
                            <div>
                              {capitalizeFirstLetter(projectDetails.status)}
                            </div>
                          </div>
                          {projectDetails.court && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">
                                Court
                              </div>
                              <div>
                                {projectDetails.court || "Superior Court"}
                              </div>
                            </div>
                          )}
                          {projectDetails.judge && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">
                                Judge
                              </div>
                              <div>
                                {projectDetails.judge || "Hon. Sarah Williams"}
                              </div>
                            </div>
                          )}
                        </div>

                        <Separator />

                        <div>
                          <div className="mb-2 text-sm font-medium text-muted-foreground">
                            Description
                          </div>
                          <div className="text-sm">
                            {projectDetails.description ||
                              "No description available."}
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle>Important Dates</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3">
                          {projectDetails.nextDeadline && (
                            <div className="flex items-start gap-3 rounded-md border p-3">
                              <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">Next Deadline</div>
                                <div className="text-sm text-muted-foreground">
                                  {dayjs(projectDetails.nextDeadline).format(
                                    "MMM DD, YYYY"
                                  )}
                                </div>
                                <div className="mt-1 text-sm">
                                  File Response to Motion for Summary Judgment
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="flex items-start gap-3 rounded-md border p-3">
                            <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Hearing Date</div>
                              <div className="text-sm text-muted-foreground">
                                {dayjs(
                                  new Date(
                                    Date.now() + 30 * 24 * 60 * 60 * 1000
                                  )
                                ).format("MMM DD, YYYY")}
                              </div>
                              <div className="mt-1 text-sm">
                                Motion Hearing - Courtroom 3B
                              </div>
                            </div>
                          </div>

                          <div className="flex items-start gap-3 rounded-md border p-3">
                            <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">
                                Discovery Deadline
                              </div>
                              <div className="text-sm text-muted-foreground">
                                {dayjs(
                                  new Date(
                                    Date.now() + 60 * 24 * 60 * 60 * 1000
                                  )
                                ).format("MMM DD, YYYY")}
                              </div>
                              <div className="mt-1 text-sm">
                                All discovery must be completed by this date
                              </div>
                            </div>
                          </div>
                        </div>

                        <Button variant="outline" className="w-full gap-1">
                          <Plus className="h-4 w-4" />
                          <span>Add Date</span>
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  {/* {associatedCases.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Associated Projects</CardTitle>
                      <CardDescription>
                        Cases related to this matter or with the same client
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        {associatedCases.map((relatedCase) => (
                          <div
                            key={relatedCase.id}
                            className="flex items-center justify-between rounded-md border p-3"
                          >
                            <div className="flex items-center gap-3">
                              <Link2 className="h-5 w-5 text-muted-foreground" />
                              <div>
                                <div className="font-medium">
                                  {relatedCase.title}
                                </div>
                                <div className="text-sm text-muted-foreground">
                                  {relatedCase.caseNumber} •{" "}
                                  {relatedCase.caseType}
                                </div>
                              </div>
                            </div>
                            <Badge
                              variant={
                                relatedCase.status === "Active"
                                  ? "default"
                                  : relatedCase.status === "Pending"
                                  ? "outline"
                                  : "secondary"
                              }
                            >
                              {relatedCase.status}
                            </Badge>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )} */}

                  {projectDetails.searchResultProjects.length > 0 && (
                    <Card>
                      <CardHeader className="flex flex-row items-center">
                        <div>
                          <CardTitle>Saved Search Results</CardTitle>
                          <CardDescription>
                            You added these search results to this project.
                          </CardDescription>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <SearchResultsAccordion
                            searchResults={projectDetails.searchResultProjects}
                          />
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  {userData && (
                    <Card>
                      <CardHeader className="flex flex-row items-center">
                        <div>
                          <CardTitle>Case Comments</CardTitle>
                          <CardDescription>
                            Notes and updates about this case
                          </CardDescription>
                        </div>
                        {/* <Button
                          size="sm"
                          variant="outline"
                          className="ml-auto gap-1"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Note</span>
                        </Button> */}
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {projectDetails.comments.map((comment) => (
                            <div key={comment.id} className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarImage
                                    src={comment.user.image ?? "👤"}
                                    alt={comment.user.name}
                                  />
                                  <AvatarFallback>
                                    {getInitials(comment.user.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div>
                                  <div className="font-medium">
                                    {comment.user.name}
                                  </div>
                                  <div className="text-xs text-muted-foreground">
                                    {dayjs(comment.updatedAt).format(
                                      "MMM DD, YYYY"
                                    )}{" "}
                                    at{" "}
                                    {dayjs(comment.updatedAt).format("h:mm A")}
                                  </div>
                                </div>
                              </div>
                              <div className="text-sm">{comment.content}</div>
                              {/* {note.attachments && (
                              <div className="flex items-center gap-2 rounded-md bg-muted p-2 text-sm">
                                <Paperclip className="h-4 w-4" />
                                <span>{note.attachments}</span>
                              </div>
                            )} */}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                      <CardFooter>
                        <div className="flex w-full gap-2">
                          <Textarea
                            placeholder="Add a note..."
                            className="min-h-[80px]"
                            value={commentInput}
                            onChange={(e) => setCommentInput(e.target.value)}
                          />
                          <Button
                            className="mt-auto cursor-pointer"
                            onClick={handleAddComment}
                          >
                            <Send className="h-4 w-4" />
                            <span className="sr-only">Send</span>
                          </Button>
                        </div>
                      </CardFooter>
                    </Card>
                  )}
                </TabsContent>

                <TabsContent value="searchResults">
                  <Card>
                    <CardHeader>
                      <CardTitle>Case Sources</CardTitle>
                      <CardDescription>
                        All documents related to this case
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      {projectDetails.searchResultProjects.length > 0 ? (
                        <SearchResultsAccordion
                          searchResults={projectDetails.searchResultProjects}
                        />
                      ) : (
                        <div className="text-center text-muted-foreground py-8">
                          No sources added to this case yet.
                        </div>
                      )}
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="timeline">
                  <Card>
                    <CardHeader>
                      <CardTitle>Case Timeline</CardTitle>
                      <CardDescription>
                        Chronological history of case events
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-muted-foreground py-8">
                        Timeline tab content would go here
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="billing">
                  <Card>
                    <CardHeader>
                      <CardTitle>Billing Information</CardTitle>
                      <CardDescription>
                        Invoices and payment history
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center text-muted-foreground py-8">
                        Billing tab content would go here
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </Tabs>
            </>
          ) : (
            <div>
              <div className="mt-20 mb-28 w-full">
                <div className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="space-y-2">
                    <Skeleton className="h-4 w-[250px]" />
                    <Skeleton className="h-4 w-[200px]" />
                  </div>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {Array.from({ length: 6 }).map((_, index) => (
                  <div key={index} className="flex flex-col space-y-3">
                    <Skeleton className="h-[125px] w-[250px] rounded-xl" />
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-[250px]" />
                      <Skeleton className="h-4 w-[200px]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
      {projectDetails && (
        <NewProjectModal
          initialData={{
            ...projectDetails,
            caseNumber: projectDetails.caseNumber?.toString() || "",
            client: projectDetails.client || "",
            caseType: projectDetails.caseType || "",
            filingDate: !projectDetails.filingDate
              ? new Date()
              : new Date(projectDetails.filingDate),
            nextDeadline: !projectDetails.nextDeadline
              ? null
              : new Date(projectDetails.nextDeadline),
            court: projectDetails.court || "",
            judge: projectDetails.judge || "",
            description: projectDetails.description || "",
          }}
        />
      )}
    </>
  );
}
