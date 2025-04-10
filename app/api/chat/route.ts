import { createChat, createMessage } from "@/lib/db/queries/insert";
import { google } from "@ai-sdk/google";
import { auth } from "@clerk/nextjs/server";
import { streamText, convertToCoreMessages, Message, generateText } from "ai";
// import { z } from "zod";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { id, messages } = (await req.json()) as {
    messages: Array<Omit<Message, "id">>;
    id?: string;
  };

  const user = await auth();
  let chatId = !id ? null : parseInt(id);

  if (!user) chatId = null;

  // If user is signed in, store the chat and message in the database
  if (user.userId) {
    const messageToStore = messages[messages.length - 1];

    // Check if new chat
    if (messages.length == 1) {
      // Will have to create new chat
      // Generate summary title
      const { text } = await generateText({
        model: google("gemini-2.0-flash-001"),
        prompt: `Generate a short summary title for this chat. The title must be less than 10 words and be 1 sentence and do not end it with a period. This is the chat topic: ${messageToStore.content}`,
      });

      const chat = await createChat({
        userId: user.userId,
        title: text,
        createdAt: new Date().toISOString(),
        lastMessageAt: new Date().toISOString(),
      });

      chatId = chat.id;
    }

    if (!chatId) throw new Error("Chat ID is required");

    await createMessage({
      chatId,
      content: messageToStore.content,
      role: messageToStore.role,
      createdAt: new Date().toISOString(),
    });
  }

  const result = streamText({
    model: google("gemini-2.0-flash-001", {
      useSearchGrounding: true,
    }),
    messages: convertToCoreMessages(messages),
    onFinish: async (data) => {
      if (chatId) {
        await createMessage({
          chatId,
          content: data.text,
          role: "assistant",
          createdAt: new Date().toISOString(),
        });
      }
    },
  });

  // USE THIS INSTEAD
  // const result = generateObject({
  //   model: google("gemini-2.0-flash-001", {
  //     useSearchGrounding: true,
  //   }),
  //   messages: convertToCoreMessages(messages),
  //   schema: z.object({
  //     recipe: z.object({
  //       name: z.string(),
  //       ingredients: z.array(z.string()),
  //       steps: z.array(z.string()),
  //     }),
  //   }),
  //   onFinish: (data) => {
  //     console.log("Recipe data:", data);
  //   }
  // });

  // const { object: notifications } = await generateObject({
  //   model: google("gemini-2.0-flash-001", {
  //     useSearchGrounding: true,
  //   }),
  //   system: "You generate three notifications for a messages app.",
  //   messages: convertToCoreMessages(messages),
  //   schema: z.object({
  //     notifications: z.array(
  //       z.object({
  //         name: z.string().describe("Name of a fictional person."),
  //         message: z.string().describe("Do not use emojis or links."),
  //         minutesAgo: z.number(),
  //       })
  //     ),
  //   }),
  // });

  // console.log("Notifications:", notifications);

  // return notifications;

  // return result.pipeTextStreamToResponse(response, {
  //   headers: { "Content-Type": "application/json" },
  // });

  return result.toDataStreamResponse({
    sendSources: true,
  });
}
