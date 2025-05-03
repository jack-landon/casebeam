import { z } from "zod";

export const searchResultsSchema = z.array(
  z.object({
    docId: z.string(), // references the version_id going in
    shortSummary: z.string(), // From the source - Run embeddings on the entire document
    // extendedSummary: z.string(),
    // excerpts: z.array(z.string()), // how the excerpt relates to the query
    // excerpts: z.array(
    //   z.object({
    //     excerptId: z.string(), // references the embedding id going in
    //     title: z.string(), // title about how it relates to the query
    //   })
    // ),
  })
);
