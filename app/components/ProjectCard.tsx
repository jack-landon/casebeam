"use client";

import { Calendar, Clock, MoreHorizontal } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";

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
import { Badge } from "@/components/ui/badge";
import { SelectProject } from "@/lib/db/schema";

function getTimeAgo(timestamp: number) {
  const now = Date.now();
  const diff = now - timestamp;

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) return `${days}d ago`;
  if (hours > 0) return `${hours}h ago`;
  if (minutes > 0) return `${minutes}m ago`;
  return "Just now";
}

export default function ProjectCard({ caseItem }: { caseItem: SelectProject }) {
  return (
    <Link href={`/project/${caseItem.id}`} prefetch={false}>
      <Card className="hover:bg-secondary hover:shadow-md transition ease-in-out duration-200 cursor-pointer">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>{caseItem.name}</CardTitle>
              <CardDescription className="mt-1">
                {caseItem.caseNumber} • {caseItem.client}
              </CardDescription>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <MoreHorizontal className="h-4 w-4" />
                  <span className="sr-only">Open menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View details</DropdownMenuItem>
                <DropdownMenuItem>Edit case</DropdownMenuItem>
                <DropdownMenuItem>View documents</DropdownMenuItem>
                <DropdownMenuItem>View timeline</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>
        <CardContent className="pb-2">
          <div className="flex items-center gap-4 text-sm">
            <div className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
              <span>{dayjs(caseItem.filingDate).format("MMM DD, YYYY")}</span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {caseItem.updateAt && (
                <span>{getTimeAgo(dayjs(caseItem.updateAt).unix())}</span>
              )}
            </div>
          </div>
          {/* {caseItem.nextDeadline && (
            <div className="mt-2 text-sm">
              <span className="font-medium">Next Deadline:</span>{" "}
              {dayjs(caseItem.nextDeadline).format("MMM DD, YYYY")}
            </div>
          )} */}
        </CardContent>
        <CardFooter className="pt-2">
          <div className="flex w-full items-center justify-between">
            <Badge
              variant={
                caseItem.status === "active"
                  ? "default"
                  : caseItem.status === "pending"
                  ? "outline"
                  : "secondary"
              }
            >
              {caseItem.status}
            </Badge>
            <div className="text-sm text-muted-foreground">
              {caseItem.caseType}
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
