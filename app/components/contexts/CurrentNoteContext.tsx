"use client";
import { SelectNote } from "@/lib/db/schema";
import { createContext, useContext, useState } from "react";

type CurrentNoteContextType = {
  currentNote: SelectNote | null;
  setCurrentNote: React.Dispatch<React.SetStateAction<SelectNote | null>>;
};

export const CurrentNoteContext = createContext<CurrentNoteContextType>({
  currentNote: null,
  setCurrentNote: () => {},
});

export const useCurrentNote = () => useContext(CurrentNoteContext);

export const CurrentNoteProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentNote, setCurrentNote] = useState<SelectNote | null>(null);

  return (
    <CurrentNoteContext.Provider value={{ currentNote, setCurrentNote }}>
      {children}
    </CurrentNoteContext.Provider>
  );
};
