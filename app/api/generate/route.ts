import {
  createChat,
  createMessage,
  createSearchResultsBulk,
  updateMessage,
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
import { SelectMessage } from "@/lib/db/schema";

export const maxDuration = 30;

const searchResultsSchema = z.array(
  z.object({
    title: z.string(),
    docTitle: z.string(),
    docSummary: z.string(),
    relevanceSummary: z.string(),
    url: z.string(),
    tags: z.array(z.string()),
    excerpts: z.array(
      z.object({
        title: z.string(),
        caseName: z.string(),
        content: z.string(),
        url: z.string(),
      })
    ),
  })
);

export async function POST(req: Request) {
  const { id: chatId, messages } = (await req.json()) as {
    messages: Array<Omit<Message, "id">>;
    id?: string;
  };
  if (!chatId) throw new Error("Chat ID is required");

  const user = await auth();
  let botMsg: SelectMessage | null = null;
  const messageToStore = messages[messages.length - 1];

  // 1. Save the user message,
  // 2. Create an empty related assistant message,
  // 3. Generate search results,
  // 4. Store the search results in the database and associate it with empty assistant message
  // 5. Generate assistant message and update empty assistant message with the generated text,

  // If user is signed in, store the chat and message in the database
  if (user.userId) {
    if (messages.length == 1) {
      const { text: chatTitle } = await generateText({
        model: google("gemini-2.0-flash-001"),
        prompt: `Generate a short summary title for this chat. The title must be less than 10 words and be 1 sentence and do not end it with a period. This is the chat topic: ${messageToStore.content}`,
      });

      await createChat({
        id: chatId,
        userId: user.userId,
        name: chatTitle,
      });
    }

    const userMsgDb = await createMessage({
      chatId,
      content: messageToStore.content,
      role: messageToStore.role,
    });

    // Empty assistant message -> update after generation
    botMsg = await createMessage({
      chatId,
      content: "",
      role: "assistant",
      responseToMsgId: userMsgDb.id,
    });
  }

  const { object: searchResults } = await generateObject({
    model: google("gemini-2.0-flash-001", {
      useSearchGrounding: true,
    }),
    system:
      "You generate 5-10 relevant objects for search results based on the query.",
    messages: convertToCoreMessages(messages),
    schema: searchResultsSchema,
  });

  if (user.userId) {
    await createSearchResultsBulk(
      searchResults.map((res) => ({
        ...res,
        userId: user.userId,
        tags: JSON.stringify(res.tags),
        excerpts: JSON.stringify(res.excerpts),
        messageId: botMsg?.id,
        chatId,
      }))
    );
  }

  const result = streamText({
    model: google("gemini-2.0-flash-001", {
      useSearchGrounding: true,
    }),
    messages: convertToCoreMessages(messages),
    onFinish: async (data) => {
      // Update the empty bot message with the generated text
      if (chatId && botMsg?.id) {
        botMsg = await updateMessage({
          id: botMsg.id,
          chatId,
          content: data.text,
          role: "assistant",
        });
      }
    },
  });

  return result.toDataStreamResponse({
    sendSources: true,
  });
}
