import { motion } from "motion/react";
import { Button } from "./ui/button";
import { View } from "@/page";
import Link from "next/link";
import Loader from "./Loader";
import { ExcerptsAccordion } from "./ExcerptsAccordion";
import { Separator } from "./ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { InsertSearchResultWithExcerpts } from "@/lib/types";

type DetailsPanelProps = {
  currentDetails?: InsertSearchResultWithExcerpts;
  isGettingCurrentDetails: boolean;
  hidePanel: (panel: View) => void;
  view: View;
};

export default function DetailsPanel({
  currentDetails,
  isGettingCurrentDetails,
  hidePanel,
  view,
}: DetailsPanelProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      custom={view}
      className={`flex flex-col w-full h-full overflow-hidden border`}
    >
      {/* Header */}
      <div className="p-4 border-b flex items-center justify-between">
        <p className="text-3xl font-bold group-hover:underline">
          Document Details
        </p>

        <Button
          onClick={() => hidePanel("details")}
          variant="outline"
          size="sm"
          className="cursor-pointer"
        >
          Hide Panel
        </Button>
      </div>

      {/* Scrollable Content */}
      <div className="relative flex-1 overflow-y-auto py-4">
        {isGettingCurrentDetails && (
          <div className="absolute inset-0 z-50 bg-secondary/30 backdrop-blur-xs">
            <div
              role="status"
              className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center"
            >
              <Loader />
              <span className="font-bold mt-2 animate-pulse">Loading</span>
            </div>
          </div>
        )}

        {currentDetails && (
          <>
            <Card className="w-full m-0 p-0 border-none">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  {currentDetails.title}
                </CardTitle>
                <h3 className="text-lg font-semibold text-muted-foreground">
                  {currentDetails.docTitle}
                </h3>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">In A Nutshell</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentDetails.docSummary}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">How It Is Relevant</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentDetails.relevanceSummary}
                  </p>
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="text-lg font-bold">Relavent Excerpts</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Here are some related cases that might be of interest:
                  </p>

                  <ExcerptsAccordion excerpts={currentDetails.excerpts} />
                </div>
              </CardContent>
            </Card>
          </>
        )}
      </div>

      {/* Fixed Bottom Bar */}
      <div className="border-t p-4 mt-auto flex justify-end gap-2">
        <Button variant="outline" size="sm" className="cursor-pointer">
          Download PDF
        </Button>
        {currentDetails?.url && (
          <Button asChild size="sm" className="cursor-pointer">
            <Link href={currentDetails.url ?? "#"} target="_blank">
              View Full Document
            </Link>
          </Button>
        )}
      </div>
    </motion.div>
  );
}
