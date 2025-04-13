"use client";

import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { SelectChat } from "@/lib/db/schema";
import { History, Plus } from "lucide-react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

type ChatHistoryDrawerProps = {
  chats: SelectChat[];
  text?: string;
};

export function ChatHistoryDrawer({
  chats,
  text = "History",
}: ChatHistoryDrawerProps) {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("id");

  return (
    <div className="">
      <Sheet>
        <SheetTrigger asChild>
          <Button className="cursor-pointer" variant="outline">
            <History />
            {text}
          </Button>
        </SheetTrigger>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Chat History</SheetTitle>
            <SheetDescription>
              Kick off where you left off by selecting a chat from your history.
            </SheetDescription>
          </SheetHeader>
          {chats.length === 0 ? (
            <div className="flex items-center justify-center w-full h-full p-4 text-sm text-muted-foreground">
              No chats found.
            </div>
          ) : (
            <div className="flex flex-1 flex-col gap-2 p-2 overflow-y-auto border-y">
              {chats.map((chat) => (
                <Link
                  key={chat.id}
                  href={`/?id=${chat.id}`}
                  className={`flex items-center gap-2 px-2 py-1.5 cursor-pointer rounded-md transition ease-in-out ${
                    chatId && chatId == chat.id
                      ? "bg-accent text-accent-foreground"
                      : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                  }`}
                >
                  <span className="text-sm font-medium">{chat.name}</span>
                </Link>
              ))}
            </div>
          )}
          <SheetFooter>
            <SheetClose asChild>
              <Button asChild size="sm" className="cursor-pointer">
                <Link href="/">
                  <Plus /> New Chat
                </Link>
              </Button>
            </SheetClose>
          </SheetFooter>
        </SheetContent>
      </Sheet>
    </div>
  );
}
