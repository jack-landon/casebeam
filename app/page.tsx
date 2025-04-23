"use client";

import { useChat } from "ai/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import ResultsPanel from "./components/ResultsPanel";
import DetailsPanel from "./components/DetailsPanel";
import ChatPanel from "./components/ChatPanel";
import { SelectCategory, SelectChat, SelectProject } from "./lib/db/schema";
import { getUserChats } from "./lib/db/queries/select";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import { getProjectsFromDb, getUserCategoriesFromDb } from "./lib/actions";
import { InsertSearchResultWithExcerpts } from "./lib/types";
import { getChat, getSearchResults } from "./lib/db/queries/query";
import {
  CurrentArticleContext,
  CurrentSearchResultsContext,
} from "./components/ChatContext";
import { Panel, PanelGroup, PanelResizeHandle } from "react-resizable-panels";
import { ListCollapse } from "lucide-react";
import { DOC_JURISDICTIONS, DOC_SOURCES, DOC_TYPES } from "./lib/utils";

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
  const { userId } = useAuth();
  const router = useRouter();

  const searchParams = useSearchParams();
  let chatId = searchParams.get("id");

  const [filters, setFilters] = useState<FilterOption[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);

  const {
    id: generatedChatId,
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
    setMessages,
  } = useChat({
    api: `api/chat`,
    id: chatId ?? undefined,
    key: chatId ?? undefined,
    body: {
      filters,
    },
    onResponse(response) {
      if (response) {
        console.log(response);
        setIsGenerating(false);
        setIsShowingSearchResults(true);
        setIsGettingSearchResults(true);
        if (!openViews.includes("results")) {
          const newViews = [...openViews];
          newViews.splice(1, 0, "results");
          setOpenViews(newViews);
        }
      }
    },
    async onFinish(res) {
      console.log("Res:", res);
      const sources = res.parts
        ?.filter((part) => part.type === "source")
        .map((part) => part.source);

      console.log("Sources:", sources);
      if (!sources) return;

      if (!chatId) return setIsGettingSearchResults(false);

      const [chat, fetchedSearchResults] = await Promise.all([
        getChat(chatId),
        getSearchResults(chatId),
      ]);

      if (chat) setChatName(chat.name);

      setCurrentSearchResults(
        fetchedSearchResults.map((result) => ({
          ...result,
          excerpts: JSON.parse(result.excerpts ?? "[]"),
          tags: JSON.parse(result.tags ?? "[]"),
        }))
      );
      setIsGettingSearchResults(false);
    },
    onError(error) {
      if (error) {
        console.error("Error:", error);
        setIsGenerating(false);
      }
    },
  });

  const messagesRef = useRef<HTMLDivElement>(null);
  const [openViews, setOpenViews] = useState<View[]>(["chat"]);
  const [currentSearchResults, setCurrentSearchResults] = useState<
    InsertSearchResultWithExcerpts[]
  >([]);
  const [currentArticle, setCurrentArticle] =
    useState<InsertSearchResultWithExcerpts | null>(null);
  const [isGettingSearchResults, setIsGettingSearchResults] = useState(false);
  const [userChats, setUserChats] = useState<SelectChat[]>([]);
  const [userProjects, setUserProjects] = useState<SelectProject[]>([]);
  const [userCategories, setUserCategories] = useState<SelectCategory[]>([]);
  const [isShowingSearchResults, setIsShowingSearchResults] = useState(false);
  const [chatName, setChatName] = useState<string | undefined>(undefined);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = useCallback(
    async (chatId: string) => {
      const chat = await getChat(chatId);

      if (!chat) return;

      setChatName(chat.name);

      const transformedMessages = chat.messages.map((msg) => ({
        id: msg.id.toString(),
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      setMessages(transformedMessages);
      setCurrentSearchResults(
        chat.searchResults.map((result) => ({
          ...result,
          excerpts: JSON.parse(result.excerpts ?? "[]"),
          tags: JSON.parse(result.tags ?? "[]"),
        }))
      );
      setIsShowingSearchResults(true);
    },
    [setMessages]
  );

  const fetchUserData = useCallback(async () => {
    const [projects, categories] = await Promise.all([
      getProjectsFromDb(),
      getUserCategoriesFromDb(),
    ]);

    if (!projects.data || !categories.data) return;

    setUserProjects(projects.data);
    setUserCategories(categories.data);
  }, [setUserProjects, setUserCategories]);

  useEffect(() => {
    function fetchChat() {
      if (!chatId) return;
      fetchMessages(chatId);
    }
    fetchChat();
  }, [chatId, fetchMessages]);

  useEffect(() => {
    function fetchUserInfo() {
      if (!userId) return;
      fetchUserData();
    }
    fetchUserInfo();
  }, [userId, fetchUserData]);

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
        await reload();
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

  useEffect(() => {
    if (!userId) return;

    async function fetchUserChats() {
      const chats = await getUserChats();
      setUserChats(chats);
    }
    fetchUserChats();
  }, [userId]);

  return (
    <CurrentSearchResultsContext.Provider value={currentSearchResults}>
      <CurrentArticleContext.Provider value={currentArticle}>
        <main className="flex h-[calc(100vh-4rem)] w-full max-w-7xl flex-col items-center mx-auto">
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
                  userChats={userChats}
                  filters={filters}
                  setFilters={setFilters}
                  chatName={chatName}
                />
              </Panel>
              {isShowingSearchResults ? (
                <>
                  <PanelResizeHandle className="bg-gray-200 hover:bg-blue-400 transition-colors" />
                  <Panel defaultSize={30} minSize={20}>
                    <ResultsPanel
                      key={"results"}
                      view={"results"}
                      setCurrentArticle={setCurrentArticle}
                      isGettingSearchResults={isGettingSearchResults}
                      userProjects={userProjects}
                      userCategories={userCategories}
                      setIsShowingSearchResults={setIsShowingSearchResults}
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
                    <DetailsPanel
                      key={"details"}
                      view={"details"}
                      setCurrentArticle={setCurrentArticle}
                    />
                  </Panel>
                </>
              )}
            </PanelGroup>
          </AnimatePresence>
        </main>
      </CurrentArticleContext.Provider>
    </CurrentSearchResultsContext.Provider>
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
      <HomeContent />
    </Suspense>
  );
}
