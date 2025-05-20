"use client";

import { Calendar } from "lucide-react";
import Link from "next/link";
import dayjs from "dayjs";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserData } from "./providers/UserDataProvider";

export default function ProjectCard({
  caseItem,
}: {
  caseItem: NonNullable<UserData>["projects"][0];
}) {
  return (
    <Link href={`/project/${caseItem.id}`} prefetch={false}>
      <Card className="hover:bg-secondary hover:shadow-md transition ease-in-out duration-200 cursor-pointer">
        <CardHeader className="">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="font-lora">{caseItem.name}</CardTitle>
              {(caseItem.client || caseItem.caseNumber) && (
                <CardDescription className="mt-1">
                  {caseItem.client}{" "}
                  {caseItem.caseNumber && `• ${caseItem.caseNumber}`}
                  {caseItem.caseType && (
                    <div className="flex w-full items-center justify-between">
                      <div className="text-sm text-muted-foreground">
                        {caseItem.caseType}
                      </div>
                    </div>
                  )}
                </CardDescription>
              )}
            </div>
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
          </div>
        </CardHeader>
        <CardContent className="">
          {caseItem.description && (
            <p className="text-sm text-muted-foreground">
              {caseItem.description.length > 100
                ? `${caseItem.description.slice(0, 100)}...`
                : caseItem.description}
            </p>
          )}
        </CardContent>
        <CardFooter className="">
          {caseItem.projectDates[0] && (
            <div className="mt-2 text-sm w-full">
              <div className="font-medium flex">
                <Calendar className="h-4 w-4 mr-2 mt-0.5" />
                <div>
                  <p>
                    {caseItem.projectDates[0].name}:{" "}
                    {dayjs(caseItem.projectDates[0].date).format(
                      "MMM DD, YYYY"
                    )}
                  </p>
                  {caseItem.projectDates.length > 1 && (
                    <p className="text-muted-foreground">
                      {" "}
                      +{caseItem.projectDates.length - 1} upcoming dates
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}
        </CardFooter>
      </Card>
    </Link>
  );
}
