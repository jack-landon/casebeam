"use client";

import { useEffect } from "react";
import { ArrowLeft, MoreHorizontal, Printer } from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import dayjs from "dayjs";
import { getNote } from "@/lib/db/queries/query";
import { toast } from "sonner";
import Notepad from "@/components/wysiwyg/Notepad";
import { useCurrentNote } from "@/components/providers/CurrentNoteProvider";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default function NotePage({ params }: PageProps) {
  const { currentNote, setCurrentNote, saveStatus, editorRef } =
    useCurrentNote();

  useEffect(() => {
    async function fetchData() {
      const noteId = await params.then((res) => res.id);
      const fetchedNote = await getNote(parseInt(noteId));

      if (!fetchedNote) return toast.error("Note not found");

      setCurrentNote(fetchedNote ?? null);

      editorRef.current?.commands.setContent(JSON.parse(fetchedNote.content));
    }
    fetchData();
  }, []);

  return (
    <div className="flex min-h-screen flex-col">
      <div className="container mx-auto max-w-6xl py-6 px-4">
        <div className="lg:hidden flex items-center">
          <Button variant="ghost" size="icon" asChild className="mr-2">
            <Link href="/dashboard?tab=notes" prefetch={false}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          <Badge variant={"secondary"}>Note</Badge>
        </div>
        <div className="mb-6 flex items-center">
          <Button
            variant="ghost"
            size="icon"
            asChild
            className="hidden lg:flex mr-2"
          >
            <Link href="/dashboard?tab=notes" prefetch={false}>
              <ArrowLeft className="h-4 w-4" />
              <span className="sr-only">Back</span>
            </Link>
          </Button>
          {currentNote && (
            <div>
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold font-lora">
                  {currentNote.name}
                </h1>
                <Badge variant={"secondary"} className="hidden lg:flex">
                  Note
                </Badge>
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground mr-2">
                <span className="mr-2">
                  Last Updated{" "}
                  {dayjs(currentNote.updatedAt).format("DD MMM YYYY")}
                </span>
                <span>{saveStatus}</span>
              </div>
            </div>
          )}
          <div className="ml-auto flex gap-2">
            <Button
              onClick={() => window.print()}
              variant="outline"
              className="hidden lg:flex gap-1 cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print</span>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button className="cursor-pointer">
                  <span className="text-xs lg:text-base">Actions</span>
                  <MoreHorizontal className="ml-1 h-2 w-2 lg:ml-2 lg:h-4 lg:w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => editorRef.current?.commands.undo()}
                  disabled={!editorRef.current?.can().undo()}
                >
                  Undo <DropdownMenuShortcut>⌘Z</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => editorRef.current?.commands.redo()}
                  disabled={!editorRef.current?.can().redo()}
                >
                  Redo <DropdownMenuShortcut>⇧⌘Z</DropdownMenuShortcut>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    if (!editorRef.current) return;
                    window.navigator.clipboard.writeText(
                      editorRef.current.getText()
                    );
                  }}
                >
                  Copy Note To Clipboard
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="lg:hidden cursor-pointer"
                  onClick={() => window.print()}
                >
                  Print
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        <Card>
          <CardContent>
            <Notepad />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
