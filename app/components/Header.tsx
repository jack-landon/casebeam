"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import FloatingWindow from "./FloatingWindow";
import Notepad from "./wysiwyg/Notepad";
import { ChatHistoryDrawer } from "./ChatHistoryDrawer";
import { useUserData } from "./providers/UserDataProvider";
import { useSearchParams } from "next/navigation";
import DarkModeSwitch from "./DarkModeSwitch";

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isNotepadOpen, setIsNotepadOpen] = useState(false);
  const { userData } = useUserData();
  const searchParams = useSearchParams();
  const currentChatId = searchParams.get("id");

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-10 transition-colors duration-200 ${
        isScrolled ? "bg-gray-950 border-b" : "bg-transparent"
      }`}
    >
      <div className=" container mx-auto px-4 md:px-6 lg:px-8">
        <header className="flex h-16 w-full shrink-0 items-center px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Link href="/" className="mr-6 hidden lg:flex" prefetch={false}>
              {/* <Bird className="h-6 w-6" /> */}
              <img
                src="/brand/icon-black-circle.png"
                alt=""
                className="h-9 w-10 dark:hidden"
              />
              <img
                src="/brand/icon-white-circle.png"
                alt=""
                className="h-9 w-10 hidden dark:block"
              />
              <span className="sr-only">Car E-commerce</span>
            </Link>

            <SignedIn>
              <div className="flex items-center gap-2">
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="justify-self-end px-2 py-1 text-xs cursor-pointer"
                >
                  <Link href="/dashboard" prefetch={false}>
                    Dashboard
                  </Link>
                </Button>
                <Button
                  asChild
                  size="sm"
                  variant="outline"
                  className="justify-self-end px-2 py-1 text-xs cursor-pointer"
                >
                  <Link href="/" prefetch={false}>
                    Chat
                  </Link>
                </Button>
              </div>
            </SignedIn>
          </div>
          <div className="ml-auto flex gap-2">
            <SignedIn>
              <UserButton />
              <Button
                variant="outline"
                className="justify-self-end px-2 py-1 text-xs cursor-pointer"
                onClick={() => {
                  setIsNotepadOpen(!isNotepadOpen);
                }}
              >
                {isNotepadOpen ? "Hide Notepad" : "Open Notepad"}
              </Button>
              {userData?.chats && currentChatId && (
                <ChatHistoryDrawer
                  chats={userData?.chats}
                  text={`Past Chats`}
                  className="text-xs"
                />
              )}
            </SignedIn>

            <SignedOut>
              <Button
                asChild
                variant="outline"
                className="justify-self-end px-2 py-1 text-xs cursor-pointer"
              >
                <Link href="/sign-in">Login</Link>
              </Button>
              <Button
                asChild
                className="justify-self-end px-2 py-1 text-xs cursor-pointer"
              >
                <Link href="/sign-up">Sign Up</Link>
              </Button>
            </SignedOut>
            <DarkModeSwitch />
          </div>
        </header>
      </div>
      <FloatingWindow
        initialWidth={400}
        initialHeight={300}
        isNotepadOpen={isNotepadOpen}
        setIsNotepadOpen={setIsNotepadOpen}
      >
        <Notepad />
      </FloatingWindow>
    </div>
  );
}
