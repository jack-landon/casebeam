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
  BookText,
  Check,
  ChevronDown,
  CopyIcon,
  CornerDownLeft,
  Landmark,
  MapPin,
  Mic,
  Paperclip,
  RefreshCcw,
  Volume2,
  X,
} from "lucide-react";
import { useRef } from "react";
import Markdown from "react-markdown";
import remarkGfm from "remark-gfm";
import CodeDisplayBlock from "@/components/code-display-block";
import { motion } from "motion/react";
import { FilterOption, View } from "@/page";
import { UIMessage } from "ai";
import { SignedIn, useUser } from "@clerk/nextjs";
import { ChatHistoryDrawer } from "./ChatHistoryDrawer";
import { SelectChat } from "@/lib/db/schema";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import {
  colorList,
  DOC_JURISDICTIONS,
  DOC_SOURCES,
  DOC_TYPES,
  formatColumnNames,
} from "@/lib/utils";
import { Badge } from "./ui/badge";

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
  userChats: SelectChat[];
  filters: FilterOption[];
  setFilters: React.Dispatch<React.SetStateAction<FilterOption[]>>;
  chatName?: string;
};

const filterIcons = {
  types: Landmark,
  jurisdictions: MapPin,
  sources: BookText,
} as const;

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
  userChats,
  filters,
  setFilters,
  chatName,
}: ChatPanelProps) {
  const { user } = useUser();
  const formRef = useRef<HTMLFormElement>(null);

  const toggleFilter = (
    key: FilterOption["key"],
    value: FilterOption["value"]
  ) => {
    setFilters((current) => {
      const exists = current.some(
        (filter) => filter.key === key && filter.value === value
      );

      if (exists) {
        return current.filter(
          (filter) => !(filter.key === key && filter.value === value)
        );
      }

      return [...current, { key, value }];
    });
  };

  const isFilterActive = (
    key: FilterOption["key"],
    value: FilterOption["value"]
  ) => filters.some((f) => f.key === key && f.value === value);

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
          <h2 className={`${chatName ? "text-xl" : "text-3xl"} font-bold`}>
            {chatName ?? "Chat"}
          </h2>
          <ChatHistoryDrawer chats={userChats} text="View Other Chats" />
        </div>
      )}

      {/* Scrollable Messages */}
      <div className="flex-1 overflow-y-auto w-full">
        <ChatMessageList>
          {/* Initial Message */}
          {messages.length === 0 && (
            <div className="w-full bg-background shadow-sm border rounded-lg p-8 flex flex-col gap-2">
              <div className="flex items-center justify-between w-full pb-2">
                <h1 className="font-bold">
                  {user && `Hey ${user.firstName}, `}
                  Welcome to Case Beam 🦅
                </h1>
                <SignedIn>
                  <ChatHistoryDrawer chats={userChats} />
                </SignedIn>
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
          {filters.length > 0 && (
            <div className="flex items-center gap-2 p-2 flex-wrap">
              {filters.map((filter, i) => {
                const FilterIcon = filterIcons[filter.key];
                return (
                  <Badge key={i} variant="outline" className="group">
                    <div className="relative w-3 h-3">
                      <FilterIcon className="absolute inset-0 size-3 group-hover:opacity-0 transition-opacity" />
                      <X
                        className="absolute inset-0 size-3 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                        onClick={() => toggleFilter(filter.key, filter.value)}
                      />
                    </div>
                    <span className="ml-1">
                      {formatColumnNames(filter.value)}
                    </span>
                  </Badge>
                );
              })}
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
            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Paperclip className="size-4" />
              <span className="sr-only">Attach file</span>
            </Button>

            <Button variant="ghost" size="icon" className="cursor-pointer">
              <Mic className="size-4" />
              <span className="sr-only">Use Microphone</span>
            </Button>

            <div className="flex items-center space-x-2 ml-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    <filterIcons.types className="size-4 mr-2" />
                    Type <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {DOC_TYPES.map((type, i) => (
                    <DropdownMenuItem
                      key={type}
                      onClick={() => toggleFilter("types", type)}
                      className="flex items-center cursor-pointer"
                    >
                      {isFilterActive("types", type) ? (
                        <div>
                          <Check className="size-3 mr-2" />
                        </div>
                      ) : (
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${colorList[i]}`}
                        />
                      )}
                      <span>{formatColumnNames(type)}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    <filterIcons.jurisdictions className="size-4 mr-2" />
                    Jurisdiction <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {DOC_JURISDICTIONS.map((jurisdiction, i) => (
                    <DropdownMenuItem
                      key={jurisdiction}
                      onClick={() =>
                        toggleFilter("jurisdictions", jurisdiction)
                      }
                      className="flex items-center cursor-pointer"
                    >
                      {isFilterActive("jurisdictions", jurisdiction) ? (
                        <div>
                          <Check className="size-3 mr-2" />
                        </div>
                      ) : (
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${colorList[i]}`}
                        />
                      )}
                      <span>{formatColumnNames(jurisdiction)}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="sm"
                    className="cursor-pointer"
                  >
                    <filterIcons.sources className="size-4 mr-2" />
                    Source <ChevronDown className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-56">
                  {DOC_SOURCES.map((source, i) => (
                    <DropdownMenuItem
                      key={source}
                      onClick={() => toggleFilter("sources", source)}
                      className="flex items-center cursor-pointer"
                    >
                      {isFilterActive("sources", source) ? (
                        <div>
                          <Check className="size-3 mr-2" />
                        </div>
                      ) : (
                        <div
                          className={`w-3 h-3 rounded-full mr-2 ${colorList[i]}`}
                        />
                      )}
                      <span>{formatColumnNames(source)}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

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
