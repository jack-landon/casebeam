"use client";

import { getChat } from "@/lib/db/queries/query";
import { useSearchParams } from "next/navigation";
import { createContext, useContext, useEffect, useState } from "react";

type CurrentChatContextType = {
  currentChat: Awaited<ReturnType<typeof getChat>> | null;
  setCurrentChat: React.Dispatch<
    React.SetStateAction<CurrentChatContextType["currentChat"]>
  >;
  isLoadingCurrentChat: boolean;
  refreshCurrentChat: (chatId: string) => Promise<void>;
  visibleMessageId: string | null;
  setVisibleMessageId: React.Dispatch<
    React.SetStateAction<CurrentChatContextType["visibleMessageId"]>
  >;
};

export const CurrentChatContext = createContext<CurrentChatContextType>({
  currentChat: null,
  setCurrentChat: () => {},
  isLoadingCurrentChat: false,
  refreshCurrentChat: async () => {},
  visibleMessageId: null,
  setVisibleMessageId: () => {},
});

export const useCurrentChat = () => useContext(CurrentChatContext);

export const CurrentChatProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentChat, setCurrentChat] =
    useState<CurrentChatContextType["currentChat"]>(null);
  const [isLoadingCurrentChat, setIsLoadingCurrentChat] = useState(false);
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");
  const [visibleMessageId, setVisibleMessageId] = useState<string | null>(null);

  const refreshCurrentChat = async (chatId: string) => {
    setIsLoadingCurrentChat(true);
    try {
      const freshData = await getChat(chatId);
      console.log("Fetched chat data:", freshData);
      setCurrentChat(freshData);
    } catch (error) {
      console.error("Error fetching user data:", error);
    } finally {
      setIsLoadingCurrentChat(false);
    }
  };

  useEffect(() => {
    console.log("Current chat ID:", chatId);
    if (chatId) {
      refreshCurrentChat(chatId);
    }
  }, [chatId]);

  return (
    <CurrentChatContext.Provider
      value={{
        currentChat,
        setCurrentChat,
        isLoadingCurrentChat,
        refreshCurrentChat,
        visibleMessageId,
        setVisibleMessageId,
      }}
    >
      {children}
    </CurrentChatContext.Provider>
  );
};
