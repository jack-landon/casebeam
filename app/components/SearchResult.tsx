import { SearchResultType } from "@/page";

export default function SearchResult({
  heading,
  subheading,
  details,
  source,
  getArticleDetails,
  setCurrentReference,
}: SearchResultType & {
  getArticleDetails: (details: string) => void;
  setCurrentReference: (
    reference: { text: string; url: string } | null
  ) => void;
}) {
  return (
    <div
      onClick={() => {
        getArticleDetails(details);
        if (!source) return;
        setCurrentReference({
          text: source.title ?? "Source",
          url: source.url,
        });
      }}
      className="group hover:bg-gray-800 px-3 py-6 cursor-pointer"
    >
      <h2 className="text-xl font-bold group-hover:underline">{heading}</h2>
      <p>{subheading}</p>

      {/* <div className="mt-2">
        {source && (
          <Button asChild size="sm" className="cursor-pointer">
            <Link href={source?.url ?? "#"} target="_blank">
              Visit {source?.title ?? "Source"}
            </Link>
          </Button>
        )}
      </div> */}
    </div>
  );
}
