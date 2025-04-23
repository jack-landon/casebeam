import {
  createChat,
  createMessage,
  createSearchResultsBulk,
} from "@/lib/db/queries/insert";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import {
  streamText,
  convertToCoreMessages,
  Message,
  generateText,
  generateObject,
} from "ai";
import { z } from "zod";
import { Excerpt, InsertSearchResult, SelectMessage } from "@/lib/db/schema";
import { findRelevantContent } from "@/lib/serverActions/getResultsFromAstro";
import { convertUrlToEmbeddedUrl } from "@/lib/utils";
import { FilterOption } from "@/page";

export const maxDuration = 30;

const searchResultsSchema = z.array(
  z.object({
    docId: z.string(), // references the version_id going in
    title: z.string(), // title about how it relates to the query
    docSummary: z.string(), // From the source - Run embeddings on the entire document
    relevanceSummary: z.string(),
    tags: z.array(z.string()),
    // excerpts: z.array(
    //   z.object({
    //     excerptId: z.string(), // references the embedding id going in
    //     title: z.string(), // title about how it relates to the query
    //   })
    // ),
  })
);

export async function POST(req: Request) {
  const {
    id: chatId,
    messages,
    filters,
  } = (await req.json()) as {
    messages: Array<Omit<Message, "id">>;
    id?: string;
    filters?: FilterOption[];
  };
  if (!chatId) throw new Error("Chat ID is required");
  console.log("Filters: ", filters);

  const user = await auth();
  let botMsg: SelectMessage | null = null;
  const messageToStore = messages[messages.length - 1];
  const isNewChat = messages.length == 1;

  const coreMessages = convertToCoreMessages(messages); // Get last 5 messages

  const contextWindow = coreMessages // Get last 5 messages
    .map((msg) => msg.content)
    .join("\n");

  console.log("ABout to get retrieved excerpts");

  const retrievedExcerpts = await findRelevantContent(contextWindow, filters);

  console.log("Retrieved excerpts:", retrievedExcerpts);

  const docIdSet = new Set<string>();
  for (const excerpt of retrievedExcerpts) {
    if (docIdSet.has(excerpt.doc_id)) continue;
    docIdSet.add(excerpt.doc_id);
  }
  console.log("Unique doc IDs:", docIdSet);

  // Create a doc object but keep the excerpts empty
  const docObject: {
    [key: string]: {
      doc_id: string;
      citation: string;
      jurisdiction: string;
      type: string;
      source: string;
      date: string;
      url: string;
      similarityScore: number | null;
      $vectorize: string;
      excerpts: Excerpt[];
    };
  } = {};

  for (const docId of docIdSet) {
    const excerpts = retrievedExcerpts.filter(
      (excerpt) => excerpt.doc_id === docId
    );
    if (excerpts.length == 0) continue;
    const exampleExcerpt = excerpts[0];

    docObject[docId] = {
      doc_id: exampleExcerpt.doc_id,
      citation: exampleExcerpt.citation,
      jurisdiction: exampleExcerpt.jurisdiction ?? "",
      type: exampleExcerpt.type ?? "",
      source: exampleExcerpt.source ?? "",
      date: exampleExcerpt.date ?? "",
      url: exampleExcerpt.url ?? "#",
      similarityScore: exampleExcerpt.$similarity ?? null,
      $vectorize: exampleExcerpt.$vectorize,
      excerpts: excerpts.map((excerpt) => ({
        caseName: exampleExcerpt.citation,
        title: exampleExcerpt.citation,
        content: excerpt.$vectorize,
        url: !exampleExcerpt.url
          ? null
          : convertUrlToEmbeddedUrl(
              exampleExcerpt.url,
              exampleExcerpt.$vectorize
            ),
      })),
    };
  }

  console.log("Grouped documents:", docObject);

  // const systemMessage = `You are a helpful legal assistant. You MUST follow these exact steps in order:
  //   1. First, call the getInformation tool with the user's question
  //   2. Wait for the tool to return results
  //   3. Only after receiving the tool results, provide your response using that information
  //   4. If the tool returns no results, respond with "Sorry, I don't know."
  //   5. Your response must explicitly reference information from the tool results

  //   Important: DO NOT generate any response before getting the tool results.`;

  const result = streamText({
    model: google("gemini-2.0-flash-001"),
    system: `You are a helpful legal assistant. You MUST answer the question using ONLY the information provided in this context: ${JSON.stringify(
      docObject
    )}`,
    messages: coreMessages,
    // tools: {
    //   getInformation: tool({
    //     description: `Search the knowledge base using vector similarity to find relevant legal information. This tool uses embeddings to find the most semantically similar content.`,
    //     parameters: z.object({
    //       question: z
    //         .string()
    //         .describe(
    //           coreMessages.map((msg) => msg.content).join("\n") +
    //             "\n" +
    //             messageToStore.content
    //         ),
    //     }),
    //     execute: async ({ question }) => ({
    //       sources: await findRelevantContent(question),
    //     }),
    //   }),
    // },
    onFinish: async ({
      text,
      // response,
      // toolResults,
      // stepType,
      // finishReason,
    }) => {
      // console.log("Tool step type:", stepType);
      // console.log("Tool finish reason:", finishReason);
      // if (stepType !== "continue" || finishReason !== "stop") {
      //   return;
      // }

      // If user is signed in, store the chat and message in the database
      if (isNewChat && user.userId) {
        const { text: chatTitle } = await generateText({
          model: google("gemini-2.5-pro-exp-03-25"),
          prompt: `Generate a short summary title for this chat. The title must be less than 10 words and be 1 sentence and do not end it with a period. This is the chat topic: ${messageToStore.content}`,
        });

        console.log("Chat title:", chatTitle);

        await createChat({
          id: chatId,
          userId: user.userId,
          name: chatTitle,
        });

        console.log("Chat created:", chatId);

        const userMsgDb = await createMessage({
          chatId,
          content: messageToStore.content,
          role: messageToStore.role,
        });

        console.log("User message created:", userMsgDb);

        botMsg = await createMessage({
          chatId,
          content: text,
          role: "assistant",
          responseToMsgId: userMsgDb.id,
        });

        console.log("Bot message created:", botMsg);

        // const sources = toolResults[0].result.map((source) => source.url);

        // console.log("Sources:", sources);

        console.log("Message Text:", text);

        const searchResultSummarySystemPrompt = `
          For each source in the following input, you are to create an object for each document.
          Follow the order of the input and do not change the order under any circumstance.
          The docId should be the original docId.
          The title should be a short overall explanation of how the document relates to the user query in 14 words or less.
          The docSummary should be an overall summary of the document itself.
          The relevanceSummary should extend on the title and provide a 100 - 200 word summary of how the document relates to the user query.
          The tags should be a list of short 1-2 word tags that are relevant to the document.
          The user query you are finding relevance for is this: [START OF USER MESSAGE]${
            messageToStore.content
          }.[END OF USER MESSAGE]
          The documents you are drawing this data from is here: [START OF SOURCE DATA]${JSON.stringify(
            docObject
          )}[END OF SOURCE DATA].
          Do NOT mention the term "user query" in your response.
        `;

        const { object: searchResults } = await generateObject({
          model: google("gemini-2.0-flash-001"),
          system: searchResultSummarySystemPrompt,
          messages: convertToCoreMessages(messages),
          schema: searchResultsSchema,
        });

        if (user.userId) {
          // type OldSearchResultType = {
          //   [K in keyof typeof docObject]: (typeof docObject)[K] & {
          //     docId: string;
          //     title: string;
          //     docSummary: string;
          //     relevanceSummary: string;
          //     tags: string[];
          //   };
          // };
          const newTransformedResults: InsertSearchResult[] = Object.values(
            docObject
          ).map((doc) => {
            const searchResult = searchResults.find(
              (result) =>
                result.docId.toLowerCase() === doc.doc_id.toLowerCase()
            );
            const updatedExcerpts = doc.excerpts.map((excert) => ({
              ...excert,
              title: !searchResult ? excert.title : searchResult.title,
            }));
            return {
              title: searchResult?.title ?? "",
              docTitle: doc.citation,
              docId: doc.doc_id,
              docSummary: searchResult?.docSummary ?? "",
              relevanceSummary: searchResult?.relevanceSummary ?? "",
              url: doc.url,
              similarityScore: doc.similarityScore,
              tags: JSON.stringify(searchResult?.tags ?? []),
              excerpts: JSON.stringify(updatedExcerpts),
              userId: user.userId,
              messageId: botMsg?.id,
              chatId,
            };
          });

          await createSearchResultsBulk(Object.values(newTransformedResults));
        }
      }
    },
    onError: (error) => {
      console.error("Stream error:", error);
    },
  });

  return result.toDataStreamResponse();
}
