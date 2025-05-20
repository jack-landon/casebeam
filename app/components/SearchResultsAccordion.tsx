import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { CardContent, CardDescription, CardTitle } from "./ui/card";
import { Badge } from "./ui/badge";
import { getProjectDetails } from "@/lib/db/queries/query";
import { ExcerptsAccordion } from "./ExcerptsAccordion";
import { BookText, Landmark, MapPin } from "lucide-react";

type Props = {
  searchResults: NonNullable<
    Awaited<ReturnType<typeof getProjectDetails>>
  >["searchResultProjects"];
};

export default function SearchResultsAccordion({ searchResults }: Props) {
  return (
    <Accordion type="multiple" className="w-full">
      {searchResults.map((result, i) => (
        <AccordionItem key={`${result.id}-${i}`} value={`${result.id}-${i}`}>
          <AccordionTrigger className="cursor-pointer group">
            <div>
              <CardTitle className="text-xl group-hover:underline mb-1 font-lora">
                {result.searchResult.docTitle}
              </CardTitle>
              <CardDescription className="hover:no-underline">
                {result.searchResult.shortSummary} -{" "}
              </CardDescription>

              <div className="flex flex-wrap gap-2 mt-3">
                <Badge>
                  <BookText className="h-3 w-3 mr-2" />
                  {result.searchResult.type}
                </Badge>
                <Badge>
                  <MapPin className="h-3 w-3 mr-2" />{" "}
                  {result.searchResult.jurisdiction}
                </Badge>
                <Badge>
                  <Landmark className="h-3 w-3 mr-2" />{" "}
                  {result.searchResult.source}
                </Badge>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold">Case Summary</h3>
                <p className="text-sm text-muted-foreground">
                  {result.searchResult.shortSummary}
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold">{`How It's Relevant`}</h3>
                <p className="text-sm text-muted-foreground">
                  {result.searchResult.extendedSummary}
                </p>
              </div>

              {result.searchResult.excerpts && (
                <div>
                  <h3 className="text-lg font-semibold">Excerpts</h3>
                  <ExcerptsAccordion excerpts={result.searchResult.excerpts} />
                </div>
              )}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
