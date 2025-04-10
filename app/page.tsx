"use client";

import { useChat } from "ai/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { sleep } from "./lib/utils";
import { AnimatePresence } from "motion/react";
import ResultsPanel from "./components/ResultsPanel";
import DetailsPanel from "./components/DetailsPanel";
import ChatPanel from "./components/ChatPanel";
import { SelectChat } from "./lib/db/schema";
import { getChat, getUserChats } from "./lib/db/queries/select";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@clerk/nextjs";

const panelOptions = ["chat", "results", "details"] as const;
export type View = (typeof panelOptions)[number];

type JSONValue = null | string | number | boolean | JSONObject | JSONArray;
type JSONObject = {
  [key: string]: JSONValue;
};
type JSONArray = JSONValue[];

export type SearchResultType = {
  heading: string;
  subheading: string;
  details: string;
  source?: {
    sourceType: "url";
    id: string;
    url: string;
    title?: string;
    providerMetadata?: Record<string, Record<string, JSONValue>>;
  };
};

const sampleSearchResults: SearchResultType[] = [
  {
    heading: "Smith v Corporation Ltd [2024] HCA 101",
    subheading:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.",
    details: `
      <div class="legal-case">
  <h1>Smith v Corporation Ltd [2024] HCA 101</h1>

  <section>
    <h2>Summary</h2>
    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>
  </section>

  <section>
    <h3>Key Points</h3>
    <ul>
      <li>Ut enim ad minim veniam, quis nostrud exercitation</li>
      <li>Ullamco laboris nisi ut aliquip ex ea commodo consequat</li>
      <li>Duis aute irure dolor in reprehenderit</li>
    </ul>
  </section>

  <section>
    <h2>Background</h2>
    <p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
  </section>

  <section>
    <h3>Legal Principles</h3>
    <ol>
      <li><strong>Prima Facie</strong>: Lorem ipsum dolor sit amet</li>
      <li><strong>Mens Rea</strong>: Consectetur adipiscing elit</li>
      <li><strong>Actus Reus</strong>: Sed do eiusmod tempor</li>
    </ol>
  </section>

  <section>
    <h2>Court's Decision</h2>
    <blockquote>
      <p>"Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."</p>
      <cite>— Chief Justice Smith</cite>
    </blockquote>
  </section>

  <section>
    <h3>Impact</h3>
    <p>The decision established three key principles:</p>
    <ul>
      <li>Lorem ipsum dolor sit amet</li>
      <li>Consectetur adipiscing elit</li>
      <li>Sed do eiusmod tempor incididunt</li>
    </ul>
  </section>
</div>
    `,
  },
  {
    heading: "Brown v State [2024] HCA 102",
    subheading:
      "Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.",
    details: `
      <div class="legal-case">
        <h1>Brown v State [2024] HCA 102</h1>
        <section>
          <h2>Background</h2>
          <p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium.</p>
        </section>
        <section>
          <h2>Decision</h2>
          <blockquote>
            <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit.</p>
            <cite>— Chief Justice Johnson</cite>
          </blockquote>
        </section>
      </div>
    `,
  },
  {
    heading: "Johnson v Department [2024] HCA 103",
    subheading:
      "Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla.",
    details: `
      <div class="legal-case">
        <h1>Johnson v Department [2024] HCA 103</h1>
        <section>
          <h2>Legal Principles</h2>
          <ol>
            <li><strong>Principle 1:</strong> At vero eos et accusamus et iusto odio dignissimos</li>
            <li><strong>Principle 2:</strong> Ducimus qui blanditiis praesentium voluptatum</li>
          </ol>
        </section>
      </div>
    `,
  },
  {
    heading: "Wilson v Council [2024] HCA 104",
    subheading:
      "Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit.",
    details: `
      <div class="legal-case">
        <h1>Wilson v Council [2024] HCA 104</h1>
        <section>
          <h2>Analysis</h2>
          <p>Nam libero tempore, cum soluta nobis est eligendi optio cumque nihil impedit quo minus id quod maxime placeat.</p>
        </section>
      </div>
    `,
  },
  {
    heading: "Taylor v Industry Ltd [2024] HCA 105",
    subheading:
      "Temporibus autem quibusdam et aut officiis debitis aut rerum necessitatibus saepe eveniet.",
    details: `
      <div class="legal-case">
        <h1>Taylor v Industry Ltd [2024] HCA 105</h1>
        <section>
          <h2>Findings</h2>
          <ul>
            <li>Itaque earum rerum hic tenetur a sapiente delectus</li>
            <li>Ut aut reiciendis voluptatibus maiores alias consequatur</li>
          </ul>
        </section>
      </div>
    `,
  },
  {
    heading: "Anderson v Board [2024] HCA 106",
    subheading:
      "Et harum quidem rerum facilis est et expedita distinctio nam libero tempore.",
    details: `
      <div class="legal-case">
        <h1>Anderson v Board [2024] HCA 106</h1>
        <section>
          <h2>Implications</h2>
          <p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur.</p>
        </section>
      </div>
    `,
  },
  {
    heading: "Martin v Institute [2024] HCA 107",
    subheading:
      "Quis autem vel eum iure reprehenderit qui in ea voluptate velit esse quam nihil molestiae.",
    details: `
      <div class="legal-case">
        <h1>Martin v Institute [2024] HCA 107</h1>
        <section>
          <h2>Conclusion</h2>
          <p>Neque porro quisquam est, qui dolorem ipsum quia dolor sit amet, consectetur, adipisci velit.</p>
        </section>
      </div>
    `,
  },
];

