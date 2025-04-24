"use server";
import { connectToDatabase, Document } from "./datastax";
import { Filter, FoundDoc } from "@datastax/astra-db-ts";
import { FilterOption } from "@/page";

export async function findRelevantContent(
  userQuery: string,
  filters: FilterOption[] = [],
  limit: number = 20,
  skip: number = 0
) {
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

  const formattedFilters: Filter<Document> = {
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

  const relevantDocuments = collection.find(formattedFilters, {
    sort: { $vectorize: userQuery },
    limit,
    skip,
    projection: {
      _id: true,
      doc_id: true,
      citation: true,
      jurisdiction: true,
      type: true,
      source: true,
      date: true,
      url: true,
      $vectorize: true,
    },
    includeSimilarity: true,
  });

  const returnedDocuments: Pick<
    FoundDoc<Document>,
    | "_id"
    | "doc_id"
    | "citation"
    | "jurisdiction"
    | "type"
    | "source"
    | "date"
    | "url"
    | "$vectorize"
    | "$similarity"
  >[] = [];

  for await (const document of relevantDocuments) {
    returnedDocuments.push(document);
  }

  return returnedDocuments;
}
