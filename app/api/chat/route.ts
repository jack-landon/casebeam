import {
  createChat,
  createManyMessages,
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
  createDataStreamResponse,
  GenerateTextResult,
  ToolSet,
} from "ai";
import { Excerpt, InsertSearchResult, SelectChat } from "@/lib/db/schema";
import { findRelevantContent } from "@/lib/serverActions/getResultsFromAstro";
import { convertUrlToEmbeddedUrl, formatTag } from "@/lib/utils";
import { FilterOption } from "@/page";
import {
  searchResultSummarySystemPrompt,
  streamTextSystemMessage,
} from "@/lib/promptBlocks";
import { searchResultsSchema } from "@/lib/zodSchemas";

export const runtime = "edge";

export async function POST(req: Request) {
  const {
    id: chatId,
    messages,
    filters = [],
    reload = false,
  } = (await req.json()) as {
    messages: Array<Omit<Message, "id">>;
    id?: string;
    filters?: FilterOption[];
    reload?: boolean;
  };
  if (!chatId) throw new Error("Chat ID is required");
  const userMsgIndex = messages.length - 1;
  const botMsgIndex = messages.length;
  const userMsgId = `${chatId}-${userMsgIndex}`;
  const botMsgId = `${chatId}-${botMsgIndex}`;

  console.log("Is Reload: ", reload);

  let generateChatTitlePromise: Promise<
    GenerateTextResult<ToolSet, never>
  > | null = null;
  let createChatPromise: Promise<SelectChat> | null = null;

  const user = await auth();
  if (!user.userId) throw new Error("User not found");

  const messageToStore = messages[messages.length - 1];
  const isNewChat = messages.length == 1;

  const coreMessages = convertToCoreMessages(messages); // Get last 5 messages

  // Get last 5 messages
  const contextWindow =
    messages.length == 1
      ? messageToStore.content
      : messages
          .slice(-5)
          .map((msg) => `[${msg.role.toUpperCase()} MESSAGE]: ${msg.content}`)
          .join();

  // Start Getting the relevant content ~ 5 seconds
  const retrievedExcerptsPromise = findRelevantContent(
    contextWindow,
    filters,
    25
  );

  if (isNewChat) {
    generateChatTitlePromise = generateText({
      model: google("gemini-2.0-flash-lite-preview-02-05"),
      prompt: `Generate a short summary title for this chat. The title must be less than 10 words and be 1 sentence and do not end it with a period. This is the chat topic: ${messageToStore.content}`,
    });
  }

  const retrievedExcerpts = await retrievedExcerptsPromise;

  console.log("Retrieved Excerpts: ", retrievedExcerpts);

  // Create a doc object but keep the excerpts empty
  const unsortedDocObject: {
    [key: string]: {
      doc_id: string;
      citation: string;
      jurisdiction: string;
      type: string;
      source: string;
      date: string | undefined;
      url: string;
      similarityScore: number | null;
      $lexical: string;
      excerpts: Excerpt[];
    };
  } = {};

  // Unique doc_ids
  for (const docId of [
    ...new Set(retrievedExcerpts.map((doc) => doc.doc_id)),
  ]) {
    const excerpts = retrievedExcerpts.filter(
      (excerpt) => excerpt.doc_id === docId
    );
    if (excerpts.length == 0) continue;

    const maxScore = Math.max(
      ...excerpts.map((excerpt) => {
        if (!excerpt.$similarity) return 0;
        if (excerpt.$similarity < 0) {
          return 0.1 * Math.exp(excerpt.$similarity); // exponentially decay for negative values
        }
        return excerpt.$similarity;
      })
    );

    // We use the first excerpt to get the document details
    const exampleExcerpt = excerpts[0];

    unsortedDocObject[docId] = {
      doc_id: exampleExcerpt.doc_id,
      citation: exampleExcerpt.citation,
      jurisdiction: exampleExcerpt.jurisdiction ?? "",
      type: exampleExcerpt.type ?? "",
      source: exampleExcerpt.source ?? "",
      date: exampleExcerpt.date ?? "",
      url: exampleExcerpt.url ?? "#",
      similarityScore: maxScore ?? null,
      $lexical: exampleExcerpt.$lexical,
      excerpts: excerpts.map((excerpt) => ({
        caseName: exampleExcerpt.citation,
        title: exampleExcerpt.citation,
        content: excerpt.$lexical
          .replace(`Document Name: ${exampleExcerpt.citation}`, "")
          .trim(),
        url: !exampleExcerpt.url
          ? null
          : convertUrlToEmbeddedUrl(
              exampleExcerpt.url,
              exampleExcerpt.$lexical
            ),
      })),
    };
  }

  // Resort docObject by similarity score
  // Sort the docObject by similarity score in descending order
  const sortedDocObject = Object.fromEntries(
    Object.entries(unsortedDocObject).sort(
      ([, a], [, b]) => (b.similarityScore ?? 0) - (a.similarityScore ?? 0)
    )
  );

  const topFiveResults = Object.values(sortedDocObject)
    .sort((a, b) => (b.similarityScore ?? 0) - (a.similarityScore ?? 0))
    .slice(0, 5);

  const searchResultsPromise = generateObject({
    model: google("gemini-2.0-flash-lite-preview-02-05"),
    system: searchResultSummarySystemPrompt(
      messageToStore.content,
      JSON.stringify(topFiveResults)
    ),
    messages: convertToCoreMessages(messages),
    schema: searchResultsSchema,
  });

  // return result.toDataStreamResponse();
  return createDataStreamResponse({
    execute: (dataStream) => {
      dataStream.writeData({
        initialSearchResults: Object.values(sortedDocObject).map((result) => ({
          ...result,
          date: result.date ?? null,
        })),
      });

      // THIS IS THE STREAMED TEXT
      const result = streamText({
        model: google("gemini-2.0-flash-001"),
        system: streamTextSystemMessage(
          JSON.stringify(
            topFiveResults.map((doc) => ({
              title: doc.citation,
              jurisdiction: doc.jurisdiction,
              type: doc.type,
              source: doc.source,
              importanceScore: doc.similarityScore,
              excerpts: doc.excerpts.map((excerpt) => excerpt.content),
            }))
          )
        ),
        messages: coreMessages,
        onFinish: async ({ text }) => {
          // If user is signed in, store the chat and message in the database
          if (isNewChat) {
            if (generateChatTitlePromise) {
              const { text: chatTitle } = await generateChatTitlePromise;
              createChatPromise = createChat({
                id: chatId,
                userId: user.userId,
                name: chatTitle,
              });
            }

            if (createChatPromise) {
              await createChatPromise;
            }
          }

          const savedMsgsInDbPromise = createManyMessages([
            {
              id: userMsgId,
              msgIndex: userMsgIndex,
              chatId,
              content: messageToStore.content,
              role: messageToStore.role,
            },
            {
              id: botMsgId,
              msgIndex: botMsgIndex,
              chatId,
              content: text,
              role: "assistant",
            },
          ]);

          const { object: searchResults } = await searchResultsPromise;
          await savedMsgsInDbPromise;

          const newTransformedResults: InsertSearchResult[] = Object.values(
            sortedDocObject
          ).map((doc) => {
            const searchResult = searchResults.find(
              (result) =>
                result.docId.toLowerCase() === doc.doc_id.toLowerCase()
            );

            const initialExcerpts = doc.excerpts.map((excerpt, i) => ({
              ...excerpt,
              title: `Excerpt ${i + 1}`,
            }));

            return {
              docTitle: doc.citation,
              docId: doc.doc_id,
              shortSummary:
                searchResult?.shortSummary ??
                `${initialExcerpts[0].content.slice(0, 150)}...`,
              extendedSummary: null,
              url: doc.url,
              docDate: doc.date,
              similarityScore: doc.similarityScore,
              jurisdiction: formatTag(doc.jurisdiction),
              type: formatTag(doc.type),
              source: formatTag(doc.source),
              excerpts: JSON.stringify(initialExcerpts ?? []),
              userId: user.userId,
              userMessageId: userMsgId,
              botMessageId: botMsgId,
              chatId,
            };
          });

          await createSearchResultsBulk(Object.values(newTransformedResults));
        },
        onError: (error) => {
          console.error("Stream error:", error);
        },
      });

      result.mergeIntoDataStream(dataStream);
    },
    onError: (error) => {
      // Error messages are masked by default for security reasons.
      // If you want to expose the error message to the client, you can do so here:
      return error instanceof Error ? error.message : String(error);
    },
  });
}
