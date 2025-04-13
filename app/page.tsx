"use client";

import { useChat } from "ai/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import ResultsPanel from "./components/ResultsPanel";
import DetailsPanel from "./components/DetailsPanel";
import ChatPanel from "./components/ChatPanel";
import { SelectCategory, SelectChat, SelectProject } from "./lib/db/schema";
import { getChat, getUserChats } from "./lib/db/queries/select";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import { getProjectsFromDb, getUserCategoriesFromDb } from "./lib/actions";
import { InsertSearchResultWithExcerpts } from "./lib/types";
import { getSearchResults } from "./lib/db/queries/query";
import {
  CurrentArticleContext,
  CurrentSearchResultsContext,
} from "./components/ChatContext";

const panelOptions = ["chat", "results", "details"] as const;
export type View = (typeof panelOptions)[number];

type JSONValue = null | string | number | boolean | JSONObject | JSONArray;
type JSONObject = {
  [key: string]: JSONValue;
};
type JSONArray = JSONValue[];

function HomeContent() {
  const { userId } = useAuth();
  const router = useRouter();

  const searchParams = useSearchParams();
  let chatId = searchParams.get("id");

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
    onResponse(response) {
      if (response) {
        console.log(response);
        setIsGenerating(false);
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

      const fetchedSearchResults = await getSearchResults(chatId);

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
  const [exitingPanels, setExitingPanels] = useState<View[]>([]);
  const [currentSearchResults, setCurrentSearchResults] = useState<
    InsertSearchResultWithExcerpts[]
  >([]);
  const [currentArticle, setCurrentArticle] =
    useState<InsertSearchResultWithExcerpts | null>(null);
  const [isGettingSearchResults, setIsGettingSearchResults] = useState(false);
  const [userChats, setUserChats] = useState<SelectChat[]>([]);
  const [userProjects, setUserProjects] = useState<SelectProject[]>([]);
  const [userCategories, setUserCategories] = useState<SelectCategory[]>([]);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = useCallback(
    async (chatId: string) => {
      const chat = await getChat(chatId);

      if (!chat) return;

      const transformedMessages = chat.messages.map((msg) => ({
        id: msg.id.toString(),
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      setMessages(transformedMessages);
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
      await handleSubmit(e);
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

  function hidePanel(panel: View) {
    // Add the panel to exitingPanels
    setExitingPanels((prev) => [...prev, panel]);

    setOpenViews((prev) => {
      if (panel === "chat") return prev;

      const filtered = prev.filter((view) => view !== panel);
      const order: Record<View, number> = {
        chat: 0,
        results: 1,
        details: 2,
      };
      return filtered.sort((a, b) => order[a] - order[b]);
    });
  }

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
          <div
            className={`flex-1 w-full h-full overflow-y-auto grid ${
              openViews.length + exitingPanels.length == 1
                ? "grid-cols-1"
                : openViews.length + exitingPanels.length == 2
                ? "grid-cols-2"
                : "grid-cols-3"
            } place-items-center gap-4`}
          >
            <AnimatePresence
              onExitComplete={() => {
                setExitingPanels((prev) => {
                  const [, ...rest] = prev;
                  return rest;
                });
              }}
            >
              {panelOptions.map((view) => {
                if (!openViews.includes(view)) return null;

                switch (view) {
                  case "chat":
                    return (
                      <ChatPanel
                        key={view}
                        openViews={openViews}
                        messages={messages}
                        input={input}
                        view={view}
                        handleActionClick={handleActionClick}
                        handleInputChange={handleInputChange}
                        isGenerating={isGenerating}
                        isLoading={isLoading}
                        onKeyDown={onKeyDown}
                        onSubmit={onSubmit}
                        userChats={userChats}
                      />
                    );
                  case "results":
                    return (
                      <ResultsPanel
                        key={view}
                        view={view}
                        setCurrentArticle={setCurrentArticle}
                        isGettingSearchResults={isGettingSearchResults}
                        hidePanel={hidePanel}
                        userProjects={userProjects}
                        userCategories={userCategories}
                      />
                    );
                  case "details":
                    return (
                      <DetailsPanel
                        key={view}
                        view={view}
                        hidePanel={hidePanel}
                      />
                    );
                }
              })}
            </AnimatePresence>
          </div>
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
