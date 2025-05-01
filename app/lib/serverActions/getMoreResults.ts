import { Message } from "ai";
import { findRelevantContent } from "./getResultsFromAstro";
import { FilterOption } from "@/page";

type GetMoreResultsProp = {
  chatId: string;
  messages: Array<Omit<Message, "id">>;
  skip: number;
  filters?: FilterOption[];
  limit?: number;
};

export async function getMoreResults({
  chatId,
  messages,
  filters = [],
  skip,
  limit = 20,
}: GetMoreResultsProp) {
  const messageToStore = messages[messages.length - 1];

  console.log("Chat Id: ", chatId);

  const contextWindow =
    messages.length == 1
      ? messageToStore.content
      : messages
          .slice(-5)
          .map((msg) => `[${msg.role.toUpperCase()} MESSAGE]: ${msg.content}`)
          .join();

  const retrievedExcerpts = await findRelevantContent(
    contextWindow,
    filters,
    limit,
    skip
  );

  const docIdSet = new Set<string>();
  for (const excerpt of retrievedExcerpts) {
    if (docIdSet.has(excerpt.doc_id)) continue;
    docIdSet.add(excerpt.doc_id);
  }

  // Create a doc object but keep the excerpts empty
  //   const docObject: {
  //     [key: string]: {
  //       doc_id: string;
  //       citation: string;
  //       jurisdiction: string;
  //       type: string;
  //       source: string;
  //       date: string | undefined;
  //       url: string;
  //       similarityScore: number | null;
  //       $vectorize: string;
  //       excerpts: Excerpt[];
  //     };
  //   } = {};
}
