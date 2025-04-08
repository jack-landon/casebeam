import { google } from "@ai-sdk/google";
import { streamText, convertToCoreMessages } from "ai";

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages } = await req.json();

  // const result = streamText({
  //   model: google("gemini-1.5-pro-latest"),
  //   messages: convertToCoreMessages(messages),

  // });

  const result = streamText({
    model: google("gemini-2.0-flash-001", {
      useSearchGrounding: true,
    }),
    messages: convertToCoreMessages(messages),
  });

  // console.log("generated text", text);
  // console.log("generated sources", sources);

  // const result = streamText({
  //   model: google("gemini-1.5-pro-latest"),
  //   messages: convertToCoreMessages(messages),
  // });

  return result.toDataStreamResponse({
    sendSources: true,
  });
}
