import { Button } from "@/components/ui/button";
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
import { useCurrentNote } from "./providers/CurrentNoteProvider";
import { useState } from "react";
import { colorList } from "@/lib/utils";
import { getNote } from "@/lib/db/queries/query";
import { toast } from "sonner";
import { createNewNote } from "@/lib/db/queries/insert";
import { ColorPickerDropdown } from "./ColorPickerDropdown";
import Loader from "./Loader";

type Props = {
  children: React.ReactNode;
  isNewNoteModalOpen: boolean;
  setIsNewNoteModalOpen: (open: boolean) => void;
};

export default function NewNoteModal({
  children,
  isNewNoteModalOpen,
  setIsNewNoteModalOpen,
}: Props) {
  const { setCurrentNote, setSaveStatus, editorRef } = useCurrentNote();

  const [newNoteNameInput, setNewNoteNameInput] = useState("");
  const [isCreatingNewNote, setIsCreatingNewNote] = useState(false);
  const [newNoteColor, setNewNoteColor] =
    useState<(typeof colorList)[number]>("bg-green-500");

  async function handleOpenNote(noteId: number) {
    const fetchedNote = await getNote(noteId);
    if (!fetchedNote) return toast.error("Note not found");

    setCurrentNote(fetchedNote);
  }

  async function handleCreateNote() {
    if (!newNoteNameInput) return toast.error("Note name is required");
    if (isCreatingNewNote) return toast.error("Note is already being created");
    try {
      setIsCreatingNewNote(true);

      const defaultEditorContent = {
        type: "doc",
        content: [
          {
            type: "paragraph",
            content: [
              {
                type: "text",
                text: `Start typing the ${newNoteNameInput} note here...`,
              },
            ],
          },
        ],
      };

      const newNote = await createNewNote({
        name: newNoteNameInput,
        color: newNoteColor,
        content: !editorRef.current
          ? JSON.stringify(defaultEditorContent)
          : JSON.stringify(editorRef.current.getJSON()),
      });
      setCurrentNote(newNote);
      handleOpenNote(newNote.id);
      toast.success("Note created successfully");
      setNewNoteNameInput("");
      setIsNewNoteModalOpen(false);
      setSaveStatus("Saved");
    } catch (error) {
      console.error("Error creating note:", error);
      toast.error("Error creating note");
    } finally {
      setIsCreatingNewNote(false);
      setNewNoteNameInput("");
    }
  }
  return (
    <Dialog open={isNewNoteModalOpen} onOpenChange={setIsNewNoteModalOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
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
            {isCreatingNewNote ? <Loader size="sm" /> : <span>Save</span>}
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
  );
}
