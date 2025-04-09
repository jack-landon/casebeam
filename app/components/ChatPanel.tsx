"use client";

import {
  ChatBubble,
  ChatBubbleAction,
  ChatBubbleAvatar,
  ChatBubbleMessage,
} from "@/components/ui/chat/chat-bubble";
import { ChatInput } from "@/components/ui/chat/chat-input";
import { ChatMessageList } from "@/components/ui/chat/chat-message-list";
import { Button } from "@/components/ui/button";
import {
  CopyIcon,
  CornerDownLeft,
  Mic,
  Paperclip,
  RefreshCcw,
  Volume2,
} from "lucide-react";
import { useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeDisplayBlock from "@/components/code-display-block";
import { motion } from "motion/react";
import { View } from "@/page";
import { UIMessage } from "ai";
import { useUser } from "@clerk/nextjs";

const ChatAiIcons = [
  {
    icon: CopyIcon,
    label: "Copy",
  },
  {
    icon: RefreshCcw,
    label: "Refresh",
  },
  {
    icon: Volume2,
    label: "Volume",
  },
];

type ChatPanelProps = {
  openViews: View[];
  messages: UIMessage[];
  input: string;
  isGenerating: boolean;
  isLoading: boolean;
  view: View;
  handleActionClick: (action: string, index: number) => void;
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLTextAreaElement>) => void;
  onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
};

export default function ChatPanel({
  openViews,
  messages,
  input,
  handleActionClick,
  handleInputChange,
  isGenerating,
  isLoading,
  onKeyDown,
  onSubmit,
  view,
}: ChatPanelProps) {
  const { user } = useUser();
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      custom={view}
      className={`flex flex-col w-full h-full overflow-hidden ${
        openViews.length == 1 ? "max-w-3xl" : "border"
      }`}
    >
      {messages.length > 0 && (
        <div className="p-4 border-b">
          <h2 className="text-3xl font-bold">Chat</h2>
        </div>
      )}

      {/* Scrollable Messages */}
      <div className="flex-1 overflow-y-auto w-full">
        <ChatMessageList>
          {/* Initial Message */}
          {messages.length === 0 && (
            <div className="w-full bg-background shadow-sm border rounded-lg p-8 flex flex-col gap-2">
              <h1 className="font-bold">
                {user && `Hey ${user.firstName}, `}
                Welcome to Case Beam 🦅
              </h1>
              <p className="text-muted-foreground text-sm">
                Start chatting with your legal AI. They know all there is to
                know about case law in Australia.
              </p>
              <p className="text-muted-foreground text-sm">
                Our legal eagle does their best to provide accurate and relevant
                information, but please remember to reference the original case
                law for any legal matters.
              </p>
            </div>
          )}

          {/* Messages */}
          {messages &&
            messages.map((message, index) => (
              <ChatBubble
                key={index}
                variant={message.role == "user" ? "sent" : "received"}
              >
                <ChatBubbleAvatar
                  src={message.role == "user" ? user?.imageUrl : undefined}
                  fallback={message.role == "user" ? "👤" : "👨‍⚖️"}
                />
                <ChatBubbleMessage>
                  {message.content
                    .split("```")
                    .map((part: string, index: number) => {
                      if (index % 2 === 0) {
                        return (
                          <Markdown key={index} remarkPlugins={[remarkGfm]}>
                            {part}
                          </Markdown>
                        );
                      } else {
                        return (
                          <pre className="whitespace-pre-wrap pt-2" key={index}>
                            <CodeDisplayBlock code={part} lang="" />
                          </pre>
                        );
                      }
                    })}

                  {message.role === "assistant" &&
                    messages.length - 1 === index && (
                      <div className="flex items-center mt-1.5 gap-1">
                        {!isGenerating && (
                          <>
                            {ChatAiIcons.map((icon, iconIndex) => {
                              const Icon = icon.icon;
                              return (
                                <ChatBubbleAction
                                  variant="outline"
                                  className="size-5 cursor-pointer"
                                  key={iconIndex}
                                  icon={<Icon className="size-3" />}
                                  onClick={() =>
                                    handleActionClick(icon.label, index)
                                  }
                                />
                              );
                            })}
                          </>
                        )}
                      </div>
                    )}
                </ChatBubbleMessage>
              </ChatBubble>
            ))}

          {/* Loading */}
          {isGenerating && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar src="" fallback="👨‍⚖️" />
              <ChatBubbleMessage isLoading />
            </ChatBubble>
          )}
        </ChatMessageList>
      </div>

      {/* Fixed Input Form */}
      <div className="w-full px-4 pb-4 mt-auto">
        <form
          ref={formRef}
          onSubmit={onSubmit}
          className="relative rounded-lg border bg-background focus-within:ring-1 focus-within:ring-ring"
        >
          <ChatInput
            value={input}
            onKeyDown={onKeyDown}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="rounded-lg bg-background border-0 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0">
            <Button variant="ghost" size="icon">
              <Paperclip className="size-4" />
              <span className="sr-only">Attach file</span>
            </Button>

            <Button variant="ghost" size="icon">
              <Mic className="size-4" />
              <span className="sr-only">Use Microphone</span>
            </Button>

            <Button
              disabled={!input || isLoading}
              type="submit"
              size="sm"
              className="ml-auto gap-1.5"
            >
              Send Message
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
