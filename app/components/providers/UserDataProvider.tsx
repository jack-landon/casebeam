"use client";

import { createContext, useContext, useState } from "react";
import { getUserData } from "@/lib/db/queries/query";

export type UserData = Awaited<ReturnType<typeof getUserData>>;

type UserDataContextType = {
  userData: UserData | null;
  refreshUserData: () => Promise<void>;
};

export const UserDataContext = createContext<UserDataContextType>({
  userData: null,
  refreshUserData: async () => {},
});

export const useUserData = () => useContext(UserDataContext);

export function UserDataProvider({
  children,
  initialUserData = null,
}: {
  children: React.ReactNode;
  initialUserData: UserData | null;
}) {
  const [userData, setUserData] = useState(initialUserData);

  const refreshUserData = async () => {
    const freshData = await getUserData();
    setUserData(freshData);
  };

  return (
    <UserDataContext.Provider value={{ userData, refreshUserData }}>
      {children}
    </UserDataContext.Provider>
  );
}
