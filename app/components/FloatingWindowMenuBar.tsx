"use client";

import { useState } from "react";
import {
  Menubar,
  MenubarContent,
  MenubarItem,
  MenubarMenu,
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarTrigger,
} from "@/components/ui/menubar";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useCurrentNote } from "./providers/CurrentNoteProvider";
import { getNote } from "@/lib/db/queries/query";
import { toast } from "sonner";
import dayjs from "dayjs";
import { useUserData } from "./providers/UserDataProvider";
import NewNoteModal from "./NewNoteModal";

export function NotepadMenuBar() {
  const { userData } = useUserData();
  const { setCurrentNote, editorRef } = useCurrentNote();
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);

  async function handleOpenNote(noteId: number) {
    const fetchedNote = await getNote(noteId);
    if (!fetchedNote) return toast.error("Note not found");

    console.log("Fetched note content:", fetchedNote.content);
    setCurrentNote(fetchedNote);

    editorRef.current?.commands.setContent(JSON.parse(fetchedNote.content));
  }

  return (
    <Menubar className="mt-2">
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer">File</MenubarTrigger>
        <MenubarContent>
          <NewNoteModal
            isNewNoteModalOpen={isNewNoteModalOpen}
            setIsNewNoteModalOpen={setIsNewNoteModalOpen}
          >
            <Button
              variant="ghost"
              className="w-full flex justify-start items-center cursor-pointer px-2 font-normal"
            >
              <span>{!editorRef.current ? "New Note" : "Save As..."}</span>
            </Button>
          </NewNoteModal>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Open</MenubarSubTrigger>
            <MenubarSubContent>
              {userData?.notes.map((note) => (
                <MenubarItem
                  key={`open-${note.id}`}
                  onClick={() => handleOpenNote(note.id)}
                  className="flex items-center cursor-pointer group"
                >
                  <div className={`w-3 h-3 rounded-full mr-2 ${note.color}`} />
                  <div className="">
                    <p>{note.name}</p>
                    <p className="text-xs font-extralight text-muted-foreground dark:group-hover:text-primary-foreground">
                      {dayjs(note.updatedAt).format("ddd D MMM YY")}
                    </p>
                  </div>
                </MenubarItem>
              ))}
              <NewNoteModal
                isNewNoteModalOpen={isNewNoteModalOpen}
                setIsNewNoteModalOpen={setIsNewNoteModalOpen}
              >
                <Button
                  variant="ghost"
                  className="w-full flex justify-start items-center cursor-pointer"
                >
                  <Plus className="h-3 w-3 mr-2" />
                  <span>Create New</span>
                </Button>
              </NewNoteModal>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer">Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem
            className="cursor-pointer"
            onClick={() => editorRef.current?.commands.undo()}
            disabled={!editorRef.current?.can().undo()}
          >
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
            className="cursor-pointer"
            onClick={() => editorRef.current?.commands.redo()}
            disabled={!editorRef.current?.can().redo()}
          >
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem
            className="cursor-pointer"
            onClick={() => {
              if (!editorRef.current) return;
              window.navigator.clipboard.writeText(editorRef.current.getText());
            }}
          >
            Copy Note To Clipboard
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
}
