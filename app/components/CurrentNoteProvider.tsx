import { SelectNote } from "@/lib/db/schema";
import { createContext } from "react";

export const CurrentNoteContext = createContext<SelectNote | null>(null);
