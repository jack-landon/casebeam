"use client";

import { useContext, useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import { SelectNote } from "@/lib/db/schema";
import { CurrentNoteContext } from "./CurrentNoteProvider";
import { getNote, getUserNotes } from "@/lib/db/queries/query";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { generateRandomColor } from "@/lib/utils";
import { createNewNote } from "@/lib/db/queries/insert";

export function NotepadMenuBar({
  setCurrentNote,
}: {
  setCurrentNote: (note: SelectNote | null) => void;
}) {
  const currentNote = useContext(CurrentNoteContext);
  const [userNotes, setUserNotes] = useState<SelectNote[]>([]);
  const { user } = useUser();

  // const handleSaveNote = (noteId: string) => {
  //   console.log(`Saving note: ${noteId}`);
  //   // Implement actual save functionality here
  // };

  async function handleOpenNote(noteId: number) {
    const fetchedNote = await getNote(noteId);
    if (!fetchedNote) return toast.error("Note not found");

    setCurrentNote(fetchedNote);
  }

  async function handleCreateNote() {
    const noteName = prompt("Enter note name:");
    if (!noteName) return toast.error("Note name is required");
    // const noteColor = generateRandomColor();
    const newNote = await createNewNote({
      name: noteName,
      content: "",
    });
    setUserNotes(await getUserNotes());
    handleOpenNote(newNote.id);
  }

  useEffect(() => {
    if (!user?.id) return;
    async function fetchUserNotes() {
      setUserNotes(await getUserNotes());
    }
    fetchUserNotes();
  }, [user?.id]);

  return (
    <div className="flex space-x-2">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm" className="cursor-pointer">
            Notepad <ChevronDown className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="start" className="w-56">
          {userNotes.map((note) => (
            <DropdownMenuItem
              key={`open-${note.id}`}
              onClick={() => handleOpenNote(note.id)}
              className="flex items-center cursor-pointer"
            >
              <div
                className={`w-3 h-3 rounded-full mr-2 ${generateRandomColor()}`}
              />
              <span>{note.name}</span>
            </DropdownMenuItem>
          ))}
          <DropdownMenuItem
            key={`create-new-note`}
            onClick={() => handleCreateNote()}
            className="flex items-center cursor-pointer"
          >
            <Plus className="h-3 w-3 mr-2" />
            <span>Create New</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {currentNote && (
        <div className="items-center ml-2">
          {/* <div className={`w-3 h-3 rounded-full mr-2 ${currentNote.color}`} /> */}
          <p className="">{currentNote.name}</p>
          <p className="italic text-xs text-muted-foreground">Unsaved</p>
        </div>
      )}
    </div>
  );
}
