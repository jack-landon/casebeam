"use client";
import Link from "next/link";
import { ExternalLink } from "lucide-react";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { InsertSearchResultWithExcerpts } from "@/lib/types";

type ExcerptsAccordionProps = {
  excerpts: InsertSearchResultWithExcerpts["excerpts"] | string;
  isDownloadable?: boolean;
};

export function ExcerptsAccordion({
  excerpts,
  isDownloadable = false,
}: ExcerptsAccordionProps) {
  const parsedExcerpts =
    typeof excerpts === "string"
      ? (JSON.parse(excerpts) as InsertSearchResultWithExcerpts["excerpts"])
      : excerpts;

  return (
    <Accordion
      type="multiple"
      defaultValue={parsedExcerpts.map((_, key) => key.toString())}
      className="w-full"
    >
      {parsedExcerpts.map((excerpt, i) => (
        <AccordionItem key={i} value={i.toString()}>
          <AccordionTrigger
            className={`flex justify-between text-left rounded-none no-underline data-[state=open]:underline`}
          >
            <div className="flex-1 pr-4 cursor-pointer hover:underline">
              {excerpt.title}
            </div>
          </AccordionTrigger>
          <AccordionContent className="bg-secondary/50 p-1">
            <div className="space-y-4 pt-2 px-1">
              <div>
                <h3 className="font-semibold mb-1 underline">Document Name</h3>
                <p>{excerpt.caseName}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1 underline">Excerpt</h3>
                <blockquote className="border-l-2 border-muted-foreground/30 pl-4 leading-loose">
                  {excerpt.content}
                </blockquote>
              </div>
              <div className="my-2">
                {excerpt.url && (
                  <Button
                    size="sm"
                    className="ml-auto mr-4 shrink-0 cursor-pointer"
                    asChild
                    onClick={(e) => e.stopPropagation()}
                  >
                    <Link
                      href={excerpt.url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {isDownloadable ? "Download" : "View"} Excerpt{" "}
                      <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                )}
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
