"use client";

import { useEffect, useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { ChevronDown, Plus } from "lucide-react";
import { SelectNote } from "@/lib/db/schema";
import { useCurrentNote } from "./contexts/CurrentNoteContext";
import { getNote, getUserNotes } from "@/lib/db/queries/query";
import { toast } from "sonner";
import { useUser } from "@clerk/nextjs";
import { colorList } from "@/lib/utils";
import { createNewNote } from "@/lib/db/queries/insert";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import Loader from "./Loader";
import { ColorPickerDropdown } from "./ColorPickerDropdown";
import dayjs from "dayjs";

export function NotepadMenuBar() {
  const { currentNote, setCurrentNote } = useCurrentNote();
  const [userNotes, setUserNotes] = useState<SelectNote[]>([]);
  const { user } = useUser();
  const [newNoteNameInput, setNewNoteNameInput] = useState("");
  const [isSavingNewNote, setIsSavingNewNote] = useState(false);
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const [newNoteColor, setNewNoteColor] =
    useState<(typeof colorList)[number]>("bg-green-500");

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
    if (!newNoteNameInput) return toast.error("Note name is required");
    if (isSavingNewNote) return toast.error("Note is already being created");
    try {
      setIsSavingNewNote(true);
      const newNote = await createNewNote({
        name: newNoteNameInput,
        color: newNoteColor,
        content: "",
      });
      setUserNotes(await getUserNotes());
      handleOpenNote(newNote.id);
      toast.success("Note created successfully");
      setNewNoteNameInput("");
      setIsNewNoteModalOpen(false);
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Error creating note");
    } finally {
      setIsSavingNewNote(false);
      setNewNoteNameInput("");
    }
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
              <div className={`w-3 h-3 rounded-full mr-2 ${note.color}`} />
              <div className="">
                <p>{note.name}</p>
                <p className="text-xs font-extralight text-muted-foreground">
                  {dayjs(note.updatedAt).format("ddd D MMM YY")}
                </p>
              </div>
            </DropdownMenuItem>
          ))}
          <Dialog
            open={isNewNoteModalOpen}
            onOpenChange={setIsNewNoteModalOpen}
          >
            <DialogTrigger asChild>
              <Button
                variant="ghost"
                className="w-full flex justify-start items-center cursor-pointer"
              >
                <Plus className="h-3 w-3 mr-2" />
                <span>Create New</span>
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Note</DialogTitle>
                <DialogDescription>
                  This will create a fresh note with the title you provide.
                </DialogDescription>
              </DialogHeader>
              <div className="flex items-center space-x-2">
                <ColorPickerDropdown
                  color={newNoteColor}
                  setColor={setNewNoteColor}
                />
                <div className="grid flex-1 gap-2">
                  <Input
                    id="link"
                    value={newNoteNameInput}
                    onChange={(e) => setNewNoteNameInput(e.target.value)}
                    placeholder="Enter note name"
                  />
                </div>
                <Button
                  onClick={handleCreateNote}
                  type="submit"
                  size="sm"
                  className="px-3 cursor-pointer"
                >
                  {isSavingNewNote ? <Loader size="sm" /> : <span>Save</span>}
                </Button>
              </div>
              <DialogFooter className="sm:justify-start">
                <DialogClose asChild>
                  <Button
                    type="button"
                    variant="secondary"
                    className="cursor-pointer"
                  >
                    Close
                  </Button>
                </DialogClose>
              </DialogFooter>
            </DialogContent>
          </Dialog>
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
