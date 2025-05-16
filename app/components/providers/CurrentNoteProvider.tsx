"use client";
import { SelectNote } from "@/lib/db/schema";
import { EditorInstance } from "novel";
import { createContext, useContext, useRef, useState } from "react";

type CurrentNoteContextType = {
  currentNote: SelectNote | null;
  setCurrentNote: React.Dispatch<React.SetStateAction<SelectNote | null>>;
  saveStatus: "Saved" | "Saving..." | "Unsaved";
  setSaveStatus: React.Dispatch<
    React.SetStateAction<"Saved" | "Saving..." | "Unsaved">
  >;
  editorRef: React.MutableRefObject<EditorInstance | null>; // Add this
};

export const CurrentNoteContext = createContext<CurrentNoteContextType>({
  currentNote: null,
  setCurrentNote: () => {},
  saveStatus: "Unsaved",
  setSaveStatus: () => {},
  editorRef: { current: null }, // Initialize with null
});

export const useCurrentNote = () => useContext(CurrentNoteContext);

export const CurrentNoteProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentNote, setCurrentNote] = useState<SelectNote | null>(null);
  const [saveStatus, setSaveStatus] = useState<
    "Saved" | "Saving..." | "Unsaved"
  >("Unsaved");
  const editorRef = useRef<EditorInstance | null>(null); // Initialize with null

  return (
    <CurrentNoteContext.Provider
      value={{
        currentNote,
        setCurrentNote,
        saveStatus,
        setSaveStatus,
        editorRef,
      }}
    >
      {children}
    </CurrentNoteContext.Provider>
  );
};