function HomeContent() {
  const { userId } = useAuth();

  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");

  const [isGenerating, setIsGenerating] = useState(false);
  const {
    messages,
    input,
    handleInputChange,
    handleSubmit,
    isLoading,
    reload,
    setMessages,
  } = useChat({
    api: "api/chat",
    id: chatId ?? undefined,
    onResponse(response) {
      if (response) {
        console.log(response);
        setIsGenerating(false);
        setIsGettingSearchResults(true);
      }
    },
    onFinish(res) {
      console.log("Res:", res);
      const sources = res.parts
        ?.filter((part) => part.type === "source")
        .map((part) => part.source);

      console.log("Sources:", sources);
      if (!sources) return;

      if (!openViews.includes("results")) {
        const newViews = [...openViews];
        newViews.splice(1, 0, "results");
        setOpenViews(newViews);
      }

      const searchResultsToSet: SearchResultType[] = sources
        .slice(0, sampleSearchResults.length)
        .map((source, i) => ({
          heading: sampleSearchResults[i].heading,
          subheading: sampleSearchResults[i].subheading,
          details: sampleSearchResults[i].details,
          source,
        }));

      setSearchResults(searchResultsToSet);
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
  const [searchResults, setSearchResults] = useState<SearchResultType[]>([]);
  const [currentDetails, setCurrentDetails] = useState<string>();
  const [isGettingSearchResults, setIsGettingSearchResults] = useState(false);
  const [isGettingCurrentDetails, setIsGettingCurrentDetails] = useState(false);
  const [userChats, setUserChats] = useState<SelectChat[]>([]);
  const [currentReference, setCurrentReference] = useState<{
    text: string;
    url: string;
  } | null>(null);

  useEffect(() => {
    if (messagesRef.current) {
      messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }
  }, [messages]);

  const fetchMessages = useCallback(
    async (chatId: number) => {
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

  useEffect(() => {
    function fetchChat() {
      if (!chatId) return;
      fetchMessages(parseInt(chatId));
    }
    fetchChat();
  }, [chatId, fetchMessages]);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
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
    if (searchResults.length > 1) {
      setOpenViews(["chat", "results"]);
    }
  }, [searchResults]);

  async function getArticleDetails(article: string) {
    setIsGettingCurrentDetails(true);
    if (!openViews.includes("details")) setOpenViews([...openViews, "details"]);
    await sleep();
    setCurrentDetails(article);
    setIsGettingCurrentDetails(false);
  }

  useEffect(() => {
    if (!currentDetails) return;
    setOpenViews((prev) => {
      if (!prev.includes("details")) {
        return [...prev, "details"];
      }
      return prev;
    });
  }, [currentDetails]);

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
                    searchResults={searchResults}
                    getArticleDetails={getArticleDetails}
                    isGettingSearchResults={isGettingSearchResults}
                    hidePanel={hidePanel}
                    setCurrentReference={setCurrentReference}
                  />
                );
              case "details":
                return (
                  <DetailsPanel
                    key={view}
                    view={view}
                    currentDetails={currentDetails}
                    isGettingCurrentDetails={isGettingCurrentDetails}
                    hidePanel={hidePanel}
                    currentReference={currentReference}
                  />
                );
            }
          })}
        </AnimatePresence>
      </div>
    </main>
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
