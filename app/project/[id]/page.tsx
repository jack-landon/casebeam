"use client";

import { FormEvent, use, useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarIcon,
  MoreHorizontal,
  Plus,
  Printer,
  Send,
  X,
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
  createProjectDate,
  deleteProjectDateFromDb,
  updateProjectStatus,
} from "@/lib/db/queries/insert";
import { capitalizeFirstLetter, cn, getInitials } from "@/lib/utils";
import { useCurrentModal } from "@/components/providers/CurrentModalProvider";
import SearchResultsAccordion from "@/components/SearchResultsAccordion";
import { NewProjectModal } from "@/components/NewProjectModal";
import { toast } from "sonner";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { ConfirmDeleteDateDialog } from "./ConfirmDeleteDateDialog";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

type DateFormData = {
  name: string;
  description: string;
  date: Date;
};

type FormFields = keyof DateFormData;

export default function ProjectPage({ params }: PageProps) {
  const { userData } = useUserData();
  const [commentInput, setCommentInput] = useState("");
  const resolvedParams = use(params);
  const { setCurrentModal } = useCurrentModal();
  const [projectDetails, setProjectDetails] = useState<Awaited<
    ReturnType<typeof getProjectDetails>
  > | null>(null);
  const [isSubmittingNewDate, setIsSubmittingNewDate] = useState(false);
  const [dateFormData, setDateFormData] = useState<DateFormData>({
    name: "",
    description: "",
    date: new Date(),
  });

  const handleNewDateChange = (
    field: string,
    value: DateFormData[FormFields]
  ) => {
    setDateFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleNewDateSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmittingNewDate(true);

    try {
      if (!userData?.id) return;

      await createProjectDate({
        ...dateFormData,
        projectId: parseInt(resolvedParams.id),
        date: dayjs(dateFormData.date).format("YYYY-MM-DD"),
      });

      fetchProject();

      toast("Date Added", {
        description: "Your new date has been successfully added.",
      });

      setDateFormData({
        name: "",
        description: "",
        date: new Date(),
      });
      document.getElementById("new-date-modal-close")?.click();
    } catch (error) {
      console.error("Error creating date:", error);
      toast("Error", {
        description: "There was an error adding this date. Please try again.",
        className: "bg-red-500 text-white",
      });
    } finally {
      setIsSubmittingNewDate(false);
    }
  };

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
    if (commentInput == "") return;
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

  async function deleteProjectDate(projectDateId: number) {
    await deleteProjectDateFromDb(projectDateId);
    fetchProject();
    toast.success("Date Deleted");
  }

  return (
    <>
      <div className="flex min-h-screen flex-col">
        <div className="container mx-auto max-w-6xl py-6 px-4">
          {projectDetails ? (
            <>
              <div className="mb-6 flex items-center">
                <Button
                  variant="ghost"
                  size="icon"
                  asChild
                  className="hidden lg:block mr-2"
                >
                  <Link href="/dashboard?tab=projects" prefetch={false}>
                    <ArrowLeft className="h-4 w-4" />
                    <span className="sr-only">Back</span>
                  </Link>
                </Button>
                <div>
                  <h1 className="text-xl md:text-2xl font-bold font-lora">
                    {projectDetails.name}
                  </h1>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    {projectDetails.caseNumber && (
                      <span>{projectDetails.caseNumber}</span>
                    )}
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
                <div className="ml-auto gap-2">
                  <Button
                    onClick={() => window.print()}
                    variant="outline"
                    className="hidden lg:flex gap-1 cursor-pointer"
                  >
                    <Printer className="h-4 w-4" />
                    <span>Print</span>
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="cursor-pointer">
                        <span className="text-xs md:text-base">Actions</span>
                        <MoreHorizontal className="ml-1 lg:ml-2 h-2 w-2 md:h-4 md:w-4" />
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
                      <DropdownMenuItem
                        onClick={toggleCaseState}
                        className="cursor-pointer"
                      >
                        {projectDetails.status === "closed"
                          ? "Reopen Case"
                          : "Close Case"}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => window.print()}
                        className="lg:hidden cursor-pointer"
                      >
                        Print
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
                        <CardTitle className="font-lora">
                          Case Details
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="grid grid-cols-2 gap-4 text-sm md:text-base">
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
                          {projectDetails.projectDates[0] && (
                            <div>
                              <div className="text-sm font-medium text-muted-foreground">
                                Upcoming: {projectDetails.projectDates[0].name}
                              </div>
                              <div>
                                {dayjs(
                                  projectDetails.projectDates[0].date
                                ).format("MMM DD, YYYY")}
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
                        <CardTitle className="font-lora">
                          Important Dates
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="space-y-3 max-h-72 overflow-auto">
                          {projectDetails.projectDates.length > 0 ? (
                            projectDetails.projectDates
                              .sort(
                                (a, b) =>
                                  dayjs(a.date).unix() - dayjs(b.date).unix()
                              )
                              .map((projectDate) => (
                                <div
                                  key={projectDate.id}
                                  className="flex items-start gap-3 rounded-md border p-3"
                                >
                                  <CalendarIcon className="mt-2 h-5 w-5 text-muted-foreground" />
                                  <div className="w-full">
                                    <div className="w-full flex items-center justify-between">
                                      <div className="font-medium">
                                        {projectDate.name}
                                      </div>
                                      <ConfirmDeleteDateDialog
                                        title="Are you absolutely sure?"
                                        description={`Are you sure you want to delete the ${projectDate.name} date? This action cannot be undone.`}
                                        confirmDelete={() => {
                                          deleteProjectDate(projectDate.id);
                                        }}
                                      >
                                        <Button className="cursor-pointer bg-transparent text-secondary">
                                          <X className="h-3 w-3" />
                                        </Button>
                                      </ConfirmDeleteDateDialog>
                                    </div>
                                    <div className="text-sm text-muted-foreground">
                                      {dayjs(projectDate.date).format(
                                        "MMM DD, YYYY"
                                      )}
                                    </div>
                                    <div className="mt-1 text-sm">
                                      {projectDate.description}
                                    </div>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div className="text-center text-muted-foreground py-8">
                              No important dates added to this case yet.
                            </div>
                          )}
                        </div>

                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              className="w-full gap-1 cursor-pointer"
                            >
                              <Plus className="h-4 w-4" />
                              <span>Add Date</span>
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <form onSubmit={handleNewDateSubmit}>
                              <DialogHeader>
                                <DialogTitle className="font-lora">
                                  Add Important Date
                                </DialogTitle>
                                <DialogDescription>
                                  Add a new important for the{" "}
                                  {projectDetails.name} project.
                                </DialogDescription>
                              </DialogHeader>
                              <div className="grid gap-4 py-4">
                                <div className="col-span-2">
                                  <Label className="mb-2" htmlFor="title">
                                    Title
                                  </Label>
                                  <Input
                                    id="title"
                                    value={dateFormData.name}
                                    onChange={(e) =>
                                      handleNewDateChange(
                                        "name",
                                        e.target.value
                                      )
                                    }
                                    required
                                  />
                                </div>
                                <div>
                                  <Label className="mb-2" htmlFor="date">
                                    Date
                                  </Label>
                                  <Popover>
                                    <PopoverTrigger asChild>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full justify-start text-left font-normal cursor-pointer",
                                          !dateFormData.date &&
                                            "text-muted-foreground"
                                        )}
                                      >
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        {dateFormData.date ? (
                                          dayjs(dateFormData.date).format(
                                            "MMM D, YYYY"
                                          )
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                      </Button>
                                    </PopoverTrigger>
                                    <PopoverContent className="w-auto p-0">
                                      <Calendar
                                        mode="single"
                                        selected={dateFormData.date}
                                        onSelect={(returnedDate) =>
                                          returnedDate &&
                                          handleNewDateChange(
                                            "date",
                                            returnedDate
                                          )
                                        }
                                        initialFocus
                                      />
                                    </PopoverContent>
                                  </Popover>
                                </div>
                                <div className="col-span-2">
                                  <Label className="mb-2" htmlFor="description">
                                    Description (Optional)
                                  </Label>
                                  <Textarea
                                    id="description"
                                    value={dateFormData.description}
                                    onChange={(e) =>
                                      handleNewDateChange(
                                        "description",
                                        e.target.value
                                      )
                                    }
                                    className="min-h-[100px]"
                                  />
                                </div>
                              </div>
                              <DialogFooter>
                                <DialogClose asChild>
                                  <Button
                                    id="new-date-modal-close"
                                    type="button"
                                    variant="secondary"
                                    className="cursor-pointer"
                                  >
                                    Close
                                  </Button>
                                </DialogClose>
                                <Button
                                  className="cursor-pointer"
                                  type="submit"
                                >
                                  {isSubmittingNewDate ? (
                                    <span className="animate-pulse">
                                      Saving...
                                    </span>
                                  ) : (
                                    "Confirm"
                                  )}
                                </Button>
                              </DialogFooter>
                            </form>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>
                  </div>

                  {/* {associatedCases.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className='font-lora'>Associated Projects</CardTitle>
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
                          <CardTitle className="font-lora">
                            Saved Search Results
                          </CardTitle>
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
                          <CardTitle className="font-lora">
                            Case Comments
                          </CardTitle>
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
                      <CardTitle className="font-lora">Case Sources</CardTitle>
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
                      <CardTitle className="font-lora">Case Timeline</CardTitle>
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
                      <CardTitle className="font-lora">
                        Billing Information
                      </CardTitle>
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
            court: projectDetails.court || "",
            judge: projectDetails.judge || "",
            description: projectDetails.description || "",
          }}
          refreshPage={fetchProject}
        />
      )}
    </>
  );
}
