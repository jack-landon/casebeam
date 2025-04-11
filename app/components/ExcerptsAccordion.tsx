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
};

export function ExcerptsAccordion({ excerpts }: ExcerptsAccordionProps) {
  const parsedExcerpts =
    typeof excerpts === "string"
      ? (JSON.parse(excerpts) as InsertSearchResultWithExcerpts["excerpts"])
      : excerpts;

  return (
    <Accordion type="single" collapsible className="w-full">
      {parsedExcerpts.map((excerpt, i) => (
        <AccordionItem key={i} value={excerpt.title}>
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
                <h3 className="font-semibold mb-1">Case Name</h3>
                <p>{excerpt.caseName}</p>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Excerpt</h3>
                <blockquote className="border-l-2 border-muted-foreground/30 pl-4 italic">
                  {excerpt.content}
                </blockquote>
              </div>
              <div className="my-2">
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
                    View Excert <ExternalLink className="ml-1 h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
