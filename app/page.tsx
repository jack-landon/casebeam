"use client";

import { useChat } from "ai/react";
import { useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import ResultsPanel from "./components/ResultsPanel";
import DetailsPanel from "./components/DetailsPanel";
import ChatPanel from "./components/ChatPanel";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ListCollapse } from "lucide-react";
import {
  DOC_JURISDICTIONS,
  DOC_SOURCES,
  DOC_TYPES,
  formatTag,
} from "./lib/utils";
import { useCurrentSearchResults } from "./components/providers/CurrentSearchResultsProvider";
import { useCurrentArticle } from "./components/providers/CurrentArticleProvider";
import { useCurrentModal } from "./components/providers/CurrentModalProvider";
import { NewProjectModal } from "./components/NewProjectModal";
import { NewCategoryModal } from "./components/NewCategoryModal";
import {
  CurrentChatProvider,
  useCurrentChat,
} from "./components/providers/CurrentChatProvider";
import BottomMenuBar, { bottomMenuTabs } from "./components/BottomMenuBar";
import { useDeviceType } from "./lib/deviceTypeHook";

export type View = "chat" | "results" | "details";

type JSONValue = null | string | number | boolean | JSONObject | JSONArray;
type JSONObject = {
  [key: string]: JSONValue;
};
type JSONArray = JSONValue[];

export type FilterOption = {
  key: "types" | "jurisdictions" | "sources";
  value:
    | (typeof DOC_TYPES)[number]
    | (typeof DOC_JURISDICTIONS)[number]
    | (typeof DOC_SOURCES)[number];
};

function HomeContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  let chatId = searchParams.get("id");
  const [filters, setFilters] = useState<FilterOption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const messagesRef = useRef<HTMLDivElement>(null);
  const [openViews, setOpenViews] = useState<View[]>(["chat"]);
  const [isGettingSearchResults, setIsGettingSearchResults] = useState(false);
  const [isShowingSearchResults, setIsShowingSearchResults] = useState(false);
  const { currentSearchResults, setCurrentSearchResults } =
    useCurrentSearchResults();
  const { currentArticle } = useCurrentArticle();
  const { currentModal } = useCurrentModal();
  const { currentChat, refreshCurrentChat } = useCurrentChat();
  const { isDesktop } = useDeviceType();

  const [selectedTab, setSelectedTab] = useState<
    (typeof bottomMenuTabs)[number]["name"]
  >(bottomMenuTabs[0].name);

  const {
    id: generatedChatId,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
    setMessages,
    data,
    setData,
    status,
  } = useChat({
    api: `api/chat`,
    id: chatId ?? undefined,
    key: chatId ?? undefined,
    body: {
      filters,
    },
    onResponse(response) {
      // Clear Data First
      setData(undefined);
      if (response) {
        console.log("First Response", response);
        setIsGenerating(false);
        setIsGettingSearchResults(true);
        if (!openViews.includes("results")) {
          const newViews = [...openViews];
          newViews.splice(1, 0, "results");
          setOpenViews(newViews);
        }
      }
    },
    async onFinish() {
      if (!chatId) return setIsGettingSearchResults(false);

      await refreshCurrentChat(chatId);
    },
    onError(error) {
      if (error) {
        console.error("Error:", error);
        setIsGenerating(false);
      }
    },
  });

  useEffect(() => {
    if (!currentChat) return;
    const transformedMessages = currentChat.messages.map((msg) => ({
      id: msg.id.toString(),
      role: msg.role as "user" | "assistant",
      content: msg.content,
    }));

    setMessages(transformedMessages);

    if (currentChat) {
      setCurrentSearchResults(
        currentChat.searchResults.map((result) => ({
          ...result,
          excerpts: JSON.parse(result.excerpts ?? "[]"),
        }))
      );
    }

    setIsShowingSearchResults(true);
  }, [currentChat]);

  useEffect(() => {
    console.log("The data has changed", data);
    if (data) {
      setIsShowingSearchResults(true);
      const initialSearchResultData = (
        data[0] as unknown as {
          initialSearchResults: {
            doc_id: string;
            citation: string;
            jurisdiction: string;
            type: string;
            source: string;
            date: string;
            url: string | null;
            similarityScore: number;
            $lexical: string;
            $vectorize: string;
            excerpts: {
              caseName: string;
              title: string;
              content: string;
              url: string;
            }[];
          }[];
        }
      ).initialSearchResults;

      setCurrentSearchResults(
        initialSearchResultData.map((result) => ({
          docTitle: result.citation,
          shortSummary: null,
          extendedSummary: null,
          docDate: result.date,
          similarityScore: result.similarityScore,
          url: result.url ?? "#",
          chatId: chatId,
          type: formatTag(result.type),
          jurisdiction: formatTag(result.jurisdiction),
          source: formatTag(result.source),
          excerpts: result.excerpts,
        }))
      );
      setIsGettingSearchResults(false);
    }
  }, [data]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      setIsGenerating(true);
      if (!chatId) {
        router.push(`?id=${generatedChatId}`);
        chatId = generatedChatId;
      }
      await handleSubmit(e, {
        allowEmptySubmit: false,
      });
    } catch (error) {
      console.error("Error submitting:", error);
      setIsGenerating(false);
    }
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (isGenerating || isLoading || !input) return;
      setIsGenerating(true);
      onSubmit(e as unknown as React.FormEvent<HTMLFormElement>);
    }
  };

  const handleActionClick = async (action: string, messageIndex: number) => {
    console.log("Action clicked:", action, "Message index:", messageIndex);
    if (action === "Refresh") {
      setIsGenerating(true);
      try {
        await reload({
          allowEmptySubmit: false,
          body: {
            reload: true,
            filters,
          },
        });
      } catch (error) {
        console.error("Error reloading:", error);
      } finally {
        setIsGenerating(false);
      }
    }

    if (action === "Copy") {
      const message = messages[messageIndex];
      if (message && message.role === "assistant") {
        navigator.clipboard.writeText(message.content);
      }
    }
  };

  useEffect(() => {
    if (currentSearchResults.length > 1) {
      setOpenViews(["chat", "results"]);
    }
  }, [currentSearchResults]);

  useEffect(() => {
    if (!currentArticle) return;
    setOpenViews((prev) => {
      if (!prev.includes("details")) {
        return [...prev, "details"];
      }
      return prev;
    });
  }, [currentArticle]);

  return (
    <>
      <main
        className={`flex ${
          isDesktop ? "h-[calc(100vh-4rem)]" : "h-[calc(100vh-7rem)]"
        } w-full max-w-7xl flex-col items-center mx-auto pb-12 md:pb-0`}
      >
        {isDesktop ? (
          <AnimatePresence>
            <PanelGroup direction="horizontal">
              <Panel defaultSize={30} minSize={20}>
                <ChatPanel
                  key={"chat"}
                  openViews={openViews}
                  messages={messages}
                  input={input}
                  view={"chat"}
                  handleActionClick={handleActionClick}
                  handleInputChange={handleInputChange}
                  isGenerating={isGenerating}
                  isLoading={isLoading}
                  onKeyDown={onKeyDown}
                  onSubmit={onSubmit}
                  filters={filters}
                  setFilters={setFilters}
                />
              </Panel>
              {isShowingSearchResults ? (
                <>
                  <PanelResizeHandle className="bg-gray-200 hover:bg-blue-400 transition-colors" />
                  <Panel defaultSize={30} minSize={20}>
                    <ResultsPanel
                      key={"results"}
                      view={"results"}
                      isGettingSearchResults={isGettingSearchResults}
                      setIsShowingSearchResults={setIsShowingSearchResults}
                      isStreaming={status == "streaming"}
                    />
                  </Panel>
                </>
              ) : currentSearchResults.length > 0 ? (
                <Panel
                  className="bg-secondary hover:bg-secondary/80 transition-colors cursor-pointer"
                  onClick={() => {
                    setIsShowingSearchResults(true);
                  }}
                  defaultSize={5}
                  minSize={5}
                  maxSize={5}
                >
                  <div className="flex items-center justify-center h-full">
                    <p className="flex items-center gap-4 transform rotate-90 origin-center whitespace-nowrap font-medium">
                      <ListCollapse />
                      Show Search Results
                    </p>
                  </div>
                </Panel>
              ) : null}
              {currentArticle && (
                <>
                  <PanelResizeHandle className="bg-gray-200 hover:bg-blue-400 transition-colors" />
                  <Panel defaultSize={30} minSize={20}>
                    <DetailsPanel key={"details"} view={"details"} />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </AnimatePresence>
        ) : selectedTab == "chat" ? (
          <ChatPanel
            key={"chat"}
            openViews={openViews}
            messages={messages}
            input={input}
            view={"chat"}
            handleActionClick={handleActionClick}
            handleInputChange={handleInputChange}
            isGenerating={isGenerating}
            isLoading={isLoading}
            onKeyDown={onKeyDown}
            onSubmit={onSubmit}
            filters={filters}
            setFilters={setFilters}
          />
        ) : selectedTab == "results" ? (
          <ResultsPanel
            key={"results"}
            view={"results"}
            isGettingSearchResults={isGettingSearchResults}
            setIsShowingSearchResults={setIsShowingSearchResults}
            isStreaming={status == "streaming"}
            setSelectedTab={setSelectedTab}
          />
        ) : selectedTab == "article" ? (
          <DetailsPanel
            key={"details"}
            view={"details"}
            setSelectedTab={setSelectedTab}
          />
        ) : null}
        <BottomMenuBar
          selectedTab={selectedTab}
          setSelectedTab={setSelectedTab}
        />
      </main>
      {currentModal == "newProject" ? (
        <NewProjectModal />
      ) : currentModal == "newCategory" ? (
        <NewCategoryModal />
      ) : null}
    </>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="flex h-[calc(100vh-4rem)] w-full items-center justify-center">
          <div className="animate-pulse">Loading...</div>
        </div>
      }
    >
      <CurrentChatProvider>
        <HomeContent />
      </CurrentChatProvider>
    </Suspense>
  );
}
