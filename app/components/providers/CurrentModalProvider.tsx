"use client";

import { createContext, useContext, useState } from "react";

type ModalTypes = "newProject" | "newCategory";

type CurrentModalContextType = {
  currentModal: ModalTypes | null;
  setCurrentModal: React.Dispatch<React.SetStateAction<ModalTypes | null>>;
};

export const CurrentModalContext = createContext<CurrentModalContextType>({
  currentModal: null,
  setCurrentModal: () => {},
});

export const useCurrentModal = () => useContext(CurrentModalContext);

export const CurrentModalProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [currentModal, setCurrentModal] =
    useState<CurrentModalContextType["currentModal"]>(null);

  return (
    <CurrentModalContext.Provider value={{ currentModal, setCurrentModal }}>
      {children}
    </CurrentModalContext.Provider>
  );
};
