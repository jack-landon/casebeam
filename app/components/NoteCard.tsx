"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { UserData } from "./providers/UserDataProvider";

type Props = {
  note: NonNullable<UserData>["notes"][0];
};

type ContentNode = {
  type: string;
  text?: string;
  content?: ContentNode[];
};

export default function NoteCard({ note }: Props) {
  const parsedContent = JSON.parse(note.content) as {
    type: "doc";
    content?: Array<{
      type: string;
      content: Array<{
        type: string;
        text?: string;
        content?: Array<{
          type: string;
          content: Array<{
            type: string;
            text?: string;
          }>;
        }>;
      }>;
    }>;
  };

  const getAllText = (
    content: ContentNode | ContentNode[] | undefined
  ): string[] => {
    if (!content) return [];

    if (Array.isArray(content)) {
      return content.flatMap((item) => getAllText(item));
    }

    if (content.text) {
      return [content.text];
    }

    if (content.content) {
      return getAllText(content.content);
    }

    return [];
  };

  const text = getAllText(parsedContent.content).join(" ");

  const truncatedText = !text
    ? ""
    : text.length > 100
    ? `${text.slice(0, 100)}...`
    : text;

  return (
    <Link href={`/note/${note.id}`} prefetch={false}>
      <Card className="hover:bg-secondary hover:shadow-md transition ease-in-out duration-200 cursor-pointer">
        <CardHeader className="">
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="font-lora flex items-center">
                <div className={`${note.color} mr-2 h-3 w-3 rounded-full`} />
                {note.name}
              </CardTitle>
              <CardDescription className="mt-1">
                {note.projectId}
              </CardDescription>
            </div>
            <Badge variant={"default"}>Note</Badge>
          </div>
        </CardHeader>
        <CardContent className="">
          {note.content && (
            <p className="text-sm text-muted-foreground">{truncatedText}</p>
          )}
        </CardContent>
        {/* <CardFooter className="">
          {note.projectDates[0] && (
            <div className="mt-2 text-sm w-full">
              <div className="font-medium flex">
                <Calendar className="h-4 w-4 mr-2 mt-0.5" />
                <div>
                  <p>
                    {note.projectDates[0].name}:{" "}
                    {dayjs(note.projectDates[0].date).format(
                      "MMM DD, YYYY"
                    )}
                  </p>
                  {note.projectDates.length > 1 && (
                    <HoverCard>
                      <HoverCardTrigger asChild>
                        <p className="text-muted-foreground hover:underline">
                          {" "}
                          +{note.projectDates.length - 1} other upcoming{" "}
                          {note.projectDates.length > 2 ? "dates" : "date"}
                        </p>
                      </HoverCardTrigger>
                      <HoverCardContent className="w-80">
                        <div>
                          <h4 className="font-medium leading-none underline mb-3">
                            Upcoming Dates
                          </h4>
                          <div className="">
                            {note.projectDates
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
        </CardFooter> */}
      </Card>
    </Link>
  );
}
