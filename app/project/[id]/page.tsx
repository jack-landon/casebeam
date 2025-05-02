"use client";

import { use, useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  Calendar,
  Download,
  Link2,
  MoreHorizontal,
  Paperclip,
  Plus,
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
import { useUser } from "@clerk/nextjs";
import { SelectProject, SelectSearchResult } from "@/lib/db/schema";
import { getProjectByIdFromDb } from "@/lib/actions";
import { Skeleton } from "@/components/ui/skeleton";
import { ExcerptsAccordion } from "@/components/ExcerptsAccordion";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function ProjectPage({ params }: PageProps) {
  const { user } = useUser();
  const [newNote, setNewNote] = useState("");
  const resolvedParams = use(params);
  const [project, setProject] = useState<SelectProject | null>(null);
  const [searchResults, setSearchResults] = useState<SelectSearchResult[]>([]);

  const fetchProject = useCallback(async () => {
    const { data } = await getProjectByIdFromDb(resolvedParams.id);
    if (!data) return;
    setProject(data.project);
    setSearchResults(data.searchResults);
  }, [resolvedParams.id]);

  useEffect(() => {
    if (!user) return;
    fetchProject();
  }, [user, fetchProject]);

  // Find associated cases
  const associatedCases = !project
    ? []
    : cases.filter(
        (c) =>
          c.id !== project.id &&
          (c.client === project.client || c.relatedCases?.includes(project.id))
      );

  const handleAddNote = () => {
    if (newNote.trim()) {
      // In a real app, you would add the note to the database
      alert("Note added: " + newNote);
      setNewNote("");
    }
  };

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto max-w-6xl py-6 px-4">
        {project ? (
          <>
            <div className="mb-6 flex items-center">
              <Button variant="ghost" size="icon" asChild className="mr-2">
                <Link href="/dashboard?tab=projects" prefetch={false}>
                  <ArrowLeft className="h-4 w-4" />
                  <span className="sr-only">Back</span>
                </Link>
              </Button>
              <div>
                <h1 className="text-2xl font-bold">{project.name}</h1>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>{project.caseNumber}</span>
                  <span>•</span>
                  <span>{project.caseType}</span>
                  <Badge
                    variant={
                      project.status === "Active"
                        ? "default"
                        : project.status === "Pending"
                        ? "outline"
                        : "secondary"
                    }
                    className="ml-2"
                  >
                    {project.status}
                  </Badge>
                </div>
              </div>
              <div className="ml-auto flex gap-2">
                <Button variant="outline" className="gap-1">
                  <Download className="h-4 w-4" />
                  <span>Export</span>
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button>
                      <span>Actions</span>
                      <MoreHorizontal className="ml-2 h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem>Edit Case</DropdownMenuItem>
                    <DropdownMenuItem>Add Document</DropdownMenuItem>
                    <DropdownMenuItem>Schedule Hearing</DropdownMenuItem>
                    <DropdownMenuItem>Close Case</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            <Tabs defaultValue="summary">
              <TabsList className="mb-4">
                <TabsTrigger value="summary">Summary</TabsTrigger>
                {/* <TabsTrigger value="documents">Documents</TabsTrigger>
                <TabsTrigger value="timeline">Timeline</TabsTrigger>
                <TabsTrigger value="billing">Billing</TabsTrigger> */}
              </TabsList>

              <TabsContent value="summary" className="space-y-6">
                <div className="grid gap-6 md:grid-cols-2">
                  <Card>
                    <CardHeader>
                      <CardTitle>Case Details</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Client
                          </div>
                          <div>{project.client}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Case Type
                          </div>
                          <div>{project.caseType}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Filing Date
                          </div>
                          <div>
                            {dayjs(project.filingDate).format("MMM DD, YYYY")}
                          </div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Status
                          </div>
                          <div>{project.status}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Court
                          </div>
                          <div>{project.court || "Superior Court"}</div>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-muted-foreground">
                            Judge
                          </div>
                          <div>{project.judge || "Hon. Sarah Williams"}</div>
                        </div>
                      </div>

                      <Separator />

                      <div>
                        <div className="mb-2 text-sm font-medium text-muted-foreground">
                          Description
                        </div>
                        <div className="text-sm">
                          {project.description ||
                            "This case involves a contract dispute between the plaintiff and defendant regarding terms of service and delivery schedules. The plaintiff alleges breach of contract and is seeking damages."}
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
                        {project.nextDeadline && (
                          <div className="flex items-start gap-3 rounded-md border p-3">
                            <Calendar className="mt-0.5 h-5 w-5 text-muted-foreground" />
                            <div>
                              <div className="font-medium">Next Deadline</div>
                              <div className="text-sm text-muted-foreground">
                                {dayjs(project.nextDeadline).format(
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
                                new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
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
                                new Date(Date.now() + 60 * 24 * 60 * 60 * 1000)
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

                {associatedCases.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Associated Cases</CardTitle>
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
                )}

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
                      {searchResults.map((result) => (
                        <Card key={result.id}>
                          <CardHeader className="flex flex-row items-center">
                            <div>
                              <CardTitle className="text-xl underline mb-1">
                                {result.docTitle}
                              </CardTitle>
                              <CardDescription>
                                {result.docTitle} -{" "}
                                {dayjs(result.createdAt).format("MMM DD, YYYY")}{" "}
                                at {dayjs(result.createdAt).format("h:mm A")}
                              </CardDescription>

                              <div className="flex flex-wrap gap-1 mt-1">
                                <Badge
                                  // variant="outline"
                                  className="mr-2 mt-2"
                                >
                                  {result.type}
                                </Badge>
                                <Badge
                                  // variant="outline"
                                  className="mr-2 mt-2"
                                >
                                  {result.jurisdiction}
                                </Badge>
                                <Badge
                                  // variant="outline"
                                  className="mr-2 mt-2"
                                >
                                  {result.source}
                                </Badge>
                              </div>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-6">
                            <div>
                              <h3 className="text-lg font-semibold">
                                Case Summary
                              </h3>
                              <p className="text-sm text-muted-foreground">
                                {result.shortSummary}
                              </p>
                            </div>

                            <div>
                              <h3 className="text-lg font-semibold">{`How It's Relevant`}</h3>
                              <p className="text-sm text-muted-foreground">
                                {result.extendedSummary}
                              </p>
                            </div>

                            {result.excerpts && (
                              <div>
                                <h3 className="text-lg font-semibold">
                                  Excerpts
                                </h3>
                                <ExcerptsAccordion excerpts={result.excerpts} />
                              </div>
                            )}
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="flex flex-row items-center">
                    <div>
                      <CardTitle>Case Notes</CardTitle>
                      <CardDescription>
                        Notes and updates about this case
                      </CardDescription>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="ml-auto gap-1"
                    >
                      <Plus className="h-4 w-4" />
                      <span>Add Note</span>
                    </Button>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {notes
                        .filter((note) => note.caseId === project.id)
                        .map((note) => (
                          <div key={note.id} className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Avatar className="h-8 w-8">
                                <AvatarImage
                                  src={note.author.avatar}
                                  alt={note.author.name}
                                />
                                <AvatarFallback>
                                  {getInitials(note.author.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">
                                  {note.author.name}
                                </div>
                                <div className="text-xs text-muted-foreground">
                                  {dayjs(note.timestamp).format("MMM DD, YYYY")}{" "}
                                  at {dayjs(note.timestamp).format("h:mm A")}
                                </div>
                              </div>
                            </div>
                            <div className="text-sm">{note.content}</div>
                            {note.attachments && (
                              <div className="flex items-center gap-2 rounded-md bg-muted p-2 text-sm">
                                <Paperclip className="h-4 w-4" />
                                <span>{note.attachments}</span>
                              </div>
                            )}
                          </div>
                        ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <div className="flex w-full gap-2">
                      <Textarea
                        placeholder="Add a note..."
                        className="min-h-[80px]"
                        value={newNote}
                        onChange={(e) => setNewNote(e.target.value)}
                      />
                      <Button className="mt-auto" onClick={handleAddNote}>
                        <Send className="h-4 w-4" />
                        <span className="sr-only">Send</span>
                      </Button>
                    </div>
                  </CardFooter>
                </Card>
              </TabsContent>

              <TabsContent value="documents">
                <Card>
                  <CardHeader>
                    <CardTitle>Case Documents</CardTitle>
                    <CardDescription>
                      All documents related to this case
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center text-muted-foreground py-8">
                      Documents tab content would go here
                    </div>
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
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .join("")
    .toUpperCase();
}

// Sample data
const cases = [
  {
    id: 1,
    title: "Smith v. Johnson",
    caseNumber: "CV-2023-1234",
    client: "Smith Industries",
    caseType: "Civil Litigation",
    status: "Active",
    filingDate: "2023-06-15",
    updatedAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
    nextDeadline: "2025-04-20",
    court: "Northern District Court",
    judge: "Hon. Robert Thompson",
    description:
      "Contract dispute regarding manufacturing equipment delivery and installation. Client alleges breach of contract and seeks damages of $2.3M plus legal fees.",
    relatedCases: [3],
  },
  {
    id: 2,
    title: "Estate of Williams",
    caseNumber: "PR-2023-5678",
    client: "Williams Family",
    caseType: "Probate",
    status: "Pending",
    filingDate: "2023-08-22",
    updatedAt: Date.now() - 5 * 24 * 60 * 60 * 1000,
    nextDeadline: "2025-05-15",
    court: "County Probate Court",
    judge: "Hon. Maria Garcia",
    description:
      "Probate proceedings for the estate of Thomas Williams. Multiple beneficiaries with contested will provisions regarding business assets.",
  },
  {
    id: 3,
    title: "Davis Divorce",
    caseNumber: "FA-2023-9012",
    client: "Michael Davis",
    caseType: "Family Law",
    status: "Active",
    filingDate: "2023-09-10",
    updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
    nextDeadline: "2025-04-12",
    court: "Family Court Division",
    judge: "Hon. Sarah Chen",
    description:
      "Divorce proceedings with contested custody and asset division. Client seeks primary custody of two minor children and equitable distribution of marital assets.",
    relatedCases: [1],
  },
  {
    id: 4,
    title: "Thompson LLC Formation",
    caseNumber: "BL-2023-3456",
    client: "Thompson Ventures",
    caseType: "Business Law",
    status: "Closed",
    filingDate: "2023-05-05",
    updatedAt: Date.now() - 30 * 24 * 60 * 60 * 1000,
    nextDeadline: null,
    court: null,
    judge: null,
    description:
      "Formation of LLC for new technology startup. Includes operating agreement, ownership structure, and initial capital contributions.",
  },
  {
    id: 5,
    title: "Martinez IP Dispute",
    caseNumber: "IP-2023-7890",
    client: "Martinez Tech",
    caseType: "Intellectual Property",
    status: "Active",
    filingDate: "2023-07-18",
    updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
    nextDeadline: "2025-06-01",
    court: "Federal District Court",
    judge: "Hon. James Wilson",
    description:
      "Patent infringement claim against competitor. Client alleges unauthorized use of patented technology in consumer electronics products.",
  },
  {
    id: 6,
    title: "Wilson Real Estate Closing",
    caseNumber: "RE-2023-2468",
    client: "Wilson Properties",
    caseType: "Real Estate",
    status: "Pending",
    filingDate: "2023-10-01",
    updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
    nextDeadline: "2025-04-30",
    court: null,
    judge: null,
    description:
      "Commercial real estate acquisition of office building. Transaction value of $4.2M with financing contingencies and environmental concerns.",
  },
  {
    id: 7,
    title: "Smith v. Metro Hospital",
    caseNumber: "ML-2023-8765",
    client: "Smith Industries",
    caseType: "Medical Litigation",
    status: "Active",
    filingDate: "2023-11-15",
    updatedAt: Date.now() - 10 * 24 * 60 * 60 * 1000,
    nextDeadline: "2025-07-10",
    court: "Superior Court",
    judge: "Hon. Elizabeth Brown",
    description:
      "Medical malpractice claim against hospital for employee injury during company wellness program. Seeking damages for medical expenses and lost wages.",
  },
];

const notes = [
  {
    id: 1,
    caseId: 1,
    author: {
      name: "Jane Doe",
      avatar: "/placeholder-user.jpg",
    },
    timestamp: Date.now() - 7 * 24 * 60 * 60 * 1000,
    content:
      "Initial client consultation completed. Client provided all requested documentation regarding the contract dispute. We discussed potential settlement options and litigation strategy.",
    attachments: null,
  },
  {
    id: 2,
    caseId: 1,
    author: {
      name: "John Smith",
      avatar: "/placeholder-user.jpg",
    },
    timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
    content:
      "Drafted and filed initial complaint with the court. Served defendant with summons and complaint via certified mail. Awaiting confirmation of receipt.",
    attachments: "Complaint.pdf, Summons.pdf",
  },
  {
    id: 3,
    caseId: 1,
    author: {
      name: "Jane Doe",
      avatar: "/placeholder-user.jpg",
    },
    timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
    content:
      "Received notice from opposing counsel that they will be representing Johnson Manufacturing. They've requested a 15-day extension to respond to the complaint. After discussing with client, we've agreed to the extension.",
    attachments: "Extension_Request.pdf",
  },
  {
    id: 4,
    caseId: 3,
    author: {
      name: "Michael Chen",
      avatar: "/placeholder-user.jpg",
    },
    timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
    content:
      "Prepared financial disclosure documents for client review. Scheduled meeting with client for next Tuesday to review and finalize before submission to the court.",
    attachments: null,
  },
  {
    id: 5,
    caseId: 3,
    author: {
      name: "Sarah Johnson",
      avatar: "/placeholder-user.jpg",
    },
    timestamp: Date.now() - 1 * 24 * 60 * 60 * 1000,
    content:
      "Opposing counsel has proposed a temporary custody arrangement. I've reviewed the proposal and have concerns about the weekend schedule. Will discuss with client at our meeting.",
    attachments: "Proposed_Custody_Schedule.pdf",
  },
];
