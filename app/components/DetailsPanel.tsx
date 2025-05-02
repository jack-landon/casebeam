import { motion } from "motion/react";
import { Button } from "./ui/button";
import { View } from "@/page";
import Link from "next/link";
import { ExcerptsAccordion } from "./ExcerptsAccordion";
import { Separator } from "./ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { useCurrentArticle } from "./contexts/CurrentArticleContext";
import Loader from "./Loader";
import { useEffect, useRef } from "react";

type DetailsPanelProps = {
  view: View;
};

export default function DetailsPanel({ view }: DetailsPanelProps) {
  const { currentArticle, setCurrentArticle } = useCurrentArticle();
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentArticle]);

  if (currentArticle) {
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
            onClick={() => {
              setCurrentArticle(null);
            }}
            variant="outline"
            size="sm"
            className="cursor-pointer"
          >
            Hide Panel
          </Button>
        </div>

        {currentArticle == "loading" ? (
          <div className="backdrop-blur-xs h-full flex flex-col items-center justify-center">
            <Loader className="m-4" size="lg" />
            <p className="text-lg font-bold animate-pulse">
              Loading Document Details
            </p>
          </div>
        ) : (
          <div
            ref={scrollContainerRef}
            className="relative flex-1 overflow-y-auto py-4"
          >
            <Card className="w-full m-0 p-0 border-none">
              <CardHeader>
                <CardTitle className="text-xl font-bold">
                  {currentArticle.docTitle}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">In A Nutshell</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentArticle.shortSummary}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2">How It Is Relevant</h4>
                  <p className="text-sm text-muted-foreground">
                    {currentArticle.extendedSummary}
                  </p>
                </div>

                <Separator className="my-4" />

                <div>
                  <h3 className="text-lg font-bold">Relevant Excerpts</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Click on the title to expand the excerpt
                  </p>

                  <ExcerptsAccordion excerpts={currentArticle.excerpts} />
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Fixed Bottom Bar */}
        <div className="border-t p-4 mt-auto flex justify-end gap-2">
          <Button variant="outline" size="sm" className="cursor-pointer">
            Download PDF
          </Button>
          {currentArticle != "loading" && currentArticle?.url && (
            <Button asChild size="sm" className="cursor-pointer">
              <Link href={currentArticle.url ?? "#"} target="_blank">
                View Full Document
              </Link>
            </Button>
          )}
        </div>
      </motion.div>
    );
  }
}
