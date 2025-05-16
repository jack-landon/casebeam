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
import { useUserData } from "./providers/UserDataProvider";
import { useEditor } from "novel";

export function NotepadMenuBar() {
  const { userData } = useUserData();
  const { setCurrentNote, editorRef } = useCurrentNote();
  const [isNewNoteModalOpen, setIsNewNoteModalOpen] = useState(false);
  const { editor } = useEditor();

  async function handleOpenNote(noteId: number) {
    const fetchedNote = await getNote(noteId);
    if (!fetchedNote) return toast.error("Note not found");

    console.log("Current Editor: ", editor);

    console.log("Fetched note content:", fetchedNote.content);
    setCurrentNote(fetchedNote);

    editorRef.current?.commands.setContent(JSON.parse(fetchedNote.content));
  }

  return (
    <Menubar className="mt-2">
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer">File</MenubarTrigger>
        <MenubarContent>
          <MenubarItem>
            New Tab <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
          <MenubarItem>
            New Window <MenubarShortcut>⌘N</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled>New Incognito Window</MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Open</MenubarSubTrigger>
            <MenubarSubContent>
              {userData?.notes.map((note) => (
                <MenubarItem
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
                </MenubarItem>
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
                <CreateNewNoteModal
                  isNewNoteModalOpen={isNewNoteModalOpen}
                  setIsNewNoteModalOpen={setIsNewNoteModalOpen}
                />
              </Dialog>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>
            Print... <MenubarShortcut>⌘P</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger className="cursor-pointer">Edit</MenubarTrigger>
        <MenubarContent>
          <MenubarItem
          // onClick={() => editor?.commands.undo()}
          // disabled={!editor?.can().undo()}
          >
            Undo <MenubarShortcut>⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarItem
          // onClick={() => editor?.commands.redo()}
          // disabled={!editor?.can().redo()}
          >
            Redo <MenubarShortcut>⇧⌘Z</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarSub>
            <MenubarSubTrigger>Find</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem>Search the web</MenubarItem>
              <MenubarSeparator />
              <MenubarItem>Find...</MenubarItem>
              <MenubarItem>Find Next</MenubarItem>
              <MenubarItem>Find Previous</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
          <MenubarSeparator />
          <MenubarItem>Cut</MenubarItem>
          <MenubarItem>Copy</MenubarItem>
          <MenubarItem>Paste</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      {/* <MenubarMenu>
        <MenubarTrigger>View</MenubarTrigger>
        <MenubarContent>
          <MenubarCheckboxItem>Always Show Bookmarks Bar</MenubarCheckboxItem>
          <MenubarCheckboxItem checked>
            Always Show Full URLs
          </MenubarCheckboxItem>
          <MenubarSeparator />
          <MenubarItem inset>
            Reload <MenubarShortcut>⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarItem disabled inset>
            Force Reload <MenubarShortcut>⇧⌘R</MenubarShortcut>
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Toggle Fullscreen</MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Hide Sidebar</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      <MenubarMenu>
        <MenubarTrigger>Profiles</MenubarTrigger>
        <MenubarContent>
          <MenubarRadioGroup value="benoit">
            <MenubarRadioItem value="andy">Andy</MenubarRadioItem>
            <MenubarRadioItem value="benoit">Benoit</MenubarRadioItem>
            <MenubarRadioItem value="Luis">Luis</MenubarRadioItem>
          </MenubarRadioGroup>
          <MenubarSeparator />
          <MenubarItem inset>Edit...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem inset>Add Profile...</MenubarItem>
        </MenubarContent>
      </MenubarMenu> */}
    </Menubar>
  );
}

function CreateNewNoteModal({
  setIsNewNoteModalOpen,
}: {
  isNewNoteModalOpen: boolean;
  setIsNewNoteModalOpen: (open: boolean) => void;
}) {
  const { setCurrentNote } = useCurrentNote();

  const [newNoteNameInput, setNewNoteNameInput] = useState("");
  const [isSavingNewNote, setIsSavingNewNote] = useState(false);
  const [newNoteColor, setNewNoteColor] =
    useState<(typeof colorList)[number]>("bg-green-500");

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
        content: JSON.stringify(defaultEditorContent),
      });
      setCurrentNote(newNote);
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
  return (
    <DialogContent className="sm:max-w-md">
      <DialogHeader>
        <DialogTitle>Create New Note</DialogTitle>
        <DialogDescription>
          This will create a fresh note with the title you provide.
        </DialogDescription>
      </DialogHeader>
      <div className="flex items-center space-x-2">
        <ColorPickerDropdown color={newNoteColor} setColor={setNewNoteColor} />
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
          <Button type="button" variant="secondary" className="cursor-pointer">
            Close
          </Button>
        </DialogClose>
      </DialogFooter>
    </DialogContent>
  );
}
