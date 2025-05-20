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
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/components/ui/hover-card";
import { capitalizeFirstLetter } from "@/lib/utils";

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
              {capitalizeFirstLetter(caseItem.status)}
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
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <p className="text-muted-foreground hover:underline">
                          {" "}
                          +{caseItem.projectDates.length - 1} other upcoming{" "}
                          {caseItem.projectDates.length > 2 ? "dates" : "date"}
                        </p>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div>
                          <h4 className="font-medium leading-none underline mb-3">
                            Upcoming Dates
                          </h4>
                          <div className="">
                            {caseItem.projectDates
                              .sort(
                                (a, b) =>
                                  dayjs(a.date).unix() - dayjs(b.date).unix()
                              )
                              .map((date) => (
                                <div key={date.id}>
                                  <span className="font-medium">
                                    {date.name}:{" "}
                                  </span>
                                  <span className="font-normal text-muted-foreground">
                                    {dayjs(date.date).format("ddd DD MMM YYYY")}
                                  </span>
                                </div>
                              ))}
                          </div>
                        </div>
                      </HoverCardContent>
                    </HoverCard>
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
