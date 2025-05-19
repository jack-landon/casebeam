"use server";
import { connectToDatabase, Document } from "./datastax";
import { CollectionFilter, FoundDoc } from "@datastax/astra-db-ts";
import { FilterOption } from "@/page";

export async function findRelevantContent(
  userQuery: string,
  filters: FilterOption[] = [],
  limit: number = 20,
  skip: number = 0
) {
  console.log("Skip Count: ", skip);
  const database = connectToDatabase();
  const collection = database.collection<Document>(
    process.env.ASTRA_DB_COLLECTION as string
  );

  const jurisdictionFilters = filters
    .filter((filter) => filter.key === "jurisdictions")
    .map((filter) => filter.value);
  const typeFilters = filters
    .filter((filter) => filter.key === "types")
    .map((filter) => filter.value);
  const sourceFilters = filters
    .filter((filter) => filter.key === "sources")
    .map((filter) => filter.value);

  const formattedFilters: CollectionFilter<Document> = {
    $and: [
      ...(jurisdictionFilters.length > 0
        ? [{ jurisdiction: { $in: jurisdictionFilters } }]
        : []),
      ...(typeFilters.length > 0 ? [{ type: { $in: typeFilters } }] : []),
      ...(sourceFilters.length > 0 ? [{ source: { $in: sourceFilters } }] : []),
    ],
  };

  // If there are no filters, we can set it to an empty object
  if (formattedFilters.$and?.length === 0) delete formattedFilters.$and;

  const relevantDocuments = await collection
    .findAndRerank(formattedFilters, {
      // sort: { $hybrid: userQuery },
      sort: {
        $hybrid: {
          $vectorize: userQuery,
          $lexical: userQuery,
        },
      },
      limit,
      // skip,
      projection: {
        _id: true,
        doc_id: true,
        citation: true,
        jurisdiction: true,
        type: true,
        source: true,
        date: true,
        url: true,
        $lexical: true,
        // $vectorize: true,
      },
      includeScores: true,
      // includeSimilarity: true,
    })
    .toArray();

  const returnedDocuments: Pick<
    FoundDoc<Document> & { $similarity: number },
    | "_id"
    | "doc_id"
    | "citation"
    | "jurisdiction"
    | "type"
    | "source"
    | "date"
    | "url"
    | "$lexical"
    | "$similarity"
  >[] = [];

  const highestScore = Math.max(
    ...relevantDocuments.map((document) => document.scores.$rerank)
  );

  for (const document of relevantDocuments) {
    console.log("Document Scores: ", document.scores);
    const comparitiveScore = document.scores.$rerank / highestScore;

    returnedDocuments.push({
      ...document.document,
      $similarity: comparitiveScore,
    });
  }

  return returnedDocuments;
}
