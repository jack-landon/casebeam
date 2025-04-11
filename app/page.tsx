"use client";

import { useChat } from "ai/react";
import { useCallback, useEffect, useRef, useState } from "react";
import { AnimatePresence } from "motion/react";
import ResultsPanel from "./components/ResultsPanel";
import DetailsPanel from "./components/DetailsPanel";
import ChatPanel from "./components/ChatPanel";
import { SelectCategory, SelectChat, SelectProject } from "./lib/db/schema";
import { getChat, getUserChats } from "./lib/db/queries/select";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { useAuth } from "@clerk/nextjs";
import { getProjectsFromDb, getUserCategoriesFromDb } from "./lib/actions";
import { InsertSearchResultWithExcerpts } from "./lib/types";

const panelOptions = ["chat", "results", "details"] as const;
export type View = (typeof panelOptions)[number];

type JSONValue = null | string | number | boolean | JSONObject | JSONArray;
type JSONObject = {
  [key: string]: JSONValue;
};
type JSONArray = JSONValue[];

const sampleSearchResults: InsertSearchResultWithExcerpts[] = [
  {
    title: "Director's Duties in Corporate Governance",
    docTitle: "ASIC v Hellicar [2012] HCA 17",
    docSummary:
      "Landmark case establishing the scope of directors' duties in Australia, particularly regarding due diligence and disclosure obligations in corporate communications.",
    relevanceSummary:
      "This case sets the standard for director responsibility in board decisions and corporate statements, emphasizing collective board responsibility.",
    url: "https://www.austlii.edu.au/cgi-bin/viewdoc/au/other/HCASum/2012/17.html",
    tags: ["directors duties", "corporate governance", "board responsibility"],
    excerpts: [
      {
        title: "Standard of Care Required from Directors",
        caseName: "Australian Securities and Investments Commission v Hellicar",
        content:
          "The High Court emphasized that directors cannot delegate their core responsibilities to management or advisers. Each director must apply their own mind to important corporate matters and exercise independent judgment.",
        url: "https://www.austlii.edu.au/cgi-bin/viewdoc/au/other/HCASum/2012/17.html#standard-of-care",
      },
      {
        title: "Board Minutes and Corporate Memory",
        caseName: "Australian Securities and Investments Commission v Hellicar",
        content:
          "The Court established that board minutes, once approved, serve as a prime record of board decisions and create a presumption about what occurred at meetings that directors must actively rebut if they dispute their accuracy.",
        url: "https://www.austlii.edu.au/cgi-bin/viewdoc/au/other/HCASum/2012/17.html#board-minutes",
      },
    ],
  },
  {
    title: "Trust Property and Fiduciary Obligations",
    docTitle: "Bofinger v Kingsway Group Ltd [2009] HCA 44",
    docSummary:
      "Key decision on the nature of trust property and the duties owed by trustees in complex financial arrangements.",
    relevanceSummary:
      "Important for understanding how courts treat trust assets and the obligations of trustees when dealing with third parties.",
    url: "https://www8.austlii.edu.au/cgi-bin/viewdoc/au/other/HCASum/2009/42.html",
    tags: ["trusts", "fiduciary duties", "property law"],
    excerpts: [
      {
        title: "Nature of Trust Property",
        caseName: "Bofinger v Kingsway Group Ltd",
        content:
          "The High Court confirmed that trust property retains its character as trust property even when dealing with third parties who have notice of the trust. This principle applies regardless of the complexity of the financial arrangements involved.",
        url: "https://www8.austlii.edu.au/cgi-bin/viewdoc/au/other/HCASum/2009/42.html#trust-property",
      },
      {
        title: "Trustee Obligations",
        caseName: "Bofinger v Kingsway Group Ltd",
        content:
          "Trustees must act with strict adherence to their duties when dealing with trust property, including maintaining proper accounts and ensuring clear separation of trust assets from personal assets.",
        url: "https://www8.austlii.edu.au/cgi-bin/viewdoc/au/other/HCASum/2009/42.html#obligations",
      },
    ],
  },
  {
    title: "Contract Formation in Digital Environments",
    docTitle: "Smythe v Thomas [2017] NSWSC 547",
    docSummary:
      "Modern case examining contract formation through online platforms and electronic communications.",
    relevanceSummary:
      "Sets precedent for how courts approach contract formation in digital contexts, particularly relevant for e-commerce and online transactions.",
    url: "https://www.mondaq.com/australia/contracts-and-commercial-law/56372/going-going-gone-online-auctions-and-smythe-v-thomas-2007-nswsc-844",
    tags: ["contract law", "digital contracts", "e-commerce"],
    excerpts: [
      {
        title: "Electronic Acceptance",
        caseName: "Smythe v Thomas",
        content:
          "The Court held that clicking an 'accept' button on a website can constitute valid acceptance of an offer, provided the terms are clearly displayed and the acceptance process is unambiguous.",
        url: "https://www.mondaq.com/australia/contracts-and-commercial-law/56372/going-going-gone-online-auctions-and-smythe-v-thomas-2007-nswsc-844#electronic-acceptance",
      },
      {
        title: "Notice Requirements",
        caseName: "Smythe v Thomas",
        content:
          "For digital contracts to be binding, reasonable steps must be taken to bring key terms to the user's attention before acceptance. Mere hyperlinks to terms may be insufficient without additional prominence.",
        url: "https://www.mondaq.com/australia/contracts-and-commercial-law/56372/going-going-gone-online-auctions-and-smythe-v-thomas-2007-nswsc-844#notice",
      },
    ],
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

      setSearchResults(sampleSearchResults);
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
  const [searchResults, setSearchResults] = useState<
    InsertSearchResultWithExcerpts[]
  >([]);
  const [currentDetails, setCurrentDetails] =
    useState<InsertSearchResultWithExcerpts>();
  const [isGettingSearchResults, setIsGettingSearchResults] = useState(false);
  const [isGettingCurrentDetails, setIsGettingCurrentDetails] = useState(false);
  const [userChats, setUserChats] = useState<SelectChat[]>([]);
  const [userProjects, setUserProjects] = useState<SelectProject[]>([]);
  const [userCategories, setUserCategories] = useState<SelectCategory[]>([]);

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
      fetchMessages(parseInt(chatId));
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

  async function getArticleDetails(
    searchResult: InsertSearchResultWithExcerpts
  ) {
    setIsGettingCurrentDetails(true);
    if (!openViews.includes("details")) setOpenViews([...openViews, "details"]);
    setCurrentDetails(searchResult);
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
                    userProjects={userProjects}
                    userCategories={userCategories}
                  />
                );
              case "details":
                return (
                  <DetailsPanel
                    key={view}
                    view={view}
                    currentDetails={searchResults[0]}
                    isGettingCurrentDetails={isGettingCurrentDetails}
                    hidePanel={hidePanel}
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
