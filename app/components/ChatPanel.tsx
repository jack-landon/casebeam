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
  // Mic,
  // Paperclip,
  RefreshCcw,
  Volume2,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeDisplayBlock from "@/components/code-display-block";
import { motion } from "motion/react";
import { FilterOption, View } from "@/page";
import { UIMessage } from "ai";
import { SignedIn, useUser } from "@clerk/nextjs";
import { ChatHistoryDrawer } from "./ChatHistoryDrawer";
import Filters, { FilterList } from "./Filters";
import { useUserData } from "./providers/UserDataProvider";
import { useCurrentSearchResults } from "./providers/CurrentSearchResultsProvider";
import { useCurrentArticle } from "./providers/CurrentArticleProvider";
import { InsertSearchResultWithExcerptsAndId } from "@/lib/types";
import { toast } from "sonner";
import { getDetailedSearchResult } from "@/lib/serverActions/getDetailedSearchResult";
import { useTheme } from "next-themes";
import { useCurrentChat } from "./providers/CurrentChatProvider";

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
  filters: FilterOption[];
  setFilters: React.Dispatch<React.SetStateAction<FilterOption[]>>;
};

declare global {
  interface Window {
    handleDocumentClickInChatBubble?: (title: string) => void;
  }
}

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
  filters,
  setFilters,
}: ChatPanelProps) {
  const { user } = useUser();
  const formRef = useRef<HTMLFormElement>(null);
  const { userData } = useUserData();
  const { currentSearchResults, setCurrentSearchResults } =
    useCurrentSearchResults();
  const { currentArticle, setCurrentArticle } = useCurrentArticle();
  const { theme } = useTheme();
  const { currentChat, visibleMessageId, setVisibleMessageId } =
    useCurrentChat();

  const docTitles = useMemo(() => {
    return currentSearchResults.map((result) => result.docTitle);
  }, [currentSearchResults]);

  const handleDocumentClickInChatBubble = useCallback(
    (title: string) => {
      const resultArticle = currentSearchResults.find(
        (result) => result.docTitle?.toLowerCase() === title.toLowerCase()
      );
      if (resultArticle) {
        handleSelectCurrentArticle(resultArticle);
      }
    },
    [currentSearchResults, setCurrentArticle]
  );

  async function handleSelectCurrentArticle(
    searchResult: InsertSearchResultWithExcerptsAndId
  ) {
    if (
      currentArticle &&
      currentArticle != "loading" &&
      currentArticle.id == searchResult.id
    )
      return;

    if (searchResult.extendedSummary) {
      setCurrentArticle(searchResult);
      return;
    }

    if (!searchResult.id) return toast.error("No search result found");

    setCurrentArticle("loading");

    const updatedSearchResult = await getDetailedSearchResult(searchResult.id);

    const updatedSearchResultWithExcerpts = {
      ...updatedSearchResult,
      excerpts: JSON.parse(updatedSearchResult.excerpts),
    };

    setCurrentArticle(updatedSearchResultWithExcerpts);

    // Update currentSearchResults with the new search result included
    const newSearchResults = currentSearchResults.map((result) => {
      if (result.id === searchResult.id) return updatedSearchResultWithExcerpts;
      return result;
    });

    setCurrentSearchResults(newSearchResults);
  }

  useEffect(() => {
    window.handleDocumentClickInChatBubble = handleDocumentClickInChatBubble;
    return () => {
      window.handleDocumentClickInChatBubble = undefined;
    };
  }, [handleDocumentClickInChatBubble]);

  useEffect(() => {
    if (visibleMessageId !== null) {
      console.log("Currently visible message ID:", visibleMessageId);
      if (!currentChat) return;
      const viewedMessageSearchResults = currentChat.messages.find(
        (message) => message.id === visibleMessageId
      )?.botSearchResults;
      if (!viewedMessageSearchResults) return;

      setCurrentSearchResults(
        viewedMessageSearchResults?.map((result) => ({
          ...result,
          excerpts: JSON.parse(result.excerpts),
        }))
      );
    }
  }, [visibleMessageId]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      custom={view}
      className={`flex flex-col w-full h-full overflow-hidden ${
        openViews.length == 1 ? "max-w-3xl mx-auto" : "border"
      }`}
    >
      {messages.length > 0 && (
        <div className="flex items-center justify-between p-4 border-b">
          <h2
            className={`${
              currentChat?.name ? "text-xl" : "text-3xl"
            } font-bold font-lora`}
          >
            {currentChat?.name ?? "Chat"}
          </h2>
        </div>
      )}

      {/* Scrollable Messages */}
      <div className="flex-1 overflow-y-auto w-full">
        <ChatMessageList>
          {/* Initial Message */}
          {messages.length === 0 && (
            <div className="w-full bg-background shadow-sm border rounded-lg p-8 flex flex-col gap-2">
              <div className="flex items-center justify-between w-full pb-2">
                <h1 className="font-bold font-lora">
                  {user && `Hey ${user.firstName}, `}
                  Welcome to Case Beam 🦅
                </h1>
                {userData?.chats && (
                  <SignedIn>
                    <ChatHistoryDrawer chats={userData.chats} />
                  </SignedIn>
                )}
              </div>
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
            messages.map((message, index) => {
              return (
                <ChatBubble
                  key={index}
                  variant={message.role == "user" ? "sent" : "received"}
                  messageId={message.id}
                  isAssistant={message.role === "assistant"}
                  onVisibilityChange={(messageId, visible) => {
                    if (visible) {
                      setVisibleMessageId(messageId);
                    }
                  }}
                >
                  <ChatBubbleAvatar
                    src={
                      message.role == "user"
                        ? user?.imageUrl
                        : message.role == "assistant"
                        ? theme == "dark"
                          ? `brand/icon-white-circle.png`
                          : `brand/icon-black-circle.png`
                        : undefined
                    }
                    fallback={message.role == "user" ? "👤" : "👨‍⚖️"}
                  />
                  <ChatBubbleMessage
                    isAssistant={message.role === "assistant"}
                    messageId={message.id}
                    visibleMessageId={visibleMessageId ?? undefined}
                  >
                    {message.content
                      .split("```") // Split by code blocks -> then process the normal text parts
                      .map((part: string, index: number) => {
                        if (index % 2 === 0) {
                          // Process text parts (non-code blocks)
                          let processedContent = part.replace(/\*/g, ""); // Strip all asterisks

                          // Create regex pattern for all docTitles, escape special characters
                          docTitles.forEach((title) => {
                            const escapedTitle = title
                              ?.replace(/\*/g, "")
                              .replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
                            const regex = new RegExp(`(${escapedTitle})`, "gi");
                            processedContent = processedContent.replace(
                              regex,
                              `<span
                             class="bg-amber-300/40 hover:bg-amber-300/80 hover:outline px-1.5 py-0.5 font-bold rounded-md cursor-pointer transition-colors"
                             onclick="window.handleDocumentClickInChatBubble('${title?.replace(
                               /'/g,
                               "\\'"
                             )}')"
                           >$1</span>`
                            );
                          });

                          return (
                            <Markdown
                              key={index}
                              remarkPlugins={[remarkGfm]}
                              components={{
                                p: ({ children }) => {
                                  const content = Array.isArray(children)
                                    ? children.join("")
                                    : String(children || "");
                                  return (
                                    <p
                                      dangerouslySetInnerHTML={{
                                        __html: content,
                                      }}
                                    />
                                  );
                                },
                              }}
                            >
                              {processedContent}
                            </Markdown>
                          );
                        } else {
                          // Code blocks remain unchanged
                          return (
                            <pre
                              className="whitespace-pre-wrap pt-2"
                              key={index}
                            >
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
              );
            })}

          {/* Loading */}
          {isGenerating && (
            <ChatBubble variant="received">
              <ChatBubbleAvatar
                src={
                  theme == "dark"
                    ? `brand/icon-white-circle.png`
                    : `brand/icon-black-circle.png`
                }
                fallback="👨‍⚖️"
              />
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
          {filters.length > 0 && (
            <div className="flex items-center gap-2 p-2 flex-wrap">
              <FilterList filters={filters} setFilters={setFilters} />
            </div>
          )}
          <ChatInput
            value={input}
            onKeyDown={onKeyDown}
            onChange={handleInputChange}
            placeholder="Type your message here..."
            className="rounded-lg bg-background border-0 shadow-none focus-visible:ring-0"
          />
          <div className="flex items-center p-3 pt-0">
            {/* <Button variant="ghost" size="icon" className="cursor-pointer">
              <Paperclip className="size-4" />
              <span className="sr-only">Attach file</span>
            </Button>

            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Mic className="size-4" />
              <span className="sr-only">Use Microphone</span>
            </Button> */}

            <Filters filters={filters} setFilters={setFilters} />

            <Button
              disabled={!input || isLoading}
              type="submit"
              size="sm"
              className="ml-auto gap-1.5"
            >
              {/* Send Message */}
              <CornerDownLeft className="size-3.5" />
            </Button>
          </div>
        </form>
      </div>
    </motion.div>
  );
}
