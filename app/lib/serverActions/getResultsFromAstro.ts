"use server";
import { cohere } from "@ai-sdk/cohere";
import { connectToDatabase, Document } from "./datastax";
import { embed } from "ai";
import { Filter, FoundDoc } from "@datastax/astra-db-ts";
import { FilterOption } from "@/page";

async function getEmbeddings(query: string) {
  const { embedding } = await embed({
    model: cohere.embedding("embed-english-light-v3.0"),
    value: query,
  });

  return embedding;

  // const response = await fetch(
  //   // "https://router.huggingface.co/hf-inference/pipeline/sentence-similarity/sentence-transformers/all-MiniLM-L6-v2",
  //   "https://api-inference.huggingface.co/models/sentence-transformers/all-MiniLM-L6-v2",
  //   {
  //     headers: {
  //       Authorization: `Bearer ${process.env.HUGGINGFACE_KEY}`,
  //       "Content-Type": "application/json",
  //     },
  //     method: "POST",
  //     // body: JSON.stringify(data),
  //     body: JSON.stringify({
  //       inputs: {
  //         source_sentence: query,
  //       },
  //     }),
  //   }
  // );
  // const result = await response.json();
  // return result;
}

export async function getResponse() {
  const singleQuery =
    "what was the case where the mother had come to the attention of the Chinese authorities?";
  const multiQuery = "What are some cases about nature?";
  const singleVectorizedQuery = await getEmbeddings(singleQuery);
  const multiVectorizedQuery = await getEmbeddings(
    "What are some cases about nature?"
  );

  console.log("Single Vectorized query:", singleVectorizedQuery);
  console.log("Multi Vectorized query:", multiVectorizedQuery);

  const database = connectToDatabase();
  const collection = database.collection<Document>(
    process.env.ASTRA_DB_COLLECTION as string
  );

  // Find documents that match a filter
  console.log("Finding a case where the juridiction is tasmania...");

  const ratingCursor = collection.find(
    { jurisdiction: { $eq: "tasmania" } },
    { limit: 10 }
  );

  for await (const document of ratingCursor) {
    console.log(
      `The jurisdiction of ${document["citation"]} is in ${document["jurisdiction"]}`
    );
  }

  // Perform a vector search to find the closest match to a search string
  console.log(`Using vector search to find ${singleQuery}`);

  const singleVectorMatch = await collection.findOne(
    {},
    { sort: { $vector: singleVectorizedQuery } }
  );

  console.log(
    `${
      !singleVectorMatch ? "None" : singleVectorMatch["citation"]
    } is the right case`
  );

  // Combine a filter, vector search, and projection to find the 3 cases in
  // tasmania that are the closest matches to a search string,
  // and just return the citation and jurisdiction
  console.log(
    `Using filters and vector search to find ${multiQuery} In Tasmania...`
  );

  const vectorCursor = collection.find(
    { jurisdiction: { $eq: "tasmania" } },
    {
      sort: { $vector: multiVectorizedQuery },
      limit: 3,
      projection: { citation: true, jurisdiction: true },
    }
  );

  for await (const document of vectorCursor) {
    console.log(document);
  }

  const returnedDocuments = await vectorCursor.toArray();
  return returnedDocuments;
}

export async function findRelevantContent(
  userQuery: string,
  filters: FilterOption[] = []
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
      { jurisdiction: { $in: jurisdictionFilters } },
      { type: { $in: typeFilters } },
      { source: { $in: sourceFilters } },
    ],
  };

  const relevantDocuments = collection.find(formattedFilters, {
    sort: { $vectorize: userQuery },
    limit: 5,
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
    console.log(document);
    returnedDocuments.push(document);
  }

  return returnedDocuments;
}
